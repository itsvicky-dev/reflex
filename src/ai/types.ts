export type AiMessageStatus = 'streaming' | 'done' | 'error' | 'stopped'

export type AiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  /** Widget the question was asked from (e.g. "Revenue"), when launched from a card's AI button. */
  contextLabel?: string
  /** Screen the message was sent from. */
  pageTitle?: string
  status?: AiMessageStatus
  error?: string
  createdAt: number
}

export type AiConversation = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  messages: AiMessage[]
}

/* ------------------------------------------------------------------ */
/* Rich blocks the model can emit inside its Markdown                  */
/* ------------------------------------------------------------------ */

export type ChartSeries = { name: string; values: number[] }

export type ScatterPoint = {
  label: string
  x: number
  y: number
  size?: number
  group?: string
}

export type ChartType = 'bar' | 'hbar' | 'line' | 'area' | 'scatter' | 'segmented'

export type ChartSpec = {
  type: ChartType
  title: string
  subtitle?: string
  prefix?: string
  suffix?: string
  xLabel?: string
  yLabel?: string
  labels: string[]
  series: ChartSeries[]
  stacked?: boolean
  highlight?: string
  forecastFrom?: number
  points?: ScatterPoint[]
  zone?: { xMin: number; yMin: number; label: string }
}

export type KpiTone = 'good' | 'bad' | 'warning' | 'neutral'
export type KpiDirection = 'up' | 'down' | 'flat'

export type KpiItem = {
  label: string
  value: string
  delta?: string
  tone: KpiTone
  direction?: KpiDirection
}

export type RichSegment =
  | { kind: 'markdown'; text: string }
  | { kind: 'chart'; spec: ChartSpec | null; pending: boolean }
  | { kind: 'kpis'; items: KpiItem[]; pending: boolean }
  | { kind: 'followups'; items: string[]; pending: boolean }
