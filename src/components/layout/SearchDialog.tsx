import { clsx } from 'clsx'
import { LayoutGrid, Search, Sparkles, TrendingUp, Users } from 'lucide-react'
import { useEffect, useRef, useState, type ElementType } from 'react'
import { createPortal } from 'react-dom'

type ActionItem = {
  id: string
  label: string
  icon: ElementType<{ className?: string }>
  iconClassName?: string
}

type SuggestedItem = {
  id: string
  label: string
  icon: ElementType<{ className?: string }>
  iconClassName?: string
  author: string
  timeAgo: string
  views: number
}

const actions: ActionItem[] = [
  { id: 'advanced-search', label: 'Advanced search', icon: Search },
  { id: 'search-users', label: 'Search users', icon: Users },
  { id: 'global-agent', label: 'Global Agent', icon: Sparkles, iconClassName: 'bg-accent text-white' },
]

const suggested: SuggestedItem[] = [
  {
    id: 'skill-bridge-enrollment-funnel',
    label: 'Skill Bridge Enrollment Funnel',
    icon: LayoutGrid,
    iconClassName: 'text-pink-500',
    author: 'Praburaju S',
    timeAgo: '3 months ago',
    views: 0,
  },
  {
    id: 'new-users-who-didnt-return',
    label: "New users who didn't return",
    icon: Users,
    iconClassName: 'text-teal-500',
    author: 'amp • WeLe IntelliTech',
    timeAgo: '3 months ago',
    views: 3,
  },
  {
    id: 'product-qualified-leads',
    label: 'Product qualified leads',
    icon: TrendingUp,
    iconClassName: 'text-teal-500',
    author: 'amp • WeLe IntelliTech',
    timeAgo: '3 months ago',
    views: 5,
  },
]

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    const frame = requestAnimationFrame(() => inputRef.current?.focus())

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={2} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search or ask a question"
            className="flex-1 bg-transparent text-sm text-heading placeholder:text-ink-muted focus:outline-none"
          />
        </div>

        <div className="scrollbar-hide flex-1 overflow-y-auto px-2 py-2">
          <p className="px-2 pb-1 pt-1 text-xs font-semibold text-ink-muted">Actions</p>
          <div className="space-y-0.5">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={onClose}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm text-ink transition hover:bg-surface-hover"
              >
                <span
                  className={clsx(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-ink-muted',
                    action.iconClassName,
                  )}
                >
                  <action.icon className="h-4 w-4" />
                </span>
                <span className="truncate">{action.label}</span>
              </button>
            ))}
          </div>

          <p className="px-2 pb-1 pt-3 text-xs font-semibold text-ink-muted">Suggested for you</p>
          <div className="space-y-0.5 pb-1">
            {suggested.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={onClose}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-surface-hover"
              >
                <span className={clsx('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center', item.iconClassName)}>
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-heading">{item.label}</span>
                  <span className="block truncate text-xs text-ink-muted">
                    {item.author} · {item.timeAgo} · {item.views} {item.views === 1 ? 'view' : 'views'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
