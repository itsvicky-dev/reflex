import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { KpiItem, KpiTone } from '../../../ai/types'

/** Status colours are paired with an arrow icon and the delta text, never colour alone. */
const toneColor: Record<KpiTone, string> = {
  good: 'var(--color-chart-good)',
  bad: 'var(--color-chart-critical)',
  warning: 'var(--color-chart-warning)',
  neutral: 'var(--color-ink-muted)',
}

export function KpiStrip({ items }: { items: KpiItem[] }) {
  if (items.length === 0) return null
  return (
    <div className="my-3 grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))' }}>
      {items.map((item) => {
        const Icon = item.direction === 'up' ? ArrowUpRight : item.direction === 'down' ? ArrowDownRight : Minus
        return (
          <div key={item.label} className="min-w-0 rounded-xl border border-border bg-surface px-3.5 py-3">
            <div className="truncate text-[11px] text-ink-muted">{item.label}</div>
            <div className="mt-1 truncate text-[19px] font-semibold leading-tight tracking-tight text-heading">{item.value}</div>
            {item.delta && (
              <div className="mt-1.5 flex items-center gap-1 text-[11px] leading-tight text-ink-muted">
                {item.direction && <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: toneColor[item.tone] }} strokeWidth={2.5} />}
                <span className="truncate">{item.delta}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function KpiSkeleton() {
  return (
    <div className="my-3 grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))' }} role="status" aria-label="Loading figures">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-surface px-3.5 py-3">
          <div className="h-2.5 w-16 animate-pulse rounded bg-surface-hover" />
          <div className="mt-2.5 h-5 w-24 animate-pulse rounded bg-surface-hover" />
          <div className="mt-2.5 h-2.5 w-20 animate-pulse rounded bg-surface-hover" />
        </div>
      ))}
    </div>
  )
}
