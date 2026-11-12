import { useEffect } from 'react'
import { useAiChat } from '../context/AiChatContext'

/**
 * Publishes what the user is looking at (selection, filters, items they placed) to Reflex AI, so that
 * "explain this payment" or "what's committed right now?" resolves against the live screen.
 *
 * `pageId` must match the id in src/ai/pages.ts. Publishing never re-renders anything.
 */
export function useAiPageState(pageId: string, state: unknown) {
  const { setLiveState } = useAiChat()
  const serialized = JSON.stringify(state)

  useEffect(() => {
    setLiveState(pageId, serialized === undefined ? null : JSON.parse(serialized))
  }, [pageId, serialized, setLiveState])
}
