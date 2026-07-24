import { clsx } from 'clsx'
import { Send, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAiChat } from '../../context/AiChatContext'
import { useLayout } from '../../context/LayoutContext'

type AskAiPopoverProps = {
  contextLabel: string
  suggestions?: string[]
  className?: string
}

const defaultSuggestions = ['Summarize this for me', 'What changed recently?', 'Flag anything unusual']

export function AskAiPopover({ contextLabel, suggestions = defaultSuggestions, className }: AskAiPopoverProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const { sendMessage } = useAiChat()
  const { setAiPanelOpen } = useLayout()

  useEffect(() => {
    if (!open) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  useEffect(() => {
    if (!open) setMessage('')
  }, [open])

  useEffect(() => () => clearTimeout(closeTimeoutRef.current), [])

  function openNow() {
    clearTimeout(closeTimeoutRef.current)
    setOpen(true)
  }

  function closeSoon() {
    clearTimeout(closeTimeoutRef.current)
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  function submit(text: string) {
    if (!text.trim()) return
    sendMessage(text, contextLabel)
    setAiPanelOpen(true)
    setOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className={clsx('relative inline-flex', className)}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Ask AI about ${contextLabel}`}
        className={clsx(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-accent transition-all duration-150',
          open && 'bg-accent/10',
        )}
      >
        <Sparkles className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className={clsx(
            'absolute left-0 top-full z-30 mt-2.5 w-80 max-w-[85vw] overflow-hidden rounded-2xl',
            'border border-white/40 bg-white/15 shadow-2xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150',
            'ring-1 ring-inset ring-white/30',
            'dark:border-white/15 dark:bg-white/[0.06] dark:shadow-black/40 dark:ring-white/10',
          )}
        >
          <div className="pointer-events-none absolute -left-8 -top-10 h-28 w-28 rounded-full bg-accent/30 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-8 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />

          <div className="relative flex items-center justify-between gap-2 border-b border-white/20 px-3.5 py-2.5 dark:border-white/10">
            <span className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-heading">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span className="truncate">Ask AI &middot; {contextLabel}</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="shrink-0 text-ink-muted transition hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative space-y-1.5 px-3.5 pt-3">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => submit(item)}
                className="w-full rounded-lg border border-white/25 bg-white/10 px-2.5 py-1.5 text-left text-[11px] text-black transition hover:border-accent/30 hover:bg-accent/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-accent/10"
              >
                {item}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              submit(message)
            }}
            className="relative m-3.5 mt-3 flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-2 py-1.5 dark:border-white/10 dark:bg-white/5"
          >
            <input
              autoFocus
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask anything..."
              className="min-w-0 flex-1 bg-transparent text-xs text-ink placeholder:text-ink-muted focus:outline-none"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              aria-label="Send"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-content transition disabled:opacity-40"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
