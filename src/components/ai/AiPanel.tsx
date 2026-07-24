import { clsx } from 'clsx'
import { ArrowLeft, History, LayoutGrid, Mic, PanelRightClose, Pencil, Plus, Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { aiPanelHistory } from '../../config/aiHistory'
import { allNavLinks } from '../../config/navigation'
import { useAiChat } from '../../context/AiChatContext'
import { IconButton } from '../ui/IconButton'

const suggestions = [
  'Predict cash flow for the next 30 days',
  'Find customers with increasing payment risk',
  'Explain why collections dropped this month',
  'Show invoices requiring immediate action',
  'Investigate reconciliation exceptions',
  // 'Compare this month’s performance with last month'
]

export function AiPanel({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const current = allNavLinks.find((item) => pathname.startsWith(item.to))
  const { messages, isThinking, sendMessage, startNewChat } = useAiChat()
  const threadEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, isThinking])

  return (
    <aside className="flex h-full w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between px-3 py-3">
        {showHistory ? (
          <IconButton aria-label="Back to chat" onClick={() => setShowHistory(false)}>
            <ArrowLeft className="h-4 w-4" />
          </IconButton>
        ) : (
          <IconButton aria-label="New chat" onClick={startNewChat}>
            <Pencil className="h-4 w-4" />
          </IconButton>
        )}
        <div className="flex items-center gap-1">
          {!showHistory && (
            <IconButton aria-label="View history" onClick={() => setShowHistory(true)}>
              <History className="h-4 w-4" />
            </IconButton>
          )}
          <IconButton aria-label="Open full view" onClick={() => navigate('/reflex-ai')}>
            <PanelRightClose className="h-4 w-4" />
          </IconButton>
          <IconButton aria-label="Close AI panel" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {showHistory ? (
        <div className="scrollbar-hide flex-1 overflow-y-auto px-3 pb-3">
          {aiPanelHistory.map((group) => (
            <div key={group.label} className="mt-2 first:mt-0">
              <p className="px-1 pb-1 text-[11px] text-ink-muted">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm text-ink transition hover:bg-surface-hover"
                  >
                    {item.kind === 'app' ? (
                      <LayoutGrid className="h-3.5 w-3.5 shrink-0 text-pink-500" />
                    ) : (
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl" />
                <Sparkles className="relative h-8 w-8 text-accent" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-heading">How can Reflex help you today?</h2>
              <span className='text-xs'>Ask questions, uncover insights, predict outcomes, and take action across your finance operat</span>
              <div className="mt-6 w-full space-y-2">
                {suggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => sendMessage(item, current?.label)}
                    className="w-full rounded-xl border border-border px-4 py-2.5 text-left text-xs text-ink transition hover:border-accent/30 hover:bg-accent/5"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="scrollbar-hide flex-1 space-y-3 overflow-y-auto px-3 py-3">
              {messages.map((item) => (
                <div key={item.id} className={clsx('flex', item.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={clsx(
                      'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                      item.role === 'user'
                        ? 'bg-accent text-accent-content'
                        : 'border border-border bg-surface text-ink',
                    )}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
              {isThinking && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface px-3 py-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent" />
                  </div>
                </div>
              )}
              <div ref={threadEndRef} />
            </div>
          )}

          <div className="space-y-3 px-3 pb-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Sparkles className="h-3 w-3 text-accent" />
              <span className="rounded-md bg-surface-hover px-2 py-1">{current?.label ?? 'Overview'} · Space</span>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                sendMessage(message, current?.label)
                setMessage('')
              }}
              className="rounded-xl border border-border p-2"
            >
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask Reflex about invoices, customers and payments"
                className="w-full bg-transparent px-2 py-1.5 text-sm text-ink placeholder:text-ink-muted placeholder:text-[12px] focus:outline-none"
              />
              <div className="mt-1 flex items-center justify-between px-1">
                <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink">
                  <Plus className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink">
                    <Mic className="h-4 w-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-content transition disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </form>

            <p className="text-center text-[11px] text-ink-muted">
              AI can make mistakes; always verify. <span className="cursor-pointer text-accent hover:underline">Send feedback</span>
            </p>
          </div>
        </>
      )}
    </aside>
  )
}
