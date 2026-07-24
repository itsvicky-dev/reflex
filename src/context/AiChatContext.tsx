import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

export type AiChatMessage = {
  id: string
  role: 'user' | 'ai'
  text: string
  contextLabel?: string
}

function generateAiReply(text: string, contextLabel?: string): string {
  const scope = contextLabel ? `for ${contextLabel}` : 'across your workspace'
  return `Based on the current data ${scope}, here's what stands out in response to "${text}": trends look broadly stable with no critical anomalies detected. Let me know if you'd like a deeper breakdown.`
}

type AiChatContextValue = {
  messages: AiChatMessage[]
  isThinking: boolean
  sendMessage: (text: string, contextLabel?: string) => void
  startNewChat: () => void
}

const AiChatContext = createContext<AiChatContextValue | null>(null)

export function AiChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AiChatMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const thinkingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  function sendMessage(text: string, contextLabel?: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const userMessage: AiChatMessage = { id: `u-${Date.now()}`, role: 'user', text: trimmed, contextLabel }
    setMessages((prev) => [...prev, userMessage])
    setIsThinking(true)
    clearTimeout(thinkingTimeoutRef.current)
    thinkingTimeoutRef.current = setTimeout(() => {
      const aiMessage: AiChatMessage = {
        id: `a-${Date.now()}`,
        role: 'ai',
        text: generateAiReply(trimmed, contextLabel),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsThinking(false)
    }, 700)
  }

  function startNewChat() {
    clearTimeout(thinkingTimeoutRef.current)
    setMessages([])
    setIsThinking(false)
  }

  const value = useMemo<AiChatContextValue>(
    () => ({ messages, isThinking, sendMessage, startNewChat }),
    [messages, isThinking],
  )

  return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>
}

export function useAiChat() {
  const ctx = useContext(AiChatContext)
  if (!ctx) throw new Error('useAiChat must be used within an AiChatProvider')
  return ctx
}
