import { clsx } from 'clsx'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Table, type TableColumn } from '../components/ui/Table'
import {
  controlTowerTabs,
  dueNextWeekReceivables,
  overdueReceivables,
  probabilityDotClass,
  probabilityLabel,
  probabilityTone,
  type ReceivableRow,
} from '../data/mockControlTower'

function TabBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="scrollbar-hide inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-border bg-white p-1">
      {controlTowerTabs.map((tab) => {
        const Icon = tab.icon
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={clsx(
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition',
              active ? 'bg-heading text-surface' : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

type ChartPoint = { key: string; label: string; sublabel: string; value: number }

function buildChartPoints(rows: ReceivableRow[], selected: Set<string>): ChartPoint[] {
  const effective = selected.size > 0 ? selected : new Set(rows.map((row) => row.id))
  const order: string[] = []
  const totals = new Map<string, ChartPoint>()

  for (const row of rows) {
    if (!effective.has(row.id)) continue
    const existing = totals.get(row.date)
    if (existing) {
      existing.value += row.value
    } else {
      totals.set(row.date, { key: row.date, label: row.date, sublabel: row.day, value: row.value })
      order.push(row.date)
    }
  }

  return order.map((date) => totals.get(date)!)
}

function ForecastChart({ points, colorVar }: { points: ChartPoint[]; colorVar: string }) {
  if (points.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-center text-xs text-ink-muted">
        Select rows in the table below to preview the forecast.
      </div>
    )
  }

  const width = 480
  const height = 160
  const pad = { top: 24, right: 12, bottom: 22, left: 12 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const max = Math.max(...points.map((p) => p.value)) * 1.25 || 1
  const n = points.length

  const xAt = (index: number) => pad.left + (n === 1 ? plotW / 2 : (index / (n - 1)) * plotW)
  const yAt = (value: number) => pad.top + plotH - (value / max) * plotH

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(p.value)}`).join(' ')
  const areaPath = `${linePath} L${xAt(n - 1)},${pad.top + plotH} L${xAt(0)},${pad.top + plotH} Z`
  const gradientId = `control-tower-chart-${colorVar.replace(/[^a-z]/gi, '')}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorVar} stopOpacity={0.25} />
          <stop offset="100%" stopColor={colorVar} stopOpacity={0} />
        </linearGradient>
      </defs>

      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={colorVar} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

      {points.map((p, i) => {
        const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'
        return (
          <g key={p.key}>
            <circle cx={xAt(i)} cy={yAt(p.value)} r={3} fill={colorVar} />
            <text x={xAt(i)} y={yAt(p.value) - 9} textAnchor={anchor} fontSize={10} fontWeight={600} fill="var(--color-heading)">
              ₹{p.value.toFixed(2)} Cr
            </text>
            <text x={xAt(i)} y={height - 6} textAnchor={anchor} fontSize={9} fill="var(--color-ink-muted)">
              {p.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function ProbabilityLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-muted">
      {(['most-likely', 'likely', 'not-expected'] as const).map((tier) => (
        <span key={tier} className="flex items-center gap-1.5">
          <span className={clsx('h-1.5 w-1.5 rounded-full', probabilityDotClass[tier])} />
          {probabilityLabel[tier]}
        </span>
      ))}
    </div>
  )
}

function ReceivablesTable({
  rows,
  selected,
  onSelectionChange,
}: {
  rows: ReceivableRow[]
  selected: Set<string>
  onSelectionChange: (keys: Set<string>) => void
}) {
  const columns: TableColumn<ReceivableRow>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row) => (
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-heading">{row.customer}</p>
          <p className="truncate text-[11px] text-ink-muted">{row.invoiceRef}</p>
        </div>
      ),
    },
    {
      key: 'bucket',
      header: 'Bucket',
      render: (row) => <span className="text-xs text-ink-muted">{row.bucket}</span>,
    },
    {
      key: 'date',
      header: 'Date & Day',
      render: (row) => (
        <span className="text-xs text-ink-muted">
          {row.date} <span className="text-ink-muted/70">· {row.day}</span>
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Value',
      align: 'right',
      render: (row) => <span className="text-xs font-semibold text-heading">₹{row.value.toFixed(2)} Cr</span>,
    },
    {
      key: 'probability',
      header: 'AI Prediction',
      align: 'right',
      render: (row) => (
        <Badge tone={probabilityTone[row.probability]} dot={false} className="px-2 py-0.5 text-[10px]">
          {probabilityLabel[row.probability]}
        </Badge>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      data={rows}
      rowKey={(row) => row.id}
      selectable
      selectedKeys={selected}
      onSelectionChange={onSelectionChange}
      className="text-xs"
    />
  )
}

export function ControlTowerPage() {
  const [activeTab, setActiveTab] = useState<string>('all')

  const [dueSelected, setDueSelected] = useState<Set<string>>(() => new Set(dueNextWeekReceivables.map((r) => r.id)))
  const [overdueSelected, setOverdueSelected] = useState<Set<string>>(() => new Set(overdueReceivables.map((r) => r.id)))

  const dueChartPoints = useMemo(() => buildChartPoints(dueNextWeekReceivables, dueSelected), [dueSelected])
  const overdueChartPoints = useMemo(() => buildChartPoints(overdueReceivables, overdueSelected), [overdueSelected])

  const dueTotal = useMemo(() => dueChartPoints.reduce((sum, p) => sum + p.value, 0), [dueChartPoints])
  const overdueTotal = useMemo(() => overdueChartPoints.reduce((sum, p) => sum + p.value, 0), [overdueChartPoints])

  return (
    <section className="@container space-y-4">
      <TabBar value={activeTab} onChange={setActiveTab} />

      <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-heading">Due Next Week</p>
            <span className="text-sm font-semibold text-heading">₹{dueTotal.toFixed(2)} Cr</span>
          </div>
          <div className="mt-2">
            <ForecastChart points={dueChartPoints} colorVar="rgb(16 185 129)" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-heading">Overdue</p>
            <span className="text-sm font-semibold text-heading">₹{overdueTotal.toFixed(2)} Cr</span>
          </div>
          <div className="mt-2">
            <ForecastChart points={overdueChartPoints} colorVar="rgb(244 63 94)" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-heading">Due Next Week</p>
            {/* <ProbabilityLegend /> */}
          </div>
          <ReceivablesTable rows={dueNextWeekReceivables} selected={dueSelected} onSelectionChange={setDueSelected} />
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-heading">Overdue</p>
            {/* <ProbabilityLegend /> */}
          </div>
          <ReceivablesTable rows={overdueReceivables} selected={overdueSelected} onSelectionChange={setOverdueSelected} />
        </Card>
      </div>
    </section>
  )
}
