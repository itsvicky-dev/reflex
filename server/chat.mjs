/**
 * POST /api/chat - streaming proxy to the OpenAI Chat Completions API.
 *
 * Responsibilities
 *  - keep the API key and the system prompt on the server (the browser never sees either)
 *  - validate / bound everything the browser sends (it is a public endpoint once deployed)
 *  - rate-limit per client so a shared demo URL cannot burn through the key
 *  - translate OpenAI's SSE stream into a tiny, stable protocol for the UI:
 *        data: {"t":"delta","v":"text"}   incremental text
 *        data: {"t":"done","usage":{...}} end of answer
 *        data: {"t":"error","message":""} terminal failure (user-safe message)
 */

import { SYSTEM_PROMPT } from './prompt.mjs'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

// Chosen by benchmarking the real prompts (see scripts/ai-smoke.mjs): gpt-5.4-mini at low reasoning effort got every
// figure right across the 19 cases with a ~1.5s first token and ~3.3s total, at mini-tier cost. gpt-5.5 is the more
// polished (but ~2x slower, higher-cost) alternative: set OPENAI_MODEL=gpt-5.5 to use it.
const DEFAULT_MODEL = 'gpt-5.4-mini'
const MAX_BODY_BYTES = 600_000
const MAX_KNOWLEDGE_CHARS = 160_000
const MAX_VIEW_CHARS = 20_000
const MAX_MESSAGES = 24
const MAX_MESSAGE_CHARS = 6_000
const MAX_OUTPUT_TOKENS = 4_000
const UPSTREAM_TIMEOUT_MS = 90_000

const RATE_LIMIT = { windowMs: 60_000, max: 24 }

/** @param {unknown} value */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** @param {import('node:http').IncomingMessage} req */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0
    let exceeded = false
    /** @type {Buffer[]} */
    const chunks = []
    req.on('data', (chunk) => {
      if (exceeded) return
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        // Answer 413 and close the connection; the rest of the oversized body is discarded, never buffered.
        exceeded = true
        chunks.length = 0
        reject(Object.assign(new Error('Request too large'), { status: 413 }))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (exceeded) return
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }))
      }
    })
    req.on('error', reject)
  })
}

/** @param {import('node:http').ServerResponse} res @param {number} status @param {unknown} payload */
function sendJson(res, status, payload) {
  if (res.headersSent) return
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    // After a rejected request the connection is closed, so an unread oversized body cannot linger.
    ...(status >= 400 ? { Connection: 'close' } : {}),
  })
  res.end(JSON.stringify(payload))
}

/** @param {import('node:http').ServerResponse} res @param {unknown} event */
function sendEvent(res, event) {
  if (res.writableEnded || res.destroyed) return
  res.write(`data: ${JSON.stringify(event)}\n\n`)
}

/** Sliding-window limiter, per client address. */
function createRateLimiter() {
  /** @type {Map<string, number[]>} */
  const hits = new Map()
  return function allow(/** @type {string} */ key) {
    const now = Date.now()
    const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs)
    if (recent.length >= RATE_LIMIT.max) {
      hits.set(key, recent)
      return false
    }
    recent.push(now)
    hits.set(key, recent)
    if (hits.size > 5_000) {
      for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_LIMIT.windowMs)) hits.delete(k)
    }
    return true
  }
}

/**
 * Behind a proxy (Render) the real client address is the LAST X-Forwarded-For entry: the proxy appends it, whereas
 * anything before it can be spoofed by the client to dodge the rate limit.
 * @param {import('node:http').IncomingMessage} req
 */
function clientKey(req) {
  const forwarded = req.headers['x-forwarded-for']
  const chain = (Array.isArray(forwarded) ? forwarded.join(',') : (forwarded ?? '')).split(',').map((part) => part.trim()).filter(Boolean)
  return chain[chain.length - 1] ?? req.socket.remoteAddress ?? 'unknown'
}

/** Validates and normalises the browser payload. Throws an Error with .status on bad input. */
function parseRequest(body) {
  if (!isRecord(body)) throw Object.assign(new Error('Invalid request'), { status: 400 })

  const rawMessages = Array.isArray(body.messages) ? body.messages : []
  const messages = rawMessages
    .filter((m) => isRecord(m) && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, MAX_MESSAGE_CHARS) }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_MESSAGES)

  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    throw Object.assign(new Error('The last message must come from the user'), { status: 400 })
  }

  const context = isRecord(body.context) ? body.context : {}
  const knowledge = typeof context.knowledge === 'string' ? context.knowledge.slice(0, MAX_KNOWLEDGE_CHARS) : ''
  const view = typeof context.view === 'string' ? context.view.slice(0, MAX_VIEW_CHARS) : ''

  return { messages, knowledge, view }
}

function isReasoningModel(model) {
  return /^(gpt-5|o\d)/i.test(model)
}

