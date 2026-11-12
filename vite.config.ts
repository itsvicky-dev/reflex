import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createChatHandler } from './server/chat.mjs'

/**
 * Mounts the Reflex AI API on the Vite dev / preview server so `npm run dev` is all you need.
 * The key is read server-side with loadEnv(..., '') and, having no VITE_ prefix, is never exposed to the browser.
 */
function reflexAiApi(): Plugin {
  function mount(middlewares: import('vite').Connect.Server, mode: string) {
    const env = loadEnv(mode, process.cwd(), '')
    const chat = createChatHandler({
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL,
      reasoningEffort: env.OPENAI_REASONING_EFFORT,
    })

    middlewares.use('/api/health', (_req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: true, ai: Boolean(env.OPENAI_API_KEY) }))
    })

    middlewares.use('/api/chat', (req, res) => {
      chat(req, res).catch((error) => {
        console.error('[reflex-ai] unhandled error:', error)
        if (!res.headersSent) res.statusCode = 500
        res.end(JSON.stringify({ error: 'Unexpected server error' }))
      })
    })
  }

  return {
    name: 'reflex-ai-api',
    configureServer(server) {
      mount(server.middlewares, server.config.mode)
    },
    configurePreviewServer(server) {
      mount(server.middlewares, server.config.mode)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), reflexAiApi()],
})
