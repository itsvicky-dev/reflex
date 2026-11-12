import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react'
import type { ChartSpec } from '../../../ai/types'
import { ChartTooltip } from './ChartTooltip'
import { formatTick, formatValue, niceScale, seriesColor, textWidth, truncate } from './chartUtils'


/** Picks a label step that divides the last index, so the final label always shows and none collide. */
function labelStep(n: number, slotPx: number, labelPx: number) {
  const minStep = Math.max(1, Math.ceil(labelPx / Math.max(slotPx, 1)))
  for (let step = minStep; step < n - 1; step++) if ((n - 1) % step === 0) return step
  return n - 1 || 1
}

export function LineAreaChart({ spec, width }: { spec: ChartSpec; width: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const { labels, series } = spec
  const n = labels.length
  const k = series.length
  const height = 230
  const isArea = spec.type === 'area'

  const all = series.flatMap((s) => s.values)
  const vmin = Math.min(...all)
  const vmax = Math.max(...all)
  const low = vmin < 0 ? vmin : !isArea && vmax > 0 && vmin / vmax > 0.6 ? vmin - (vmax - vmin) * 0.3 : 0
  const scale = niceScale(vmin < 0 ? vmin : Math.max(0, low), vmax || 1)

  const tickLabels = scale.ticks.map((tick) => formatTick(tick, spec))
  const left = Math.max(30, ...tickLabels.map((l) => textWidth(l, 10))) + 12

  const directLabels = k >= 2 && width >= 440
  const nameWidth = directLabels ? Math.min(110, Math.max(...series.map((s) => textWidth(s.name, 10.5))) + 12) : 0
  const right = 10 + nameWidth
  const top = 22
  const bottom = 30
  const plotW = Math.max(40, width - left - right)
  const plotH = height - top - bottom
  // Inset the first/last point by half a label so centred x labels stay inside the plot and never collide.
  const PAD_X = Math.min(30, Math.max(8, Math.max(...labels.map((l) => textWidth(l, 10.5))) / 2 + 2))
  const innerW = plotW - PAD_X * 2

  const xAt = (i: number) => left + PAD_X + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const yAt = (value: number) => top + plotH - ((value - scale.min) / (scale.max - scale.min)) * plotH

  const forecastFrom = spec.forecastFrom !== undefined && spec.forecastFrom > 0 && spec.forecastFrom < n ? Math.round(spec.forecastFrom) : null

  const linePath = (values: number[], from = 0, to = n - 1) =>
    values
      .slice(from, to + 1)
      .map((v, idx) => `${idx === 0 ? 'M' : 'L'}${xAt(from + idx)},${yAt(v)}`)
      .join(' ')

  const areaPath = (values: number[]) =>
    `${linePath(values)} L${xAt(n - 1)},${yAt(Math.max(scale.min, 0))} L${xAt(0)},${yAt(Math.max(scale.min, 0))} Z`

  const slot = n > 1 ? innerW / (n - 1) : innerW
  const maxLabelPx = Math.max(...labels.map((l) => textWidth(l, 10.5)))
  const step = labelStep(n, slot, maxLabelPx + 8)

  function indexFromPointer(event: MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return null
    const fraction = (event.clientX - rect.left - left - PAD_X) / Math.max(innerW, 1)
    return Math.min(n - 1, Math.max(0, Math.round(fraction * (n - 1))))
  }

  function handleKey(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === 'ArrowRight') setHover((h) => Math.min(n - 1, (h ?? -1) + 1))
    else if (event.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? n) - 1))
    else if (event.key === 'Escape') setHover(null)
  }

  // Selective direct labels for a single series: the peak and the latest value.
  const labelled: number[] = []
  if (k === 1) {
    const values = series[0].values
    const peak = values.indexOf(Math.max(...values))
    labelled.push(peak)
    if (n - 1 !== peak) labelled.push(n - 1)
  }

  // End-of-line names for multiple series, skipping any that would collide.
  const endLabels = directLabels
    ? series
        .map((s, j) => ({ name: s.name, color: seriesColor(j), y: yAt(s.values[n - 1]) }))
        .sort((a, b) => a.y - b.y)
        .reduce<{ name: string; color: string; y: number }[]>((placed, item) => {
          if (placed.length === 0 || item.y - placed[placed.length - 1].y >= 14) placed.push(item)
          return placed
        }, [])
    : []

  const showMarkers = n <= 14

  return (
    <div className="relative" style={{ height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        tabIndex={0}
        role="img"
        aria-label={`${spec.title}. ${isArea ? 'Area' : 'Line'} chart with ${n} points. Use the arrow keys to read values.`}
        onMouseMove={(event) => setHover(indexFromPointer(event))}
        onMouseLeave={() => setHover(null)}
        onKeyDown={handleKey}
        onBlur={() => setHover(null)}
        className="outline-none focus-visible:ring-2 focus-visible:ring-accent/40 rounded-md"
      >
        {spec.yLabel && (
          <text x={0} y={10} fontSize={10} fill="var(--color-ink-muted)">
            {spec.yLabel}
          </text>
        )}

        {forecastFrom !== null && (
          <g>
            <rect x={xAt(forecastFrom)} y={top} width={xAt(n - 1) - xAt(forecastFrom) + PAD_X} height={plotH} fill="var(--color-chart-series-1)" opacity={0.06} rx={4} />
            <text x={xAt(forecastFrom) + 6} y={top + plotH - 8} fontSize={10} fontWeight={600} fill="var(--color-ink-muted)">
              Forecast
            </text>
          </g>
        )}

        {scale.ticks.map((tick, i) => (
          <g key={tick}>
            <line x1={left} x2={left + plotW} y1={yAt(tick)} y2={yAt(tick)} stroke="var(--color-chart-grid)" strokeWidth={1} />
            <text x={left - 8} y={yAt(tick) + 3.5} textAnchor="end" fontSize={10} fill="var(--color-ink-muted)">
              {tickLabels[i]}
            </text>
          </g>
        ))}

        {labels.map((label, i) =>
          i % step === 0 || i === n - 1 ? (
            <text
              key={`${label}-${i}`}
              x={xAt(i)}
              y={height - bottom + 17}
              textAnchor="middle"
              fontSize={10.5}
              fill="var(--color-ink-muted)"
            >
              {truncate(label, Math.max(4, Math.floor((slot * step) / 5.8)))}
            </text>
          ) : null,
        )}

        {isArea &&
          series.map((s, j) => (
            <path key={`area-${s.name}`} d={areaPath(s.values)} fill={seriesColor(j)} opacity={0.1} />
          ))}

        {hover !== null && (
          <line x1={xAt(hover)} x2={xAt(hover)} y1={top} y2={top + plotH} stroke="var(--color-chart-baseline)" strokeWidth={1} />
        )}

        {series.map((s, j) => (
          <g key={s.name}>
            {forecastFrom !== null ? (
              <>
                <path d={linePath(s.values, 0, forecastFrom - 1)} fill="none" stroke={seriesColor(j)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                <path d={linePath(s.values, forecastFrom - 1, n - 1)} fill="none" stroke={seriesColor(j)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 4" />
              </>
            ) : (
              <path d={linePath(s.values)} fill="none" stroke={seriesColor(j)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            )}
            {s.values.map((value, i) =>
              showMarkers || hover === i || i === n - 1 ? (
                <circle
                  key={i}
                  cx={xAt(i)}
                  cy={yAt(value)}
                  r={hover === i ? 5 : 4}
                  fill={seriesColor(j)}
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                />
              ) : null,
            )}
          </g>
        ))}

        {labelled.map((i) => {
          const value = series[0].values[i]
          const x = xAt(i)
          const text = formatValue(value, spec)
          const anchor = x - textWidth(text, 11) / 2 < left ? 'start' : x + textWidth(text, 11) / 2 > left + plotW + right - 6 ? 'end' : 'middle'
          return (
            <text key={`label-${i}`} x={x} y={yAt(value) - 11} textAnchor={anchor} fontSize={11} fontWeight={600} fill="var(--color-heading)">
              {text}
            </text>
          )
        })}

        {endLabels.map((item) => (
          <g key={item.name}>
            <line x1={left + plotW + 4} x2={left + plotW + 12} y1={item.y} y2={item.y} stroke={item.color} strokeWidth={2} strokeLinecap="round" />
            <text x={left + plotW + 16} y={item.y + 3.5} fontSize={10.5} fill="var(--color-ink)">
              {truncate(item.name, Math.floor((nameWidth - 12) / 6))}
            </text>
          </g>
        ))}
      </svg>

      {hover !== null && (
        <ChartTooltip
          x={xAt(hover)}
          y={top - 8}
          containerWidth={width}
          title={forecastFrom !== null && hover >= forecastFrom ? `${labels[hover]} · forecast` : labels[hover]}
          rows={series.map((s, j) => ({ color: seriesColor(j), name: s.name, value: formatValue(s.values[hover], spec) }))}
        />
      )}
    </div>
  )
}
