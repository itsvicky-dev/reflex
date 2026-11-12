import { clsx } from 'clsx'
import {
  ArrowUp,
  ArrowUpRight,
  BanknoteX,
  CalendarMinus,
  FileStack,
  LayoutGrid,
  Link2,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sparkles,
  SquareAsterisk,
  SquarePen,
  Square,
  Summary,
  Trash2,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { groupConversations } from '../ai/history'
import { resolveAiPage } from '../ai/pages'
import { MessageThread } from '../components/ai/MessageThread'
import { useAiChat } from '../context/AiChatContext'

const categoryIcons: Record<string, LucideIcon> = {
  'Cash flow': WalletCards,
  Risk: SquareAsterisk,
  Collections: CalendarMinus,
  Invoices: FileStack,
  Reconciliation: BanknoteX,
  Summary: Summary,
  Performance: Summary,
}

type ComposerProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onStop: () => void
  isStreaming: boolean
  placeholder: string
  autoFocus?: boolean
  preview?: boolean
  tags: { id: string; label: string; active: boolean; removable: boolean }[]
  onToggleTag: (id: string) => void
}

function Composer({ value, onChange, onSubmit, onStop, isStreaming, placeholder, autoFocus, preview, tags, onToggleTag }: ComposerProps) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-3 transition focus-within:border-accent">
      <div className="flex flex-wrap items-center gap-1.5 pb-2">
        {tags.map((tag) =>
          tag.active ? (
            <span key={tag.id} className="inline-flex items-center gap-1 rounded-md bg-[#F4F5F6] py-1 pl-2 pr-1 text-xs text-black">
              <LayoutGrid className="h-3 w-3 text-ink" />
              {tag.label}
              {tag.removable ? (
                <button
                  type="button"
                  aria-label={`Remove ${tag.label}`}
                  onClick={() => onToggleTag(tag.id)}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-ink-muted transition hover:bg-border hover:text-ink"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              ) : (
                <span className="w-1" />
              )}
            </span>
          ) : (
            <button
              key={tag.id}
              type="button"
              onClick={() => onToggleTag(tag.id)}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs text-ink-muted transition hover:border-accent/50 hover:text-ink"
            >
              <Plus className="h-3 w-3" /> {tag.label}
            </button>
          ),
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Message Reflex"
          className={clsx(
            'w-full bg-transparent px-1 py-1 text-sm placeholder:text-ink/60 focus:outline-none',
            preview ? 'text-ink-muted' : 'text-ink',
          )}
        />
        <div className="mt-1.5 flex items-center justify-between px-1">
          <button
            type="button"
            aria-label="Attach"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generating"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-heading text-surface transition hover:opacity-90"
              >
                <Square className="h-3 w-3 fill-current" />
              </button>
            ) : value.trim() ? (
              <button type="submit" aria-label="Send message" className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-content transition">
                <ArrowUp className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                aria-label="Voice input"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
              >
                <Mic className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export function ReflexAiPage() {
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

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [message, setMessage] = useState('')
  // A hovered suggestion previews inside the composer without overwriting what was actually typed.
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const isEmptyState = messages.length === 0
  const active = conversations.find((conversation) => conversation.id === activeId)
  const title = active?.title ?? 'New chat'
  const page = viewPage ?? resolveAiPage('/')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return groupConversations(q ? conversations.filter((c) => c.title.toLowerCase().includes(q)) : conversations)
  }, [conversations, query])

  const tags = [
    ...(viewPage ? [{ id: 'page', label: viewPage.title, active: pageScope, removable: true }] : []),
    { id: 'data', label: 'Workspace data', active: true, removable: false },
  ]

  function handleSubmit() {
    const text = message.trim()
    if (!text || isStreaming) return
    sendMessage(text)
    setMessage('')
    setHoveredSuggestion(null)
  }

  function ask(text: string) {
    if (isStreaming) return
    sendMessage(text)
    setMessage('')
    setHoveredSuggestion(null)
  }

  function handleNewChat() {
    startNewChat()
    setMessage('')
    setHoveredSuggestion(null)
  }

  const composerProps = {
    onChange: (value: string) => {
      setHoveredSuggestion(null)
      setMessage(value)
    },
    onSubmit: handleSubmit,
    onStop: stop,
    isStreaming,
    tags,
    onToggleTag: (id: string) => {
      if (id === 'page') setPageScope(!pageScope)
    },
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {!sidebarCollapsed && (
        <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-border bg-[#f5f5f5]">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[15px] font-semibold text-heading">Reflex AI</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Search conversations"
                aria-pressed={searchOpen}
                onClick={() => {
                  setSearchOpen((open) => !open)
                  setQuery('')
                }}
                className={clsx(
                  'flex h-7 w-7 items-center justify-center rounded-lg transition hover:bg-surface-hover hover:text-ink',
                  searchOpen ? 'bg-surface-hover text-ink' : 'text-ink-muted',
                )}
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Collapse sidebar"
                onClick={() => setSidebarCollapsed(true)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="px-3 pb-2">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search chats…"
                aria-label="Search chats"
                className="w-full rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-muted focus:border-accent/50 focus:outline-none"
              />
            </div>
          )}

          <div className="space-y-0.5 px-2">
            <button
              type="button"
              onClick={handleNewChat}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink transition hover:bg-surface-hover"
            >
              <SquarePen className="h-4 w-4" />
              New Chat
            </button>
          </div>

          <nav className="scrollbar-hide flex-1 overflow-y-auto px-2 pb-3">
            {groups.length === 0 && (
              <p className="px-2.5 py-6 text-xs leading-relaxed text-ink-muted">
                {query ? 'No chats match your search.' : 'Your conversations will appear here once you start asking questions.'}
              </p>
            )}
            {groups.map((group) => (
              <div key={group.label} className="mt-3">
                <p className="px-2.5 pb-1 text-[11px] text-ink-muted">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className={clsx(
                        'group flex items-center rounded-lg transition',
                        activeId === item.id ? 'bg-surface-hover' : 'hover:bg-surface-hover',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => selectConversation(item.id)}
                        title={item.title}
                        className={clsx(
                          'flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-1.5 text-left text-[13px]',
                          activeId === item.id ? 'text-heading' : 'text-ink',
                        )}
                      >
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
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
          </nav>
        </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            {sidebarCollapsed && (
              <button
                type="button"
                aria-label="Expand sidebar"
                onClick={() => setSidebarCollapsed(false)}
                className="mr-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            )}
            <span className="shrink-0 text-ink-muted">Abilash Kumar</span>
            <span className="shrink-0 text-ink-muted">/</span>
            <span className="truncate font-medium text-heading">{title}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Copy link"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
            >
              <Link2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Back to dashboard"
              onClick={() => navigate(-1)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
            >
              <Sparkles className="h-4 w-4 text-accent" />
            </button>
          </div>
        </header>

        {isEmptyState ? (
          /* ---------- New chat: everything centred vertically ---------- */
          <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
            <div className="mx-auto flex w-full max-w-[700px] flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl" />
                  <Sparkles className="relative h-7 w-7 text-accent" />
                </div>
                <h2 className="text-lg font-semibold text-heading">How can Reflex help you today?</h2>
                <p className="max-w-sm text-xs text-ink-muted">
                  Ask questions, uncover insights, predict outcomes, and take action across your finance operations.
                </p>
              </div>

              <div className="w-full">
                <Composer
                  {...composerProps}
                  value={hoveredSuggestion ?? message}
                  preview={hoveredSuggestion !== null}
                  placeholder="Ask Reflex anything..."
                  autoFocus
                />
              </div>

              {/* Suggestions sit outside the composer; hovering previews the prompt above, clicking asks it. */}
              <div className="w-full space-y-0.5">
                <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                  {viewPage ? `Suggested for ${page.title}` : 'Suggested'}
                </p>
                {page.suggestions.map((suggestion) => {
                  const Icon = categoryIcons[suggestion.category] ?? Sparkles
                  return (
                    <button
                      key={suggestion.label}
                      type="button"
                      onMouseEnter={() => setHoveredSuggestion(suggestion.label)}
                      onMouseLeave={() => setHoveredSuggestion(null)}
                      onFocus={() => setHoveredSuggestion(suggestion.label)}
                      onBlur={() => setHoveredSuggestion(null)}
                      onClick={() => ask(suggestion.label)}
                      className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-surface-hover"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F4F5F6] text-ink">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-ink">{suggestion.label}</span>
                        <span className="block text-xs text-ink-muted">{suggestion.category}</span>
                      </span>
                      <span
                        className={clsx(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-muted opacity-0 transition group-hover:opacity-100',
                          hoveredSuggestion === suggestion.label && 'opacity-100',
                        )}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ---------- Active chat: thread scrolls, composer docked at the bottom ---------- */
          <>
            <MessageThread
              messages={messages}
              isThinking={isThinking}
              isStreaming={isStreaming}
              variant="page"
              onFollowUp={ask}
              onRegenerate={regenerate}
              className="flex-1"
            />

            <div className="mx-auto w-full max-w-[760px] px-6 pb-6">
              <Composer {...composerProps} value={message} placeholder="Ask a follow up..." />
              <p className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
                <span>AI can make mistakes; always verify.</span>
                <span className="cursor-pointer transition hover:text-ink">Send feedback</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
