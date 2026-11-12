/**
 * Production server: serves the built SPA from ./dist and the Reflex AI API.
 *
 *   npm run build && npm start
 *
 * Environment (a local .env file is loaded automatically; on Render set these in the dashboard):
 *   OPENAI_API_KEY   required for AI answers
 *   OPENAI_MODEL     optional, defaults to the model in server/chat.mjs
 *   PORT             optional, defaults to 8787
 */

import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createChatHandler } from './chat.mjs'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))
const distDir = join(root, 'dist')

try {
  process.loadEnvFile(join(root, '.env'))
} catch {
  // No .env file: rely on real environment variables (production).
}

const port = Number(process.env.PORT) || 8787

const chat = createChatHandler({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL,
  reasoningEffort: process.env.OPENAI_REASONING_EFFORT,
})

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
}

function serveFile(res, filePath, { immutable }) {
  res.writeHead(200, {
    'Content-Type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  })
  createReadStream(filePath).pipe(res)
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')

  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true, ai: Boolean(process.env.OPENAI_API_KEY) }))
    return
  }

  if (url.pathname === '/api/chat') {
    chat(req, res).catch((error) => {
      console.error('[reflex-ai] unhandled error:', error)
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Unexpected server error' }))
    })
    return
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' })
    res.end()
    return
  }

  // Static assets, with a traversal guard.
  let relative
  try {
    relative = normalize(decodeURIComponent(url.pathname))
  } catch {
    res.writeHead(400)
    res.end()
    return
  }
  const candidate = join(distDir, relative)
  if (candidate.startsWith(distDir + sep) && existsSync(candidate) && statSync(candidate).isFile()) {
    serveFile(res, candidate, { immutable: relative.includes(`${sep}assets${sep}`) })
    return
  }

  // Client-side routing fallback.
  const indexFile = join(distDir, 'index.html')
  if (existsSync(indexFile)) {
    serveFile(res, indexFile, { immutable: false })
    return
  }
  res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
  res.end('Build output not found. Run "npm run build" first.')
})

server.listen(port, () => {
  console.log(`Reflex running on http://localhost:${port}  (AI ${process.env.OPENAI_API_KEY ? 'enabled' : 'DISABLED - set OPENAI_API_KEY'})`)
})
