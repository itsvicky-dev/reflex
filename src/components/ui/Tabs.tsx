import { clsx } from 'clsx'

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
  return (
    <div className={clsx('inline-flex w-fit flex-wrap items-center gap-1 self-start rounded-lg border border-border', className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={clsx(
            'whitespace-nowrap px-3 py-1.5 text-sm font-medium transition',
            value === item.value ? 'bg-accent/10 text-accent' : 'text-ink-muted hover:text-ink',
          )}
        >
          {item.label}
          {item.count !== undefined && <span className="ml-1 opacity-70">({item.count})</span>}
        </button>
      ))}
    </div>
  )
}
