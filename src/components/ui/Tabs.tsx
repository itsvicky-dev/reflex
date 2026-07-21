import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export type TabItem = {
  label: string
  value: string
  count?: number
}

type TabsProps = {
  items: TabItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function Tabs({ items, value, onChange, className }: TabsProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const selected = items.find((item) => item.value === value) ?? items[0]

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className={clsx('relative inline-flex w-fit self-start', className)}>
      <div className="flex items-center rounded-lg border border-border bg-surface">
        <span className="whitespace-nowrap px-3 py-1.5 text-xs font-medium text-heading">
          {selected.label}
          {selected.count !== undefined && <span className="ml-1 text-ink-muted">({selected.count})</span>}
        </span>
        <button
          type="button"
          aria-label="Show more filters"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center self-stretch border-l border-border px-2 text-ink-muted transition hover:text-ink"
        >
          <ChevronDown className={clsx('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-20 min-w-[180px] overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg shadow-black/[0.08] dark:shadow-black/40">
          {items.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                onChange(item.value)
                setOpen(false)
              }}
              className={clsx(
                'flex w-full items-center justify-between gap-3 whitespace-nowrap px-3 py-2 text-left text-xs font-medium transition',
                item.value === value ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-surface-hover',
              )}
            >
              <span>{item.label}</span>
              {item.count !== undefined && <span className="opacity-70">({item.count})</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
