import { useState } from 'react'
import type { ChartSpec } from '../../../ai/types'
import { ChartTooltip } from './ChartTooltip'
import {
  MUTED_MARK,
  formatTick,
  formatValue,
  niceScale,
  roundedBarPath,
  seriesColor,
  textWidth,
  truncate,
} from './chartUtils'

const BAR_MAX = 24
const BAR_GAP = 2
const RADIUS = 4

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)

function barFill(spec: ChartSpec, label: string, seriesIndex: number) {
  // Emphasis: one series, one bar in the accent colour, the rest recede to neutral.
  if (spec.highlight && spec.series.length === 1) {
    return label.toLowerCase() === spec.highlight.toLowerCase() ? seriesColor(0) : MUTED_MARK
  }
  return seriesColor(seriesIndex)
}

/* ------------------------------------------------------------------ */
/* Vertical columns                                                    */
/* ------------------------------------------------------------------ */

export function ColumnChart({ spec, width }: { spec: ChartSpec; width: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const { labels, series } = spec
  const n = labels.length
  const k = series.length
  const stacked = Boolean(spec.stacked) && k > 1
  const height = 230

  const totals = labels.map((_, i) => sum(series.map((s) => Math.max(0, s.values[i]))))
  const allValues = series.flatMap((s) => s.values)
  const dataMax = stacked ? Math.max(...totals) : Math.max(...allValues, 0)
  const dataMin = stacked ? 0 : Math.min(...allValues, 0)
  const scale = niceScale(dataMin, dataMax || 1)

  const tickLabels = scale.ticks.map((tick) => formatTick(tick, spec))
  const left = Math.max(30, ...tickLabels.map((l) => textWidth(l, 10))) + 12
  const right = 8
  const plotW = Math.max(40, width - left - right)
  const bandW = plotW / n

  // Prefer truncating horizontal labels (the tooltip and table carry the full text); rotate only when bands are very narrow.
  const maxChars = Math.floor((bandW - 2) / 5.4)
  const longest = Math.max(...labels.map((l) => l.length))
  const rotate = maxChars < 5 && longest > maxChars
  const top = 24
  const bottom = rotate ? 58 : 30
  const plotH = height - top - bottom

  const yAt = (value: number) => top + plotH - ((value - scale.min) / (scale.max - scale.min)) * plotH
  const baseline = yAt(0)

  const barsPerBand = stacked ? 1 : k
  const barW = Math.max(3, Math.min(BAR_MAX, (bandW * 0.7 - (barsPerBand - 1) * BAR_GAP) / barsPerBand))
  const groupW = barsPerBand * barW + (barsPerBand - 1) * BAR_GAP
  const labelCaps = k === 1 && n <= 8

  return (
    <div className="relative" style={{ height }}>
      <svg width={width} height={height} role="group" aria-label={`${spec.title}. Column chart.`} onMouseLeave={() => setHover(null)}>
        {spec.yLabel && (
          <text x={0} y={10} fontSize={10} fill="var(--color-ink-muted)">
            {spec.yLabel}
          </text>
        )}

        {scale.ticks.map((tick, i) => (
          <g key={tick}>
            <line x1={left} x2={width - right} y1={yAt(tick)} y2={yAt(tick)} stroke="var(--color-chart-grid)" strokeWidth={1} />
            <text x={left - 8} y={yAt(tick) + 3.5} textAnchor="end" fontSize={10} fill="var(--color-ink-muted)">
              {tickLabels[i]}
            </text>
          </g>
        ))}

        {hover !== null && (
          <rect x={left + hover * bandW} y={top} width={bandW} height={plotH} fill="var(--color-surface-hover)" opacity={0.7} rx={4} />
        )}

        {labels.map((label, i) => {
          const gx = left + i * bandW + (bandW - groupW) / 2
          const cx = left + i * bandW + bandW / 2
          const dim = hover !== null && hover !== i

          return (
            <g
              key={`${label}-${i}`}
              opacity={dim ? 0.55 : 1}
              tabIndex={0}
              role="img"
              aria-label={`${label}: ${series.map((s) => `${s.name} ${formatValue(s.values[i], spec)}`).join(', ')}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="outline-none"
            >
              {stacked
                ? (() => {
                    let cumulative = 0
                    const lastIndex = series.reduce((last, s, j) => (s.values[i] > 0 ? j : last), -1)
                    return series.map((s, j) => {
                      const value = Math.max(0, s.values[i])
                      if (value === 0) return null
                      const y1 = yAt(cumulative + value)
                      const y0 = yAt(cumulative) - (cumulative > 0 ? BAR_GAP : 0)
                      cumulative += value
                      return (
                        <path
                          key={s.name}
                          d={roundedBarPath(gx, y1, barW, Math.max(1, y0 - y1), RADIUS, j === lastIndex ? 'top' : 'none')}
                          fill={seriesColor(j)}
                        />
                      )
                    })
                  })()
                : series.map((s, j) => {
                    const value = s.values[i]
                    if (value === 0) return null
                    const x = gx + j * (barW + BAR_GAP)
                    const y = value > 0 ? yAt(value) : baseline
                    const h = Math.max(1, Math.abs(yAt(value) - baseline))
                    return (
                      <path
                        key={s.name}
                        d={roundedBarPath(x, y, barW, h, RADIUS, value > 0 ? 'top' : 'bottom')}
                        fill={barFill(spec, label, j)}
                      />
                    )
                  })}

              {(labelCaps || stacked) && n <= 8 && (
                <text
                  x={cx}
                  y={yAt(stacked ? totals[i] : Math.max(series[0].values[i], 0)) - 7}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="var(--color-heading)"
                >
                  {formatValue(stacked ? totals[i] : series[0].values[i], spec)}
                </text>
              )}

              {rotate ? (
                <text
                  x={cx}
                  y={height - bottom + 14}
                  textAnchor="end"
                  fontSize={10}
                  fill="var(--color-ink-muted)"
                  transform={`rotate(-35 ${cx} ${height - bottom + 14})`}
                >
                  {truncate(label, 16)}
                </text>
              ) : (
                <text x={cx} y={height - bottom + 17} textAnchor="middle" fontSize={10.5} fill="var(--color-ink-muted)">
                  {truncate(label, maxChars)}
                </text>
              )}

              {/* generous hit area: the whole band, full plot height */}
              <rect x={left + i * bandW} y={top} width={bandW} height={plotH + bottom} fill="transparent" />
            </g>
          )
        })}

        <line x1={left} x2={width - right} y1={baseline} y2={baseline} stroke="var(--color-chart-baseline)" strokeWidth={1} />
      </svg>

      {hover !== null && (
        <ChartTooltip
          x={left + hover * bandW + bandW / 2}
          y={top - 6}
          containerWidth={width}
          title={labels[hover]}
          rows={[
            ...series.map((s, j) => ({ color: barFill(spec, labels[hover], j), name: s.name, value: formatValue(s.values[hover], spec) })),
            ...(stacked ? [{ color: 'var(--color-ink-muted)', name: 'Total', value: formatValue(totals[hover], spec), emphasis: true }] : []),
          ]}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Horizontal ranked bars                                              */
/* ------------------------------------------------------------------ */

export function RankedBarChart({ spec, width }: { spec: ChartSpec; width: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const { labels, series } = spec
  const n = labels.length
  const k = series.length
  const stacked = Boolean(spec.stacked) && k > 1
  const single = stacked || k === 1

  const totals = labels.map((_, i) => (stacked ? sum(series.map((s) => Math.max(0, s.values[i]))) : Math.max(0, ...series.map((s) => s.values[i]))))
  const max = Math.max(...totals, 1)

  const labelPx = Math.min(width * 0.4, Math.max(64, Math.max(...labels.map((l) => textWidth(l, 11))) + 4))
  const maxChars = Math.floor(labelPx / 6.2)
  const valueTexts = labels.map((_, i) => formatValue(stacked ? totals[i] : Math.max(...series.map((s) => s.values[i])), spec))
  const valuePx = Math.max(...valueTexts.map((t) => textWidth(t, 11))) + 10
  const x0 = labelPx + 10
  const plotW = Math.max(40, width - x0 - valuePx)

  const barH = single ? 16 : 11
  const rowH = single ? 30 : k * (barH + BAR_GAP) + 14
  const height = n * rowH + 6
  const valueLabels = single || n * k <= 12

  return (
    <div className="relative" style={{ height }}>
      <svg width={width} height={height} role="group" aria-label={`${spec.title}. Ranked bar chart.`} onMouseLeave={() => setHover(null)}>
        {labels.map((label, i) => {
          const y = i * rowH + 3
          const dim = hover !== null && hover !== i
          return (
            <g
              key={`${label}-${i}`}
              opacity={dim ? 0.55 : 1}
              tabIndex={0}
              role="img"
              aria-label={`${label}: ${series.map((s) => `${s.name} ${formatValue(s.values[i], spec)}`).join(', ')}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="outline-none"
            >
              {hover === i && <rect x={0} y={y - 2} width={width} height={rowH} rx={6} fill="var(--color-surface-hover)" opacity={0.7} />}

              <text x={2} y={y + rowH / 2 + 1} dominantBaseline="middle" fontSize={11} fill="var(--color-ink)">
                {truncate(label, maxChars)}
              </text>

              {stacked
                ? (() => {
                    let cumulative = 0
                    const lastIndex = series.reduce((last, s, j) => (s.values[i] > 0 ? j : last), -1)
                    return series.map((s, j) => {
                      const value = Math.max(0, s.values[i])
                      if (value === 0) return null
                      const xStart = x0 + (cumulative / max) * plotW + (cumulative > 0 ? BAR_GAP : 0)
                      const xEnd = x0 + ((cumulative + value) / max) * plotW
                      cumulative += value
                      return (
                        <path
                          key={s.name}
                          d={roundedBarPath(xStart, y + (rowH - barH) / 2 - 1, Math.max(1, xEnd - xStart), barH, RADIUS, j === lastIndex ? 'right' : 'none')}
                          fill={seriesColor(j)}
                        />
                      )
                    })
                  })()
                : series.map((s, j) => {
                    const value = Math.max(0, s.values[i])
                    const by = single ? y + (rowH - barH) / 2 - 1 : y + 4 + j * (barH + BAR_GAP)
                    const len = Math.max(value === 0 ? 0 : 2, (value / max) * plotW)
                    return (
                      <g key={s.name}>
                        {value > 0 && <path d={roundedBarPath(x0, by, len, barH, RADIUS, 'right')} fill={barFill(spec, label, j)} />}
                        {valueLabels && !single && (
                          <text x={x0 + len + 6} y={by + barH / 2 + 0.5} dominantBaseline="middle" fontSize={10.5} fill="var(--color-heading)">
                            {formatValue(s.values[i], spec)}
                          </text>
                        )}
                      </g>
                    )
                  })}

              {single && (
                <text
                  x={x0 + (totals[i] / max) * plotW + 7}
                  y={y + rowH / 2 + 0.5}
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="var(--color-heading)"
                >
                  {valueTexts[i]}
                </text>
              )}

              <rect x={0} y={y - 2} width={width} height={rowH} fill="transparent" />
            </g>
          )
        })}
        <line x1={x0} x2={x0} y1={0} y2={height} stroke="var(--color-chart-baseline)" strokeWidth={1} />
      </svg>

      {hover !== null && (
        <ChartTooltip
          x={Math.min(x0 + (totals[hover] / max) * plotW + valuePx + 100, width - 90)}
          y={hover * rowH - 4}
          containerWidth={width}
          title={labels[hover]}
          rows={[
            ...series.map((s, j) => ({ color: barFill(spec, labels[hover], j), name: s.name, value: formatValue(s.values[hover], spec) })),
            ...(stacked ? [{ color: 'var(--color-ink-muted)', name: 'Total', value: formatValue(totals[hover], spec), emphasis: true }] : []),
          ]}
        />
      )}
    </div>
  )
}
