import { clsx } from 'clsx'
import {
  ChevronDown,
  Home as HomeIcon,
  LayoutGrid,
  Link2,
  Loader2,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Send,
  Sparkles,
  SquarePen,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reflexAiHistory } from '../config/aiHistory'

const DEFAULT_ID = 'summarize-trends'
const DEFAULT_PROMPT = 'Summarize current trends in this dashboard'
const DEFAULT_CONTEXT = 'Skill Bridge Enrollment Funnel'

export function ReflexAiPage() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeId, setActiveId] = useState<string>(DEFAULT_ID)
  const [message, setMessage] = useState('')
  const [working, setWorking] = useState(true)

  useEffect(() => {
    if (activeId !== DEFAULT_ID) return
    setWorking(true)
    const timer = setTimeout(() => setWorking(false), 1200)
    return () => clearTimeout(timer)
  }, [activeId])

  const activeItem = reflexAiHistory.flatMap((group) => group.items).find((item) => item.id === activeId)
  const title = activeId === DEFAULT_ID ? DEFAULT_PROMPT : (activeItem?.label ?? 'New chat')

  function startNewChat() {
    setActiveId('')
    setWorking(false)
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {!sidebarCollapsed && (
        <aside className="flex h-full w-[300px] shrink-0 flex-col border-r border-border bg-[#f5f5f5]">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-[15px] font-semibold text-heading">Agents</span>
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
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink transition hover:bg-surface-hover"
            >
              <Users className="h-4 w-4" />
              Custom Agents
            </button>
          </div>

          <div className="mt-1 px-2">
            <p className="px-2.5 pb-1 pt-3 text-[11px] font-medium text-ink-muted">My Recent Agents</p>
            <button
              type="button"
              className="flex w-full flex-col items-center gap-1.5 rounded-lg py-3 text-ink-muted transition hover:bg-surface-hover"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-border text-accent">
                <Plus className="h-4 w-4" />
              </span>
              <span className="text-[11px]">New agent</span>
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
            <span className="shrink-0 text-ink-muted">WeLe IntelliTech</span>
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

        <div className="scrollbar-hide flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
            {activeId === DEFAULT_ID ? (
              <>
                <div className="flex flex-col items-end gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-hover px-2.5 py-1 text-xs text-ink-muted">
                    <LayoutGrid className="h-3.5 w-3.5 text-pink-500" />
                    {DEFAULT_CONTEXT}
                  </span>
                  <div className="max-w-[80%] rounded-2xl bg-accent px-4 py-2.5 text-sm text-accent-content">{DEFAULT_PROMPT}</div>
                </div>

                <div className="flex flex-col gap-3">
                  <span className="flex w-fit items-center gap-1.5 text-sm text-ink-muted">
                    {working && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />}
                    Working
                    <ChevronDown className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm leading-relaxed text-ink">
                    You want a summary of the key trends currently displayed on this dashboard. I'll start by analyzing the primary
                    metrics and data points visible in the view.
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-ink">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <Sparkles className="h-3 w-3" />
                      </span>
                      <span>Getting dashboard data</span>
                      <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
                    </div>
                    <div className="ml-7">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-xs text-ink-muted">
                        <LayoutGrid className="h-3.5 w-3.5 text-pink-500" />
                        o985r1t0
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl" />
                  <Sparkles className="relative h-7 w-7 text-accent" />
                </div>
                <h2 className="text-lg font-semibold text-heading">How can Reflex help you today?</h2>
                <p className="max-w-sm text-xs text-ink-muted">
                  Ask questions, uncover insights, predict outcomes, and take action across your finance operations.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl px-6 pb-6">
          {working && activeId === DEFAULT_ID && (
            <div className="mb-2 flex items-center gap-2 rounded-t-xl bg-accent/10 px-3 py-2 text-xs font-medium text-accent">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Working... Getting dashboard data
            </div>
          )}
          <div className="rounded-xl border border-border bg-surface p-2">
            <div className="flex flex-wrap items-center gap-1.5 px-1 pb-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-surface-hover px-2 py-1 text-xs text-ink-muted">
                <HomeIcon className="h-3 w-3" />
                Home
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-surface-hover px-2 py-1 text-xs text-ink-muted">
                <LayoutGrid className="h-3 w-3 text-pink-500" />
                {DEFAULT_CONTEXT}
              </span>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                setMessage('')
              }}
            >
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask a follow up..."
                className="w-full bg-transparent px-2 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
              />
              <div className="mt-1 flex items-center justify-between px-1">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-ink-muted transition hover:bg-surface-hover hover:text-ink"
                  >
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
          </div>

          <p className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
            <span>AI can make mistakes; always verify.</span>
            <span className="cursor-pointer text-accent hover:underline">Send feedback</span>
          </p>
        </div>
      </div>
    </div>
  )
}
