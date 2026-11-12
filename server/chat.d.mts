import type { IncomingMessage, ServerResponse } from 'node:http'

export type ChatHandlerOptions = {
  apiKey?: string
  model?: string
  reasoningEffort?: string
}

export function createChatHandler(options?: ChatHandlerOptions): (req: IncomingMessage, res: ServerResponse) => Promise<void>
