import { clsx } from 'clsx'
import {
  ArrowUp,
  BanknoteX,
  CalendarMinus,
  ChartLine,
  ChartScatter,
  Check,
  ChevronDown,
  FileStack,
  Home as HomeIcon,
  LayoutGrid,
  Link2,
  Loader2,
  MessageSquare,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Sparkles,
  SquareAsterisk,
  SquarePen,
  Summary,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reflexAiHistory } from '../config/aiHistory'
import { reflexAiChats } from '../config/reflexAiChats'
import { ChartCard } from '../components/ai/charts/ChartCard'
import { WowEventChart } from '../components/ai/charts/WowEventChart'
import { RiskMatrixChart } from '../components/ai/charts/RiskMatrixChart'

const DEFAULT_ID = ''

const SUGGESTIONS = [
  { label: 'Predict cash flow for the next 30 days', icon: WalletCards },
  { label: 'Find customers with increasing payment risk', icon: SquareAsterisk },
  { label: 'Explain why collections dropped this month', icon: CalendarMinus },
  { label: 'Show invoices requiring immediate action', icon: FileStack },
  { label: 'Investigate reconciliation exceptions', icon: BanknoteX },
  { label: "Compare this month's performance with last month", icon: Summary },
]

export function ReflexAiPage() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeId, setActiveId] = useState<string>(DEFAULT_ID)
  const [message, setMessage] = useState('')
  // What's actually typed, kept separate from the hover preview so we can
  // revert cleanly when the mouse leaves a suggestion chip.
  const [hoveredSuggestion, setHoveredSuggestion] = useState<string | null>(null)
  const [working, setWorking] = useState(true)

  const activeChat = reflexAiChats[activeId]
  const isEmptyState = !activeChat

  const [contextTags, setContextTags] = useState([
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'context', label: activeChat?.contextLabel ?? '', icon: LayoutGrid },
  ])

  useEffect(() => {
    setContextTags([
      { id: 'home', label: 'Home', icon: HomeIcon },
      ...(activeChat ? [{ id: 'context', label: activeChat.contextLabel, icon: LayoutGrid }] : []),
    ])
  }, [activeId])

  useEffect(() => {
    if (!activeChat) return
    setWorking(true)
    const timer = setTimeout(() => setWorking(false), 1200)
    return () => clearTimeout(timer)
  }, [activeId])

  const activeItem = reflexAiHistory.flatMap((group) => group.items).find((item) => item.id === activeId)
  const title = activeChat ? activeChat.prompt : (activeItem?.label ?? 'New chat')

  function startNewChat() {
    setActiveId('')
    setWorking(false)
    setMessage('')
    setHoveredSuggestion(null)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const text = message.trim()
    if (!text) return
    if (isEmptyState) setActiveId(DEFAULT_ID)
    setMessage('')
    setHoveredSuggestion(null)
  }

  // Value shown in the textarea: a hovered suggestion previews on top of
  // whatever the user has actually typed, without overwriting it.
  const displayValue = hoveredSuggestion ?? message

  function Composer() {
    return (
      <div className="rounded-3xl border border-border bg-surface p-3 transition focus-within:border-accent">
        {contextTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pb-2">
            {contextTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded-md bg-[#F4F5F6] py-1 pl-2 pr-1 text-xs text-black"
              >
                <tag.icon className="h-3 w-3 text-ink" />
                {tag.label}
                <button
                  type="button"
                  aria-label={`Remove ${tag.label}`}
                  onClick={() => setContextTags((tags) => tags.filter((t) => t.id !== tag.id))}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-ink-muted transition hover:bg-border hover:text-ink"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={displayValue}
            onChange={(event) => {
              // Typing always edits the real message; a preview in progress
              // is cleared so it doesn't fight with manual input.
              setHoveredSuggestion(null)
              setMessage(event.target.value)
            }}
            placeholder={isEmptyState ? 'Ask Reflex anything...' : 'Ask a follow up...'}
            autoFocus={isEmptyState}
            className={clsx(
              'w-full bg-transparent px-1 py-1 text-sm focus:outline-none',
              hoveredSuggestion ? 'text-ink-muted' : 'text-ink',
              'placeholder:text-ink/60',
            )}
          />
          <div className="mt-1.5 flex items-center justify-between px-1">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
            >
              <Plus className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-1">
              {message.trim() ? (
                <button
                  type="submit"
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-content transition"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
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

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {!sidebarCollapsed && (
        <aside className="flex h-full w-[250px] shrink-0 flex-col border-r border-border bg-[#f5f5f5]">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[15px] font-semibold text-heading">Reflex AI</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Search"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
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

          <div className="space-y-0.5 px-2">
            <button
              type="button"
              onClick={startNewChat}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink transition hover:bg-surface-hover"
            >
              <SquarePen className="h-4 w-4" />
              New Chat
            </button>
          </div>

          <nav className="scrollbar-hide flex-1 overflow-y-auto px-2 pb-3">
            {reflexAiHistory.map((group) => (
              <div key={group.label} className="mt-3">
                <p className="px-2.5 pb-1 text-[11px] text-ink-muted">{group.label}</p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      title={item.label}
                      className={clsx(
                        'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] transition',
                        activeId === item.id ? 'bg-surface-hover text-heading' : 'text-ink hover:bg-surface-hover',
                      )}
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
            <span className="shrink-0 text-ink-muted">Tan Jian Hao</span>
            <span className="shrink-0 text-ink-muted">/</span>
            <span className="truncate font-medium text-heading">{title || 'New chat'}</span>
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
          /* ---------- Claude-style new chat: everything centered vertically ---------- */
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
                <Composer />
              </div>

              {/* Suggestions sit below the composer; hovering one previews its
                  prompt inside the textarea above without committing it. */}
              <div className="grid w-full grid-cols-1 gap-2 max-w-[350px]">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    type="button"
                    onMouseEnter={() => setHoveredSuggestion(suggestion.label)}
                    onMouseLeave={() => setHoveredSuggestion(null)}
                    onFocus={() => setHoveredSuggestion(suggestion.label)}
                    onBlur={() => setHoveredSuggestion(null)}
                    onClick={() => {
                      setMessage(suggestion.label)
                      setHoveredSuggestion(null)
                    }}
                    className="flex w-full items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-left text-sm text-ink transition hover:border-accent hover:bg-accent/5 hover:text-accent"
                  >
                    <suggestion.icon className="h-6 w-6 shrink-0" />
                    <span className="truncate">{suggestion.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ---------- Active chat: transcript scrolls, composer docked at bottom ---------- */
          <>
            <div className="scrollbar-hide flex-1 overflow-y-auto px-6 py-8">
              <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-hover px-2.5 py-1 text-xs text-ink-muted whitespace-nowrap">
                    <LayoutGrid className="h-3.5 w-3.5 text-pink-500" />
                    {activeChat.contextLabel}
                  </span>
                  <div className="max-w-[80%] rounded-2xl bg-accent/10 px-4 py-2.5 text-sm">{activeChat.prompt}</div>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="flex w-fit items-center gap-1.5 text-sm text-ink-muted">
                    {working ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                        Working
                      </>
                    ) : (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Finished working
                      </>
                    )}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </span>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-ink">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <Sparkles className="h-3 w-3" />
                      </span>
                      <span>{activeChat.response.toolCallLabel}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
                    </div>
                    <div className="ml-7">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-xs text-ink-muted">
                        <LayoutGrid className="h-3.5 w-3.5 text-pink-500" />
                        {activeChat.response.toolCallTag}
                      </span>
                    </div>
                  </div>

                  {!working && (
                    <>
                      <p className="text-sm leading-relaxed text-[#1E2024]">{activeChat.response.narration}</p>

                      <ul className="flex flex-col gap-1.5 pl-1 text-sm leading-relaxed text-[#1E2024]">
                        {activeChat.response.bullets.map((bullet) => (
                          <li key={bullet.lead} className="flex gap-2">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-muted" />
                            <span>
                              <span className="font-semibold text-heading">{bullet.lead}</span> {bullet.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <p className="text-sm leading-relaxed text-[#1E2024]">{activeChat.response.closing}</p>

                      <ChartCard
                        icon={activeChat.response.chart.kind === 'scatter' ? ChartScatter : ChartLine}
                        title={activeChat.response.chart.title}
                        subtitle={activeChat.response.chart.subtitle}
                      >
                        {activeChat.response.chart.kind === 'line' ? (
                          <WowEventChart chart={activeChat.response.chart} />
                        ) : (
                          <RiskMatrixChart chart={activeChat.response.chart} />
                        )}
                      </ChartCard>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[760px] px-6 pb-6">
              {working && (
                <div className="mb-2 flex items-center gap-2 rounded-t-xl bg-accent/10 px-3 py-2 text-xs font-medium text-accent">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Working... {activeChat.response.toolCallLabel}
                </div>
              )}
              <Composer />
              <p className="mt-2 flex items-center justify-between text-[11px] text-[#1E2024]">
                <span>AI can make mistakes; always verify.</span>
                <span className="inline-flex cursor-pointer items-center gap-1 text-[#1E2024] transition hover:text-ink">
                  Send feedback
                  <MessageSquare className="h-3 w-3" />
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}