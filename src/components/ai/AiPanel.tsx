import { ArrowLeft, History, LayoutGrid, Mic, PanelRightClose, Pencil, Plus, Send, Sparkles, Square, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { groupConversations } from '../../ai/history'
import { resolveAiPage } from '../../ai/pages'
import { useAiChat } from '../../context/AiChatContext'
import { IconButton } from '../ui/IconButton'
import { MessageThread } from './MessageThread'

export function AiPanel({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const navigate = useNavigate()
  const {
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
  } = useAiChat()

  const page = viewPage ?? resolveAiPage('/')
  const groups = groupConversations(conversations)

  function submit() {
    if (!message.trim() || isStreaming) return
    sendMessage(message)
    setMessage('')
  }

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
          {groups.length === 0 && (
            <p className="px-2 py-8 text-center text-xs text-ink-muted">Your conversations will appear here.</p>
          )}
          {groups.map((group) => (
            <div key={group.label} className="mt-2 first:mt-0">
              <p className="px-1 pb-1 text-[11px] text-ink-muted">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <div key={item.id} className="group flex items-center rounded-lg transition hover:bg-surface-hover">
                    <button
                      type="button"
                      onClick={() => {
                        selectConversation(item.id)
                        setShowHistory(false)
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2.5 px-2 py-2 text-left text-sm text-ink"
                    >
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                        <span className={item.id === activeId ? 'h-1.5 w-1.5 rounded-full bg-accent' : 'h-1.5 w-1.5 rounded-full bg-blue-500'} />
                      </span>
                      <span className="truncate">{item.title}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete conversation ${item.title}`}
                      onClick={() => deleteConversation(item.id)}
                      className="mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-muted opacity-0 transition hover:text-ink group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {messages.length === 0 ? (
            <div className="scrollbar-hide flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-4 text-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl" />
                <Sparkles className="relative h-8 w-8 text-accent" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-heading">How can Reflex help you today?</h2>
              <div className="mt-1.5 max-w-[300px] text-xs leading-relaxed text-ink-muted">
                Ask questions, uncover insights, predict outcomes and take action across your finance operations.
              </div>
              <div className="mt-6 w-full px-1 text-left text-[11px] font-medium uppercase tracking-wide text-ink-muted">Try asking · {page.title}</div>
              <div className="mt-2 w-full space-y-2">
                {page.suggestions.slice(0, 5).map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => sendMessage(item.label)}
                    className="w-full rounded-xl border border-border px-4 py-2.5 text-left text-xs text-ink transition hover:border-accent/30 hover:bg-accent/5"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <MessageThread
              messages={messages}
              isThinking={isThinking}
              isStreaming={isStreaming}
              variant="panel"
              onFollowUp={(text) => sendMessage(text)}
              onRegenerate={regenerate}
              className="flex-1"
            />
          )}

          <div className="space-y-3 px-3 pb-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-muted">
              <Sparkles className="h-3 w-3 text-accent" />
              {viewPage ? (
                <button
                  type="button"
                  onClick={() => setPageScope(!pageScope)}
                  title={pageScope ? 'Reflex is using this screen as context. Click to turn off.' : 'Click to use this screen as context.'}
                  className="flex max-w-full items-center gap-1 rounded-md bg-surface-hover px-2 py-1 transition hover:text-ink"
                >
                  <LayoutGrid className="h-3 w-3 shrink-0" />
                  <span className="truncate">{pageScope ? `${viewPage.title} · in context` : 'Screen context off'}</span>
                </button>
              ) : (
                <span className="rounded-md bg-surface-hover px-2 py-1">Workspace data</span>
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                submit()
              }}
              className="rounded-xl border border-border p-2 transition focus-within:border-accent"
            >
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={messages.length === 0 ? `Ask Reflex about ${page.title === 'Workspace' ? 'invoices, customers and payments' : page.title}` : 'Ask a follow-up…'}
                aria-label="Message Reflex"
                className="w-full bg-transparent px-2 py-1.5 text-sm text-ink placeholder:text-[12px] placeholder:text-ink-muted focus:outline-none"
              />
              <div className="mt-1 flex items-center justify-between px-1">
                <button type="button" aria-label="Attach" className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink">
                  <Plus className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label="Voice input" className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-hover hover:text-ink">
                    <Mic className="h-4 w-4" />
                  </button>
                  {isStreaming ? (
                    <button
                      type="button"
                      onClick={stop}
                      aria-label="Stop generating"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-heading text-surface transition hover:opacity-90"
                    >
                      <Square className="h-3 w-3 fill-current" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!message.trim()}
                      aria-label="Send message"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-content transition disabled:opacity-40"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  )}
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
