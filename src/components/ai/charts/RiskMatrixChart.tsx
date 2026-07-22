import { useRef, useState } from 'react'
import type { RiskBubble, RiskMatrixChart as RiskMatrixChartData } from '../../../config/reflexAiChats'

const WIDTH = 640
const HEIGHT = 340
const PAD = { top: 20, right: 16, bottom: 34, left: 42 }
const PLOT_W = WIDTH - PAD.left - PAD.right
const PLOT_H = HEIGHT - PAD.top - PAD.bottom
const RADIUS_MIN = 7
const RADIUS_MAX = 26

const RISK_META: Record<RiskBubble['risk'], { color: string; label: string }> = {
  low: { color: 'var(--color-chart-good)', label: 'Low Risk' },
  medium: { color: 'var(--color-chart-warning)', label: 'Medium Risk' },
  high: { color: 'var(--color-chart-critical)', label: 'High Risk' },
}

export function RiskMatrixChart({ chart }: { chart: RiskMatrixChartData }) {
  const [hoverId, setHoverId] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const xAt = (delay: number) => PAD.left + (Math.min(delay, chart.xMax) / chart.xMax) * PLOT_W
  const yAt = (amount: number) => PAD.top + PLOT_H - (Math.min(amount, chart.yMax) / chart.yMax) * PLOT_H

  const revenues = chart.bubbles.map((bubble) => bubble.revenueContribution)
  const minRev = Math.sqrt(Math.min(...revenues))
  const maxRev = Math.sqrt(Math.max(...revenues))
  const radiusFor = (revenue: number) => {
    if (maxRev === minRev) return (RADIUS_MIN + RADIUS_MAX) / 2
    return RADIUS_MIN + ((Math.sqrt(revenue) - minRev) / (maxRev - minRev)) * (RADIUS_MAX - RADIUS_MIN)
  }

  const zoneX = xAt(chart.criticalZone.xMin)
  const zoneY = yAt(chart.criticalZone.yMin)
  const hovered = chart.bubbles.find((bubble) => bubble.id === hoverId)

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        {(['low', 'medium', 'high'] as const).map((risk) => (
          <span key={risk} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_META[risk].color }} />
            {RISK_META[risk].label}
          </span>
        ))}
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        onMouseLeave={() => setHoverId(null)}
      >
        <text x={PAD.left} y={PAD.top - 6} textAnchor="start" fontSize={9} fill="var(--color-ink-muted)">
          {chart.yAxisLabel}
        </text>
        <rect
          x={zoneX}
          y={PAD.top}
          width={WIDTH - PAD.right - zoneX}
          height={zoneY - PAD.top}
          fill="var(--color-chart-critical)"
          fillOpacity={0.07}
        />
        <line
          x1={zoneX}
          x2={zoneX}
          y1={PAD.top}
          y2={HEIGHT - PAD.bottom}
          stroke="var(--color-chart-baseline)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={zoneY}
          y2={zoneY}
          stroke="var(--color-chart-baseline)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text
          x={WIDTH - PAD.right - 6}
          y={PAD.top + 14}
          textAnchor="end"
          fontSize={9}
          fontWeight={700}
          fill="var(--color-chart-critical)"
        >
          {chart.criticalZone.label.toUpperCase()}
        </text>
        <text x={WIDTH - PAD.right - 6} y={PAD.top + 26} textAnchor="end" fontSize={8} fill="var(--color-chart-critical)">
          {chart.criticalZone.sublabel}
        </text>

        {chart.yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={yAt(tick)}
              y2={yAt(tick)}
              stroke="var(--color-chart-grid)"
              strokeWidth={1}
            />
            <text x={PAD.left - 8} y={yAt(tick) + 3} textAnchor="end" fontSize={9} fill="var(--color-ink-muted)">
              {tick} Cr
            </text>
          </g>
        ))}

        {chart.xTicks.map((tick) => (
          <text key={tick} x={xAt(tick)} y={HEIGHT - PAD.bottom + 16} textAnchor="middle" fontSize={9} fill="var(--color-ink-muted)">
            {tick}
          </text>
        ))}
        <text x={PAD.left + PLOT_W / 2} y={HEIGHT - 4} textAnchor="middle" fontSize={9} fill="var(--color-ink-muted)">
          {chart.xAxisLabel}
        </text>

        {chart.bubbles.map((bubble) => {
          const r = radiusFor(bubble.revenueContribution)
          const cx = xAt(bubble.delayDays)
          const cy = yAt(bubble.outstandingCr)
          const labelRight = cx < WIDTH - PAD.right - 90
          return (
            <g key={bubble.id} onMouseEnter={() => setHoverId(bubble.id)} className="cursor-pointer">
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={RISK_META[bubble.risk].color}
                fillOpacity={hoverId === null || hoverId === bubble.id ? 0.75 : 0.3}
                stroke="var(--color-surface)"
                strokeWidth={2}
              />
              <text
                x={labelRight ? cx + r + 5 : cx - r - 5}
                y={cy + 3}
                textAnchor={labelRight ? 'start' : 'end'}
                fontSize={9}
                fill="var(--color-heading)"
                stroke="var(--color-surface)"
                strokeWidth={3}
                paintOrder="stroke"
              >
                {bubble.name}
              </text>
            </g>
          )
        })}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 min-w-[160px] -translate-x-1/2 rounded-lg border border-border bg-surface px-2.5 py-2 text-[11px] shadow-md"
          style={{
            left: `${(xAt(hovered.delayDays) / WIDTH) * 100}%`,
            top: `${Math.max(0, (yAt(hovered.outstandingCr) / HEIGHT) * 100 - 14)}%`,
          }}
        >
          <p className="mb-1 font-medium text-heading">{hovered.name}</p>
          <div className="space-y-0.5 text-ink-muted">
            <div className="flex items-center justify-between gap-3">
              <span>Outstanding</span>
              <span className="font-medium text-heading">₹{hovered.outstandingCr.toFixed(1)} Cr</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Payment delay</span>
              <span className="font-medium text-heading">{hovered.delayDays} days</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: RISK_META[hovered.risk].color }} />
              {RISK_META[hovered.risk].label}
            </div>
          </div>
        </div>
      )}

      <p className="mt-2 text-[10px] text-ink-muted">Bubble size represents revenue contribution.</p>
    </div>
  )
}