/** Maps upstream failures to messages that are safe to show to a client. */
function friendlyError(status) {
  if (status === 401 || status === 403) return 'The AI service could not authenticate. Please contact the administrator.'
  if (status === 429) return 'The AI service is busy or its quota is exhausted. Please try again in a moment.'
  if (status >= 500) return 'The AI service is temporarily unavailable. Please try again.'
  return 'The AI service could not complete this request.'
}

/**
 * @param {{ apiKey?: string, model?: string, reasoningEffort?: string }} options
 * @returns {(req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse) => Promise<void>}
 */
export function createChatHandler(options = {}) {
  const apiKey = options.apiKey?.trim()
  const model = options.model?.trim() || DEFAULT_MODEL
  const reasoningEffort = options.reasoningEffort?.trim() || 'low'
  const allow = createRateLimiter()

  return async function handleChat(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return sendJson(res, 405, { error: 'Method not allowed' })
    }

    if (!apiKey) {
      return sendJson(res, 503, {
        error: 'Reflex AI is not configured. Add OPENAI_API_KEY to the server environment (.env) and restart.',
      })
    }

    if (!allow(clientKey(req))) {
      res.setHeader('Retry-After', '30')
      return sendJson(res, 429, { error: 'You are sending messages too quickly. Please wait a few seconds.' })
    }

    let parsed
    try {
      parsed = parseRequest(await readJsonBody(req))
    } catch (error) {
      return sendJson(res, error.status ?? 400, { error: error.message })
    }

    // Order matters for OpenAI prompt caching: the large, stable prefix (instructions + workspace data)
    // comes first and only the small, changing parts (current view, conversation) come after it.
    const upstreamMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(parsed.knowledge ? [{ role: 'system', content: `WORKSPACE DATA\n\n${parsed.knowledge}` }] : []),
      ...(parsed.view ? [{ role: 'system', content: `CURRENT VIEW\n\n${parsed.view}` }] : []),
      ...parsed.messages,
    ]

    const payload = {
      model,
      messages: upstreamMessages,
      stream: true,
      stream_options: { include_usage: true },
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      ...(isReasoningModel(model) ? { reasoning_effort: reasoningEffort } : { temperature: 0.3 }),
    }

    const abort = new AbortController()
    const timeout = setTimeout(() => abort.abort(new Error('timeout')), UPSTREAM_TIMEOUT_MS)
    // Stop paying for tokens as soon as the user hits Stop / closes the tab.
    res.on('close', () => abort.abort(new Error('client closed')))

    let upstream
    try {
      upstream = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify(payload),
        signal: abort.signal,
      })
    } catch (error) {
      clearTimeout(timeout)
      if (abort.signal.aborted && !res.writableEnded && !res.destroyed) {
        return sendJson(res, 504, { error: 'The AI service took too long to respond. Please try again.' })
      }
      console.error('[reflex-ai] upstream request failed:', error?.message ?? error)
      return sendJson(res, 502, { error: 'Could not reach the AI service. Please try again.' })
    }

    if (!upstream.ok || !upstream.body) {
      clearTimeout(timeout)
      const detail = await upstream.text().catch(() => '')
      console.error(`[reflex-ai] upstream ${upstream.status}:`, detail.slice(0, 500))
      return sendJson(res, upstream.status === 401 ? 502 : upstream.status, { error: friendlyError(upstream.status) })
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    res.flushHeaders?.()

    const decoder = new TextDecoder()
    let buffer = ''
    let usage = null
    let finishReason = null

    try {
      for await (const chunk of upstream.body) {
        buffer += decoder.decode(chunk, { stream: true })
        let boundary
        while ((boundary = buffer.indexOf('\n\n')) !== -1) {
          const rawEvent = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)
          for (const line of rawEvent.split('\n')) {
            if (!line.startsWith('data:')) continue
            const data = line.slice(5).trim()
            if (!data || data === '[DONE]') continue
            let json
            try {
              json = JSON.parse(data)
            } catch {
              continue
            }
            const choice = json.choices?.[0]
            const text = choice?.delta?.content
            if (typeof text === 'string' && text.length > 0) sendEvent(res, { t: 'delta', v: text })
            if (choice?.finish_reason) finishReason = choice.finish_reason
            if (json.usage) usage = json.usage
          }
        }
      }
      sendEvent(res, {
        t: 'done',
        finishReason,
        usage: usage
          ? {
              prompt: usage.prompt_tokens,
              completion: usage.completion_tokens,
              cached: usage.prompt_tokens_details?.cached_tokens ?? 0,
            }
          : null,
      })
    } catch (error) {
      if (!abort.signal.aborted) {
        console.error('[reflex-ai] stream failed:', error?.message ?? error)
        sendEvent(res, { t: 'error', message: 'The connection to the AI service was interrupted. Please try again.' })
      }
    } finally {
      clearTimeout(timeout)
      if (!res.writableEnded) res.end()
    }
  }
}
