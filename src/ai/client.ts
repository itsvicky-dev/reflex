export class AiRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AiRequestError'
  }
}

export type ChatRequest = {
  messages: { role: 'user' | 'assistant'; content: string }[]
  knowledge: string
  view: string
  signal: AbortSignal
  onDelta: (text: string) => void
}

export type ChatResult = {
  finishReason: string | null
  usage: { prompt: number; completion: number; cached: number } | null
}

type StreamEvent =
  | { t: 'delta'; v: string }
  | { t: 'done'; finishReason?: string | null; usage?: ChatResult['usage'] }
  | { t: 'error'; message: string }

/** Streams a Reflex AI answer from /api/chat, calling onDelta with each piece of text as it arrives. */
export async function streamChat({ messages, knowledge, view, signal, onDelta }: ChatRequest): Promise<ChatResult> {
  let response: Response
  try {
    response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, context: { knowledge, view } }),
      signal,
    })
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error
    throw new AiRequestError('Could not reach Reflex AI. Check your connection and try again.')
  }

  if (!response.ok || !response.body) {
    let message = 'Reflex AI is unavailable right now. Please try again.'
    try {
      const payload = (await response.json()) as { error?: string }
      if (payload.error) message = payload.error
    } catch {
      // keep the default message
    }
    throw new AiRequestError(message)
  }

  // A real answer is an event stream. Anything else (an HTML page or an empty 200) means the request never reached the
  // AI server, e.g. the app was published as a static site that has no /api/chat.
  if (!(response.headers.get('content-type') ?? '').includes('text/event-stream')) {
    console.error(
      '[Reflex AI] /api/chat did not return an event stream. The app must run on the Node server (npm start) with OPENAI_API_KEY set; a static host cannot serve the AI API.',
    )
    throw new AiRequestError('Reflex AI is not available on this deployment yet: the AI service could not be reached.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let result: ChatResult = { finishReason: null, usage: null }
  let finished = false

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let boundary: number
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      for (const line of rawEvent.split('\n')) {
        if (!line.startsWith('data:')) continue
        let event: StreamEvent
        try {
          event = JSON.parse(line.slice(5).trim()) as StreamEvent
        } catch {
          continue
        }
        if (event.t === 'delta') onDelta(event.v)
        else if (event.t === 'error') throw new AiRequestError(event.message)
        else if (event.t === 'done') {
          finished = true
          result = { finishReason: event.finishReason ?? null, usage: event.usage ?? null }
        }
      }
    }
  }

  if (!finished) throw new AiRequestError('The response was interrupted. Please try again.')
  return result
}
