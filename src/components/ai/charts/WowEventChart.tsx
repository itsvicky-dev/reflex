import { useRef, useState } from 'react'
import type { WowLineChart } from '../../../config/reflexAiChats'

const WIDTH = 640
const HEIGHT = 240
const PAD = { top: 14, right: 14, bottom: 26, left: 34 }
const PLOT_W = WIDTH - PAD.left - PAD.right
const PLOT_H = HEIGHT - PAD.top - PAD.bottom

function formatTick(value: number) {
  return value >= 1000 ? `${value / 1000}k` : `${value}`
}

export function WowEventChart({ chart }: { chart: WowLineChart }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const n = chart.xLabels.length
  const xAt = (index: number) => PAD.left + (n === 1 ? 0 : (index / (n - 1)) * PLOT_W)
  const yAt = (value: number) => PAD.top + PLOT_H - (Math.min(value, chart.yMax) / chart.yMax) * PLOT_H

  function handleMove(event: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    const index = Math.round(fraction * (n - 1))
    setHoverIndex(index)
  }

  const tooltipFraction = hoverIndex !== null ? Math.min(0.86, Math.max(0.14, hoverIndex / (n - 1))) : 0

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
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
              {formatTick(tick)}
            </text>
          </g>
        ))}

        {chart.xLabels.map((label, index) => (
          <text
            key={label}
            x={xAt(index)}
            y={HEIGHT - 6}
            textAnchor={index === 0 ? 'start' : index === n - 1 ? 'end' : 'middle'}
            fontSize={9}
            fill="var(--color-ink-muted)"
          >
            {label}
          </text>
        ))}

        {chart.series.map((series) => (
          <path
            key={series.id}
            d={series.values.map((value, index) => `${index === 0 ? 'M' : 'L'}${xAt(index)},${yAt(value)}`).join(' ')}
            fill="none"
            stroke={series.colorVar}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {chart.series.map((series) => {
          const lastIndex = series.values.length - 1
          return (
            <g key={`${series.id}-end`}>
              <circle cx={xAt(lastIndex)} cy={yAt(series.values[lastIndex])} r={3.5} fill={series.colorVar} />
              <text
                x={xAt(lastIndex) - 6}
                y={yAt(series.values[lastIndex]) - 6}
                textAnchor="end"
                fontSize={9}
                fontWeight={600}
                fill="var(--color-heading)"
              >
                {series.values[lastIndex]}
              </text>
            </g>
          )
        })}

        {hoverIndex !== null && (
          <line
            x1={xAt(hoverIndex)}
            x2={xAt(hoverIndex)}
            y1={PAD.top}
            y2={HEIGHT - PAD.bottom}
            stroke="var(--color-chart-baseline)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}
        {hoverIndex !== null &&
          chart.series.map((series) => (
            <circle
              key={`${series.id}-hover`}
              cx={xAt(hoverIndex)}
              cy={yAt(series.values[hoverIndex])}
              r={3}
              fill={series.colorVar}
            />
          ))}
      </svg>

      {hoverIndex !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 min-w-[140px] -translate-x-1/2 rounded-lg border border-border bg-surface px-2.5 py-2 text-[11px] shadow-md"
          style={{ left: `${tooltipFraction * 100}%` }}
        >
          <p className="mb-1 font-medium text-heading">{chart.xLabels[hoverIndex]}</p>
          <div className="space-y-0.5">
            {chart.series.map((series) => (
              <div key={series.id} className="flex items-center justify-between gap-3 text-ink-muted">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: series.colorVar }} />
                  {series.label}
                </span>
                <span className="font-medium text-heading">{series.values[hoverIndex]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {chart.series.map((series) => (
          <span key={series.id} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: series.colorVar }} />
            {series.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
          <span className="h-0 w-3 border-t border-dashed border-[var(--color-chart-baseline)]" />
          {chart.baselineLabel}
        </span>
      </div>
    </div>
  )
}
