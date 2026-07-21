import { Mic, PanelRightClose, Pencil, Plus, RefreshCcw, Send, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { allNavLinks } from '../../config/navigation'
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
  const { pathname } = useLocation()
  const current = allNavLinks.find((item) => pathname.startsWith(item.to))

  return (
    <aside className="flex h-full w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between px-3 py-3">
        <IconButton aria-label="New chat">
          <Pencil className="h-4 w-4" />
        </IconButton>
        <div className="flex items-center gap-1">
          <IconButton aria-label="Restart conversation">
            <RefreshCcw className="h-4 w-4" />
          </IconButton>
          <IconButton aria-label="Collapse panel">
            <PanelRightClose className="h-4 w-4" />
          </IconButton>
          <IconButton aria-label="Close AI panel" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

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
              onClick={() => setMessage(item)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-left text-xs text-ink transition hover:border-accent/30 hover:bg-accent/5"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 px-3 pb-3">
        {/* <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-hover p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-heading">Automate recurring workflows</p>
            <p className="truncate text-xs text-ink-muted">Auto-run this analysis on a schedule</p>
          </div>
          <button type="button" className="shrink-0 text-xs font-semibold text-accent hover:underline">
            Try now
          </button>
        </div> */}

        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
          <Sparkles className="h-3 w-3 text-accent" />
          <span className="rounded-md bg-surface-hover px-2 py-1">{current?.label ?? 'Overview'} · Space</span>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
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
    </aside>
  )
}
