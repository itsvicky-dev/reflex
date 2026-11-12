export type TooltipRow = { color: string; name: string; value: string; emphasis?: boolean }

/**
 * One tooltip for every series at a position. Values lead (strong), names follow (secondary), and rows are keyed
 * with a short stroke of the series colour rather than a box. All content is rendered as React text (escaped).
 */
export function ChartTooltip({
  x,
  y = 0,
  containerWidth,
  title,
  rows,
}: {
  x: number
  y?: number
  containerWidth: number
  title: string
  rows: TooltipRow[]
}) {
  const half = 88
  const left = Math.min(Math.max(x, half), Math.max(half, containerWidth - half))
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-20 min-w-[150px] max-w-[220px] -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 shadow-lg"
      style={{ left, top: Math.max(0, y) }}
    >
      <div className="mb-1 text-[11px] font-medium text-ink-muted">{title}</div>
      <div className="space-y-1">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-4">
            <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-ink-muted">
              <span className="h-[3px] w-3 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
              <span className="truncate">{row.name}</span>
            </span>
            <span className={row.emphasis ? 'text-xs font-semibold text-heading' : 'text-xs font-medium text-heading'}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
