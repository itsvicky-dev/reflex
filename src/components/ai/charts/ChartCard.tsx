import { ChevronDown, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'

export function ChartCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  children: ReactNode
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
      >
        <Icon className="h-4 w-4 shrink-0 text-accent" />
        <span className="truncate text-[13px] font-medium text-heading">{title}</span>
        <ChevronDown className={`ml-auto h-3.5 w-3.5 shrink-0 text-ink-muted transition ${collapsed ? '-rotate-90' : ''}`} />
      </button>
      {!collapsed && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="mb-3 text-xs text-ink-muted">{subtitle}</p>
          {children}
        </div>
      )}
    </div>
  )
}
