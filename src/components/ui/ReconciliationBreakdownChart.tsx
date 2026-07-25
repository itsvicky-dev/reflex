import { clsx } from 'clsx'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReconciliationBreakdownPoint } from '../../data/mockReconciliationHub'

type ReconciliationBreakdownChartProps = {
  points: ReconciliationBreakdownPoint[]
  rangeLabel: string
}

type HoveredBar = {
  point: ReconciliationBreakdownPoint
  left: number
  bottom: number
}

const BAR_HEIGHT_PX = 128
const SEGMENT_GAP_PX = 2

const legendItems = [
  { label: 'Total', swatch: 'bg-border' },
  { label: 'AI Reconciled', swatch: 'bg-accent' },
  { label: 'Manual Reconciled', swatch: 'bg-blue-500' },
  { label: 'Needs Review', swatch: 'bg-rose-500' },
]

const formatCount = (value: number) => new Intl.NumberFormat('en-US').format(value)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

function TooltipRow({
  swatchClassName,
  label,
  value,
  amount,
}: {
  swatchClassName: string
  label: string
  value: number
  amount: number
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-xs text-ink">
        <span className={clsx('h-2.5 w-2.5 shrink-0 rounded-sm', swatchClassName)} /> {label}
      </span>
      <span className="shrink-0 text-right text-xs font-semibold text-heading">
        {formatCount(value)}
        <span className="ml-1 font-normal text-ink-muted">({formatCurrency(amount)})</span>
      </span>
    </div>
  )
}

export function ReconciliationBreakdownChart({ points, rangeLabel }: ReconciliationBreakdownChartProps) {
  const [hovered, setHovered] = useState<HoveredBar | null>(null)

  const maxTotal = Math.max(1, ...points.map((point) => point.total))

  function showTooltip(point: ReconciliationBreakdownPoint, target: HTMLElement) {
    const rect = target.getBoundingClientRect()
    setHovered({ point, left: rect.left + rect.width / 2, bottom: window.innerHeight - rect.top + 10 })
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-muted">
        {legendItems.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className={clsx('h-2.5 w-2.5 rounded-sm', item.swatch)} /> {item.label}
          </span>
        ))}
      </div>
      <p className="mt-1 text-[10px] text-ink-muted">{rangeLabel}</p>

      <div className="scrollbar-hide mt-4 flex min-w-0 items-end gap-2 overflow-x-auto px-1">
        {points.map((point) => {
          const isHovered = hovered?.point.id === point.id
          const totalHeightPx = (point.total / maxTotal) * BAR_HEIGHT_PX
          const availableHeightPx = Math.max(0, totalHeightPx - SEGMENT_GAP_PX * 2)

          const aiHeightPx = (point.aiReconciled / point.total) * availableHeightPx
          const manualHeightPx = (point.manualReconciled / point.total) * availableHeightPx
          const needsHeightPx = (point.needsReview / point.total) * availableHeightPx

          return (
            <button
              key={point.id}
              type="button"
              onMouseEnter={(event) => showTooltip(point, event.currentTarget)}
              onMouseLeave={() => setHovered(null)}
              onFocus={(event) => showTooltip(point, event.currentTarget)}
              onBlur={() => setHovered(null)}
              className="relative flex min-w-[44px] flex-1 flex-col items-center gap-2 rounded-lg px-1 pb-1 text-left focus:outline-none"
            >
              <span className="text-[10px] font-semibold text-heading">{formatCount(point.total)}</span>

              <span
                className={clsx('relative w-9 rounded-t bg-border transition', isHovered && 'brightness-95')}
                style={{ height: totalHeightPx }}
              >
                <span className="absolute bottom-0 w-full bg-accent" style={{ height: aiHeightPx }} />
                <span
                  className="absolute w-full bg-blue-500"
                  style={{ height: manualHeightPx, bottom: aiHeightPx + SEGMENT_GAP_PX }}
                />
                <span
                  className="absolute w-full rounded-t bg-rose-500"
                  style={{ height: needsHeightPx, bottom: aiHeightPx + manualHeightPx + SEGMENT_GAP_PX * 2 }}
                />
              </span>

              <span className="flex flex-col items-center">
                <span className="truncate text-[11px] font-medium text-heading">{point.label}</span>
                <span className="truncate text-[10px] text-ink-muted">{point.sublabel}</span>
              </span>
            </button>
          )
        })}
      </div>

      {hovered &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 w-64 -translate-x-1/2 rounded-xl border border-border bg-surface p-3.5 shadow-2xl"
            style={{ left: hovered.left, bottom: hovered.bottom }}
          >
            <p className="truncate text-xs font-semibold text-heading">{hovered.point.label}</p>
            <p className="truncate text-[11px] text-ink-muted">{hovered.point.sublabel}</p>

            <div className="mt-2.5 space-y-2">
              <TooltipRow swatchClassName="bg-border" label="Total" value={hovered.point.total} amount={hovered.point.amount} />
              <TooltipRow
                swatchClassName="bg-accent"
                label="AI Reconciled"
                value={hovered.point.aiReconciled}
                amount={(hovered.point.aiReconciled / hovered.point.total) * hovered.point.amount}
              />
              <TooltipRow
                swatchClassName="bg-blue-500"
                label="Manual Reconciled"
                value={hovered.point.manualReconciled}
                amount={(hovered.point.manualReconciled / hovered.point.total) * hovered.point.amount}
              />
              <TooltipRow
                swatchClassName="bg-rose-500"
                label="Needs Review"
                value={hovered.point.needsReview}
                amount={(hovered.point.needsReview / hovered.point.total) * hovered.point.amount}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
