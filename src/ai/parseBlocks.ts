import type { ChartSeries, ChartSpec, ChartType, KpiDirection, KpiItem, KpiTone, RichSegment, ScatterPoint } from './types'

const CUSTOM_FENCE = /^```\s*(chart|kpis|followups)\s*$/i
const ANY_FENCE = /^```/
// Some models wrap plain Markdown (usually a table) in a fenced block; treat the fence as noise and render the content.
const MARKDOWN_FENCE = /^```\s*(table|markdown|md)\s*$/i

const CHART_TYPES: ChartType[] = ['bar', 'hbar', 'line', 'area', 'scatter', 'segmented']

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'string') {
    // Tolerate "1,200", "$128450" or "12.5%": keep only the characters a number can contain.
    const cleaned = value.replace(/[^0-9.eE+-]/g, '')
    const parsed = cleaned === '' ? NaN : Number(cleaned)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function toText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined
}

function normalizeChart(raw: unknown): ChartSpec | null {
  if (!isRecord(raw)) return null
  const type = CHART_TYPES.find((t) => t === raw.type)
  if (!type) return null

  const base = {
    type,
    title: toText(raw.title) ?? 'Chart',
    subtitle: toText(raw.subtitle),
    prefix: typeof raw.prefix === 'string' ? raw.prefix : undefined,
    suffix: typeof raw.suffix === 'string' ? raw.suffix : undefined,
    xLabel: toText(raw.xLabel),
    yLabel: toText(raw.yLabel),
    stacked: raw.stacked === true,
    highlight: toText(raw.highlight),
    forecastFrom: toNumber(raw.forecastFrom) ?? undefined,
  }

  if (type === 'scatter') {
    const points: ScatterPoint[] = (Array.isArray(raw.points) ? raw.points : []).flatMap((p) => {
      if (!isRecord(p)) return []
      const x = toNumber(p.x)
      const y = toNumber(p.y)
      if (x === null || y === null) return []
      return [{ label: toText(p.label) ?? '', x, y, size: toNumber(p.size) ?? undefined, group: toText(p.group) }]
    })
    if (points.length < 2) return null
    let zone: ChartSpec['zone']
    if (isRecord(raw.zone)) {
      const xMin = toNumber(raw.zone.xMin)
      const yMin = toNumber(raw.zone.yMin)
      if (xMin !== null && yMin !== null) zone = { xMin, yMin, label: toText(raw.zone.label) ?? 'Critical zone' }
    }
    return { ...base, labels: [], series: [], points, zone }
  }

  const labels = (Array.isArray(raw.labels) ? raw.labels : []).map((l) => String(l)).slice(0, 24)
  if (labels.length === 0) return null

  const series: ChartSeries[] = (Array.isArray(raw.series) ? raw.series : [])
    .flatMap((s, index) => {
      if (!isRecord(s) || !Array.isArray(s.values)) return []
      const raws: unknown[] = s.values
      const values = labels.map((_, i) => toNumber(raws[i]) ?? 0)
      return [{ name: toText(s.name) ?? `Series ${index + 1}`, values }]
    })
    .slice(0, 4)
  if (series.length === 0) return null

  return { ...base, labels, series }
}

const TONES: KpiTone[] = ['good', 'bad', 'warning', 'neutral']
const DIRECTIONS: KpiDirection[] = ['up', 'down', 'flat']

function normalizeKpis(raw: unknown): KpiItem[] {
  if (!Array.isArray(raw)) return []
  return raw.slice(0, 4).flatMap((item): KpiItem[] => {
    if (!isRecord(item)) return []
    const label = toText(item.label)
    const value = typeof item.value === 'number' ? String(item.value) : toText(item.value)
    if (!label || !value) return []
    return [
      {
        label,
        value,
        delta: toText(item.delta),
        tone: TONES.find((t) => t === item.tone) ?? 'neutral',
        direction: DIRECTIONS.find((d) => d === item.direction),
      },
    ]
  })
}

function normalizeFollowups(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, 4)
}

function parseJson(body: string): unknown {
  const text = body.trim()
  try {
    return JSON.parse(text)
  } catch {
    // Models occasionally wrap JSON in stray characters; try the outermost object / array.
    const start = Math.min(...['{', '['].map((c) => text.indexOf(c)).filter((i) => i >= 0), Infinity)
    const end = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'))
    if (Number.isFinite(start) && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

/**
 * Splits a (possibly still streaming) answer into Markdown and rich blocks.
 * A block whose closing fence has not arrived yet is reported as `pending` so the UI can show a placeholder
 * instead of flashing half-written JSON.
 */
export function parseRichContent(text: string, streaming: boolean): RichSegment[] {
  const segments: RichSegment[] = []
  const lines = text.split('\n')
  let markdown: string[] = []
  let inCode = false

  const flushMarkdown = () => {
    const joined = markdown.join('\n').trim()
    if (joined) segments.push({ kind: 'markdown', text: joined })
    markdown = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    if (inCode) {
      markdown.push(line)
      if (ANY_FENCE.test(trimmed)) inCode = false
      continue
    }

    if (MARKDOWN_FENCE.test(trimmed)) {
      let end = -1
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() === '```') {
          end = j
          break
        }
      }
      markdown.push('', ...lines.slice(i + 1, end === -1 ? lines.length : end), '')
      i = end === -1 ? lines.length : end
      continue
    }

    const custom = trimmed.match(CUSTOM_FENCE)
    if (custom) {
      const kind = custom[1].toLowerCase() as 'chart' | 'kpis' | 'followups'
      let end = -1
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim() === '```') {
          end = j
          break
        }
      }
      const closed = end !== -1
      const body = lines.slice(i + 1, closed ? end : lines.length).join('\n')

      flushMarkdown()
      if (!closed && streaming) {
        segments.push(kind === 'chart' ? { kind, spec: null, pending: true } : { kind, items: [], pending: true })
      } else {
        const parsed = parseJson(body)
        if (kind === 'chart') segments.push({ kind, spec: normalizeChart(parsed), pending: false })
        else if (kind === 'kpis') segments.push({ kind, items: normalizeKpis(parsed), pending: false })
        else segments.push({ kind, items: normalizeFollowups(parsed), pending: false })
      }
      i = closed ? end : lines.length
      continue
    }

    if (ANY_FENCE.test(trimmed)) inCode = true
    markdown.push(line)
  }

  flushMarkdown()
  return segments
}

/** Readable plain Markdown for "copy": drops follow-ups, summarises charts and KPI strips. */
export function toCopyText(text: string): string {
  return parseRichContent(text, false)
    .map((segment) => {
      if (segment.kind === 'markdown') return segment.text
      if (segment.kind === 'chart') return segment.spec ? `_Chart: ${segment.spec.title}_` : ''
      if (segment.kind === 'kpis') return segment.items.map((k) => `**${k.label}:** ${k.value}${k.delta ? ` (${k.delta})` : ''}`).join(' · ')
      return ''
    })
    .filter(Boolean)
    .join('\n\n')
}
