import { useMemo, useState } from 'react'
import type { ChartSpec } from '../../../ai/types'
import { ChartTooltip } from './ChartTooltip'
import { MUTED_MARK, RISK_COLORS, formatNumber, formatValue, niceScale, seriesColor, textWidth } from './chartUtils'

const R_MIN = 6
const R_MAX = 20

const RISK_ORDER = ['low', 'medium', 'high']
const RISK_NAMES: Record<string, string> = { low: 'Low risk', medium: 'Medium risk', high: 'High risk' }

/** Groups named low / medium / high are risk states and use the status colours; anything else is categorical. */
function buildGroups(points: NonNullable<ChartSpec['points']>) {
  const names = [...new Set(points.map((p) => (p.group ?? '').trim()).filter(Boolean))]
  const isRisk = names.length > 0 && names.every((name) => RISK_ORDER.includes(name.toLowerCase()))
  const ordered = isRisk ? RISK_ORDER.filter((r) => names.some((n) => n.toLowerCase() === r)) : names
  return ordered.map((name, index) => ({
    key: name.toLowerCase(),
    label: isRisk ? RISK_NAMES[name.toLowerCase()] : name,
    color: isRisk ? RISK_COLORS[name.toLowerCase()] : seriesColor(index),
  }))
}

export function ScatterChart({ spec, width }: { spec: ChartSpec; width: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const points = useMemo(() => spec.points ?? [], [spec.points])
  const plotHeight = Math.max(250, Math.min(330, width * 0.62))
  const height = plotHeight

  const groups = useMemo(() => buildGroups(points), [points])
  const colorOf = (group?: string) => groups.find((g) => g.key === (group ?? '').trim().toLowerCase())?.color ?? seriesColor(0)

  const xScale = niceScale(0, Math.max(...points.map((p) => p.x), spec.zone?.xMin ?? 0) * 1.05 || 1, 5)
  const yScale = niceScale(0, Math.max(...points.map((p) => p.y), spec.zone?.yMin ?? 0) * 1.08 || 1, 5)

  const yTicks = yScale.ticks.map((t) => formatNumber(t))
  const left = Math.max(32, ...yTicks.map((t) => textWidth(t, 10))) + 14
  const right = 14
  const top = 22
  const bottom = 40
  const plotW = Math.max(60, width - left - right)
  const plotH = height - top - bottom

  const xAt = (v: number) => left + ((v - xScale.min) / (xScale.max - xScale.min)) * plotW
  const yAt = (v: number) => top + plotH - ((v - yScale.min) / (yScale.max - yScale.min)) * plotH

  const sizes = points.map((p) => p.size ?? 1)
  const sMin = Math.sqrt(Math.min(...sizes))
  const sMax = Math.sqrt(Math.max(...sizes))
  const radiusOf = (size?: number) =>
    sMax === sMin ? (R_MIN + R_MAX) / 2 - 2 : R_MIN + ((Math.sqrt(size ?? 1) - sMin) / (sMax - sMin)) * (R_MAX - R_MIN)

  // Label every point when few; otherwise only the largest ones, and let hover carry the rest.
  const labelled = new Set(
    points.length <= (width >= 520 ? 10 : 6)
      ? points.map((_, i) => i)
      : points
          .map((p, i) => ({ i, weight: (p.size ?? 0) + p.y }))
          .sort((a, b) => b.weight - a.weight)
          .slice(0, 6)
          .map((item) => item.i),
  )

  const zone = spec.zone
  const zoneX = zone ? xAt(zone.xMin) : 0
  const zoneY = zone ? yAt(zone.yMin) : 0
  const hovered = hover !== null ? points[hover] : null

  return (
    <div>
      {groups.length > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          {groups.map((g) => (
            <span key={g.key} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: g.color }} />
              {g.label}
            </span>
          ))}
        </div>
      )}

      <div className="relative" style={{ height }}>
      <svg width={width} height={height} role="group" aria-label={`${spec.title}. Bubble chart.`} onMouseLeave={() => setHover(null)}>
        {zone && (
          <g>
            <rect x={zoneX} y={top} width={left + plotW - zoneX} height={Math.max(0, zoneY - top)} fill="var(--color-chart-critical)" opacity={0.07} rx={4} />
            <text x={zoneX + 8} y={Math.max(top + 14, zoneY - 8)} textAnchor="start" fontSize={10} fontWeight={600} fill="var(--color-ink-muted)">
              {zone.label}
            </text>
          </g>
        )}

        {yScale.ticks.map((tick, i) => (
          <g key={tick}>
            <line x1={left} x2={left + plotW} y1={yAt(tick)} y2={yAt(tick)} stroke="var(--color-chart-grid)" strokeWidth={1} />
            <text x={left - 8} y={yAt(tick) + 3.5} textAnchor="end" fontSize={10} fill="var(--color-ink-muted)">
              {yTicks[i]}
            </text>
          </g>
        ))}
        {xScale.ticks.map((tick) => (
          <text key={tick} x={xAt(tick)} y={top + plotH + 16} textAnchor="middle" fontSize={10} fill="var(--color-ink-muted)">
            {formatNumber(tick)}
          </text>
        ))}
        <line x1={left} x2={left + plotW} y1={top + plotH} y2={top + plotH} stroke="var(--color-chart-baseline)" strokeWidth={1} />

        {spec.xLabel && (
          <text x={left + plotW / 2} y={height - 6} textAnchor="middle" fontSize={10.5} fill="var(--color-ink-muted)">
            {spec.xLabel}
          </text>
        )}
        {spec.yLabel && (
          <text x={0} y={top - 8} fontSize={10.5} fill="var(--color-ink-muted)">
            {spec.yLabel}
          </text>
        )}

        {points.map((p, i) => {
          const cx = xAt(p.x)
          const cy = yAt(p.y)
          const r = radiusOf(p.size)
          const dim = hover !== null && hover !== i
          const labelW = textWidth(p.label, 10.5)
          const hitsBubble = (from: number, to: number) =>
            points.some((q, j) => j !== i && Math.abs(yAt(q.y) - cy) < radiusOf(q.size) + 8 && xAt(q.x) + radiusOf(q.size) > from && xAt(q.x) - radiusOf(q.size) < to)
          const rightOk = cx + r + 6 + labelW < left + plotW + right && !hitsBubble(cx + r + 6, cx + r + 6 + labelW)
          const leftOk = cx - r - 6 - labelW > left - 4 && !hitsBubble(cx - r - 6 - labelW, cx - r - 6)
          const labelRight = rightOk || !leftOk
          return (
            <g
              key={`${p.label}-${i}`}
              opacity={dim ? 0.35 : 1}
              tabIndex={0}
              role="img"
              aria-label={`${p.label}: ${spec.xLabel ?? 'x'} ${formatNumber(p.x)}, ${spec.yLabel ?? 'y'} ${formatValue(p.y, spec)}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="outline-none"
            >
              {/* >= 24px hit target regardless of mark size */}
              <circle cx={cx} cy={cy} r={Math.max(r + 4, 14)} fill="transparent" />
              <circle cx={cx} cy={cy} r={r} fill={colorOf(p.group)} fillOpacity={0.8} stroke="var(--color-surface)" strokeWidth={2} />
              {(labelled.has(i) || hover === i) && p.label && (
                <text
                  x={labelRight ? cx + r + 6 : cx - r - 6}
                  y={cy + 3.5}
                  textAnchor={labelRight ? 'start' : 'end'}
                  fontSize={10.5}
                  fill="var(--color-heading)"
                  stroke="var(--color-surface)"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {p.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {hovered && (
        <ChartTooltip
          x={xAt(hovered.x)}
          y={Math.max(24, yAt(hovered.y) - radiusOf(hovered.size) - 70)}
          containerWidth={width}
          title={hovered.label || 'Point'}
          rows={[
            { color: colorOf(hovered.group), name: spec.xLabel ?? 'X', value: formatNumber(hovered.x) },
            { color: colorOf(hovered.group), name: spec.yLabel ?? 'Y', value: formatValue(hovered.y, spec) },
            ...(hovered.size !== undefined ? [{ color: MUTED_MARK, name: 'Size', value: formatNumber(hovered.size) }] : []),
            ...(hovered.group ? [{ color: colorOf(hovered.group), name: 'Group', value: hovered.group }] : []),
          ]}
        />
      )}
      </div>
    </div>
  )
}
