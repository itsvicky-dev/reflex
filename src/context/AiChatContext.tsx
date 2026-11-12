import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { AiRequestError, streamChat } from '../ai/client'
import { buildKnowledge, describeCustomer } from '../ai/knowledge'
import { customerIdFromPath, resolveAiPage, type AiPageInfo } from '../ai/pages'
import { toCopyText } from '../ai/parseBlocks'
import type { AiConversation, AiMessage } from '../ai/types'

const STORAGE_KEY = 'reflex.ai.conversations.v1'
const MAX_CONVERSATIONS = 30
const HISTORY_WINDOW = 14
const FLUSH_INTERVAL_MS = 40

/** Kept so existing imports of the old message type keep working. */
export type AiChatMessage = AiMessage

function uid(prefix: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}-${random}`
}

function loadConversations(): AiConversation[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AiConversation[]
    if (!Array.isArray(parsed)) return []
    // A reload while an answer was streaming leaves it half-written: mark it as stopped.
    return parsed.map((conversation) => ({
      ...conversation,
      messages: conversation.messages.map((message) =>
        message.status === 'streaming' ? { ...message, status: 'stopped' as const } : message,
      ),
    }))
  } catch {
    return []
  }
}

function saveConversations(conversations: AiConversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, MAX_CONVERSATIONS)))
  } catch {
    // storage full or unavailable: history just won't persist
  }
}

function makeTitle(text: string) {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length > 56 ? `${clean.slice(0, 55).trimEnd()}…` : clean
}

type SendOptions = { pageTitle?: string }

type AiChatContextValue = {
  conversations: AiConversation[]
  activeId: string | null
  messages: AiMessage[]
  isStreaming: boolean
  /** True between sending and the first token arriving. */
  isThinking: boolean
  /** The screen the AI is currently answering about (the page you were on, even when in the full-screen view). */
  viewPage: AiPageInfo | null
  /** Whether the current screen (and its live state) is shared with the model as context. */
  pageScope: boolean
  setPageScope: (value: boolean) => void
  sendMessage: (text: string, contextLabel?: string, options?: SendOptions) => void
  stop: () => void
  regenerate: () => void
  startNewChat: () => void
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  /** Pages publish what the user has selected / filtered so "explain this" resolves correctly. Does not re-render. */
  setLiveState: (key: string, value: unknown) => void
}

const AiChatContext = createContext<AiChatContextValue | null>(null)

export function AiChatProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const [conversations, setConversations] = useState<AiConversation[]>(loadConversations)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [streamingId, setStreamingId] = useState<string | null>(null)
  const [pageScope, setPageScope] = useState(true)
  const [appPath, setAppPath] = useState<string | null>(null)

  const conversationsRef = useRef(conversations)
  const activeIdRef = useRef<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const liveStateRef = useRef<Record<string, unknown>>({})
  const viewPathRef = useRef<string | null>(null)
  const pageScopeRef = useRef(pageScope)

  const onAiPage = pathname.startsWith('/reflex-ai')
  const viewPath = onAiPage ? appPath : pathname
  viewPathRef.current = viewPath
  pageScopeRef.current = pageScope
  activeIdRef.current = activeId

  useEffect(() => {
    conversationsRef.current = conversations
    const timer = window.setTimeout(() => saveConversations(conversations), 400)
    return () => window.clearTimeout(timer)
  }, [conversations])

  useEffect(() => {
    if (!pathname.startsWith('/reflex-ai')) setAppPath(pathname)
  }, [pathname])

  useEffect(() => () => abortRef.current?.abort(), [])

  const patchMessage = useCallback((conversationId: string, messageId: string, patch: Partial<AiMessage>) => {
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id !== conversationId
          ? conversation
          : {
              ...conversation,
              updatedAt: Date.now(),
              messages: conversation.messages.map((message) => (message.id === messageId ? { ...message, ...patch } : message)),
            },
      ),
    )
  }, [])

  const buildView = useCallback((contextLabel?: string): string => {
    const path = viewPathRef.current
    if (!pageScopeRef.current || !path) {
      return 'Screen: none shared. Answer from the whole workspace and say which screen each figure comes from.'
    }
    const page = resolveAiPage(path)
    const lines = [`Screen: ${page.title} (route ${path})`, `What is on screen: ${page.description}`]
    if (contextLabel) {
      lines.push(`The user launched the assistant from the "${contextLabel}" widget. Unless they say otherwise, the question is about that widget.`)
    }
    const customerId = customerIdFromPath(path)
    const customer = customerId ? describeCustomer(customerId) : null
    if (customer) lines.push(customer)
    const live = liveStateRef.current[page.id]
    if (live !== undefined && live !== null) {
      lines.push(`LIVE STATE (what the user currently has selected / filtered / placed on this screen):\n${JSON.stringify(live, null, 1)}`)
    }
    return lines.join('\n')
  }, [])

  const runAssistant = useCallback(
    async (conversationId: string, assistantId: string, history: AiMessage[], contextLabel?: string) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setStreamingId(assistantId)

      let pending = ''
      let timer: number | undefined
      let content = ''

      const flush = () => {
        timer = undefined
        if (!pending) return
        content += pending
        pending = ''
        patchMessage(conversationId, assistantId, { content })
      }

      const requestMessages = history
        .filter((message) => message.content.trim().length > 0 && message.status !== 'error')
        .slice(-HISTORY_WINDOW)
        .map((message) => ({
          role: message.role,
          content: message.role === 'assistant' ? toCopyText(message.content) : message.content,
        }))

      try {
        await streamChat({
          messages: requestMessages,
          knowledge: buildKnowledge(),
          view: buildView(contextLabel),
          signal: controller.signal,
          onDelta: (text) => {
            pending += text
            if (timer === undefined) timer = window.setTimeout(flush, FLUSH_INTERVAL_MS)
          },
        })
        window.clearTimeout(timer)
        flush()
        patchMessage(conversationId, assistantId, { status: 'done' })
      } catch (error) {
        window.clearTimeout(timer)
        flush()
        if ((error as Error).name === 'AbortError') {
          patchMessage(conversationId, assistantId, { status: 'stopped' })
        } else {
          const message = error instanceof AiRequestError ? error.message : 'Something went wrong while contacting Reflex AI.'
          patchMessage(conversationId, assistantId, { status: 'error', error: message })
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
          setStreamingId(null)
        }
      }
    },
    [buildView, patchMessage],
  )

  const sendMessage = useCallback(
    (text: string, contextLabel?: string, options?: SendOptions) => {
      const trimmed = text.trim()
      if (!trimmed) return

      const now = Date.now()
      const page = viewPathRef.current ? resolveAiPage(viewPathRef.current) : null
      const userMessage: AiMessage = {
        id: uid('u'),
        role: 'user',
        content: trimmed,
        contextLabel,
        pageTitle: options?.pageTitle ?? page?.title,
        createdAt: now,
      }
      const assistantMessage: AiMessage = { id: uid('a'), role: 'assistant', content: '', status: 'streaming', createdAt: now }

      let conversationId = activeIdRef.current
      const existing = conversationId ? conversationsRef.current.find((c) => c.id === conversationId) : undefined

      if (!existing) {
        conversationId = uid('c')
        const conversation: AiConversation = {
          id: conversationId,
          title: makeTitle(trimmed),
          createdAt: now,
          updatedAt: now,
          messages: [userMessage, assistantMessage],
        }
        setConversations((prev) => [conversation, ...prev].slice(0, MAX_CONVERSATIONS))
        setActiveId(conversationId)
        activeIdRef.current = conversationId
        void runAssistant(conversationId, assistantMessage.id, [userMessage], contextLabel)
      } else {
        const history = [...existing.messages, userMessage]
        setConversations((prev) =>
          prev.map((conversation) =>
            conversation.id === existing.id
              ? { ...conversation, updatedAt: now, messages: [...conversation.messages, userMessage, assistantMessage] }
              : conversation,
          ),
        )
        void runAssistant(existing.id, assistantMessage.id, history, contextLabel)
      }
    },
    [runAssistant],
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const regenerate = useCallback(() => {
    const conversation = conversationsRef.current.find((c) => c.id === activeIdRef.current)
    if (!conversation) return
    const lastUserIndex = conversation.messages.map((m) => m.role).lastIndexOf('user')
    if (lastUserIndex === -1) return
    const userMessage = conversation.messages[lastUserIndex]
    const assistantMessage: AiMessage = { id: uid('a'), role: 'assistant', content: '', status: 'streaming', createdAt: Date.now() }
    const kept = conversation.messages.slice(0, lastUserIndex + 1)
    setConversations((prev) =>
      prev.map((c) => (c.id === conversation.id ? { ...c, updatedAt: Date.now(), messages: [...kept, assistantMessage] } : c)),
    )
    void runAssistant(conversation.id, assistantMessage.id, kept, userMessage.contextLabel)
  }, [runAssistant])

  const startNewChat = useCallback(() => {
    abortRef.current?.abort()
    setActiveId(null)
    activeIdRef.current = null
    setPageScope(true)
  }, [])

  const selectConversation = useCallback((id: string) => {
    abortRef.current?.abort()
    setActiveId(id)
    activeIdRef.current = id
  }, [])

  const deleteConversation = useCallback((id: string) => {
    if (activeIdRef.current === id) {
      abortRef.current?.abort()
      setActiveId(null)
      activeIdRef.current = null
    }
    setConversations((prev) => prev.filter((conversation) => conversation.id !== id))
  }, [])

  const setLiveState = useCallback((key: string, value: unknown) => {
    liveStateRef.current[key] = value
  }, [])

  const active = conversations.find((conversation) => conversation.id === activeId)
  const messages = useMemo(() => active?.messages ?? [], [active])
  const lastMessage = messages[messages.length - 1]
  const isStreaming = streamingId !== null
  const isThinking = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content.length === 0
  const viewPage = viewPath ? resolveAiPage(viewPath) : null

  const value = useMemo<AiChatContextValue>(
    () => ({
      conversations,
      activeId,
      messages,
      isStreaming,
      isThinking,
      viewPage,
      pageScope,
      setPageScope,
      sendMessage,
      stop,
      regenerate,
      startNewChat,
      selectConversation,
      deleteConversation,
      setLiveState,
    }),
    [conversations, activeId, messages, isStreaming, isThinking, viewPage, pageScope, sendMessage, stop, regenerate, startNewChat, selectConversation, deleteConversation, setLiveState],
  )

  return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>
}

export function useAiChat() {
  const ctx = useContext(AiChatContext)
  if (!ctx) throw new Error('useAiChat must be used within an AiChatProvider')
  return ctx
}
