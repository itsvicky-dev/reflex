import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import type { ChartSpec } from '../../../ai/types'

/** Categorical series colours: fixed order, never cycled (validated palette from index.css). */
export const SERIES_COLORS = [
  'var(--color-chart-series-1)',
  'var(--color-chart-series-2)',
  'var(--color-chart-series-3)',
  'var(--color-chart-series-4)',
] as const

export const MUTED_MARK = 'color-mix(in oklab, var(--color-ink-muted) 50%, var(--color-surface))'

export const RISK_COLORS: Record<string, string> = {
  low: 'var(--color-chart-good)',
  medium: 'var(--color-chart-warning)',
  high: 'var(--color-chart-critical)',
}

/** Observes an element's width so SVG charts render at real pixel size and text never gets scaled. */
export function useMeasuredWidth<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T | null>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    if (ref.current) setWidth(Math.floor(ref.current.getBoundingClientRect().width))
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const next = Math.floor(entries[0].contentRect.width)
      setWidth((prev) => (prev === next ? prev : next))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width]
}

/** Human-friendly number: thousands separators, at most 2 decimals, compact beyond a million. */
export function formatNumber(value: number): string {
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${trim(value / 1_000_000_000)}B`
  if (abs >= 1_000_000) return `${trim(value / 1_000_000)}M`
  if (abs >= 100_000) return `${trim(value / 1_000, 0)}K`
  if (abs >= 1000) return value.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return trim(value)
}

function trim(value: number, digits = 2) {
  return Number(value.toFixed(digits)).toLocaleString('en-US', { maximumFractionDigits: digits })
}

export function formatValue(value: number, spec: Pick<ChartSpec, 'prefix' | 'suffix'>): string {
  const sign = value < 0 ? '-' : ''
  return `${sign}${spec.prefix ?? ''}${formatNumber(Math.abs(value))}${spec.suffix ?? ''}`
}

/** Axis tick: prefix and suffix are dropped to keep ticks short unless the suffix is a short unit. */
export function formatTick(value: number, spec: Pick<ChartSpec, 'prefix' | 'suffix'>): string {
  const suffix = spec.suffix && spec.suffix.trim().length <= 3 ? spec.suffix : ''
  const sign = value < 0 ? '-' : ''
  return `${sign}${spec.prefix ?? ''}${formatNumber(Math.abs(value))}${suffix}`
}

/** "Nice" axis: round bounds and a clean step so ticks read 0 / 20 / 40 rather than 0 / 17.3 / 34.6. */
export function niceScale(min: number, max: number, targetTicks = 4): { min: number; max: number; ticks: number[] } {
  if (min === max) {
    max = max === 0 ? 1 : max * 1.1
  }
  const range = max - min
  const rough = range / targetTicks
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const residual = rough / magnitude
  const step = (residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 2.5 ? 2.5 : residual <= 5 ? 5 : 10) * magnitude
  const niceMin = Math.floor(min / step) * step
  const niceMax = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = niceMin; v <= niceMax + step / 2; v += step) ticks.push(Number(v.toFixed(10)))
  return { min: niceMin, max: niceMax, ticks }
}

export function truncate(text: string, maxChars: number): string {
  if (maxChars < 2) return ''
  return text.length <= maxChars ? text : `${text.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`
}

/** Approximate width of a 10-11px label, good enough for layout decisions without measuring the DOM. */
export const textWidth = (text: string, fontSize = 10.5) => text.length * fontSize * 0.58

/** A bar path whose data-end is rounded (4px) while the baseline end stays square. */
export function roundedBarPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  end: 'top' | 'bottom' | 'left' | 'right' | 'none',
): string {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2))
  if (end === 'none' || r === 0) return `M${x},${y}h${w}v${h}h${-w}Z`
  if (end === 'top') return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`
  if (end === 'bottom') return `M${x},${y}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w - r}Q${x + w},${y + h} ${x + w},${y + h - r}V${y}Z`
  if (end === 'right') return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`
  return `M${x + w},${y}H${x + r}Q${x},${y} ${x},${y + r}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w}Z`
}

export function seriesColor(index: number) {
  return SERIES_COLORS[index] ?? MUTED_MARK
}
