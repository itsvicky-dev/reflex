import { clsx } from 'clsx'
import { BarChart3, CalendarDays, ChevronDown, GripVertical, LayoutGrid, UsersRound, X } from 'lucide-react'
import { useMemo, useState, type DragEvent } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import {
  controlTowerTabs,
  dueNextWeekReceivables,
  probabilityLabel,
  probabilityTone,
  statusBucketLabel,
  statusBucketOrder,
  statusBucketTone,
  suggestStatusBucket,
  type ReceivableRow,
  type StatusBucket,
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

function LabeledSwitch({
  label,
  checked,
  onChange,
  className,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  className?: string
}) {
  return (
    <div className={clsx('flex shrink-0 items-center gap-2', className)}>
      <span className="text-xs font-medium whitespace-nowrap text-ink-muted">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`Toggle ${label.toLowerCase()}`}
        onClick={() => onChange(!checked)}
        className={clsx('relative h-5 w-9 shrink-0 rounded-full transition', checked ? 'bg-accent' : 'bg-border')}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? '' : 'translate-x-[-15px]',
          )}
        />
      </button>
    </div>
  )
}

function ControlTowerFilterBar({
  includeOverview,
  onToggleIncludeOverview,
  aiSuggestOn,
  onToggleAi,
  showChart,
  onToggleChart,
}: {
  includeOverview: boolean
  onToggleIncludeOverview: (value: boolean) => void
  aiSuggestOn: boolean
  onToggleAi: (value: boolean) => void
  showChart: boolean
  onToggleChart: () => void
}) {
  return (
    <div className="bg-white p-3 rounded-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <Button type="button" variant="accent-outline" size="xs">
            <UsersRound className="h-3.5 w-3.5" />
            Add Segment
          </Button>
          <Button type="button" variant="accent-outline" size="xs">
            <CalendarDays className="h-3.5 w-3.5" />
            Date
            <ChevronDown className="h-3 w-3" />
          </Button>
          <LabeledSwitch label="Include Overview" checked={includeOverview} onChange={onToggleIncludeOverview} />
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <LabeledSwitch label="AI Suggestion" checked={aiSuggestOn} onChange={onToggleAi} />
          <button
            type="button"
            onClick={onToggleChart}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink"
          >
            {showChart ? <LayoutGrid className="h-3.5 w-3.5 text-ink-muted" /> : <BarChart3 className="h-3.5 w-3.5 text-ink-muted" />}
            {showChart ? 'Grid View' : 'Chart View'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReceivableCard({
  row,
  detailed = false,
  onRemove,
}: {
  row: ReceivableRow
  detailed?: boolean
  onRemove?: (id: string) => void
}) {
  return (
    <div
      draggable
      onDragStart={(event: DragEvent<HTMLDivElement>) => {
        event.dataTransfer.setData('text/plain', row.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      className="group relative flex cursor-grab items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 shadow-sm active:cursor-grabbing"
    >
      <div className="flex min-w-0 items-center gap-2">
        <GripVertical className="h-3.5 w-3.5 shrink-0 text-ink-muted/50" />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-heading">{row.customer}</p>
          {detailed && (
            <p className="truncate text-[10px] text-ink-muted">
              {row.invoiceRef} · {row.bucket} · {row.date} ({row.day})
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {detailed && (
          <Badge tone={probabilityTone[row.probability]} dot={false} className="px-1.5 py-0.5 text-[9px]">
            {probabilityLabel[row.probability]}
          </Badge>
        )}
        <span className="text-xs font-semibold text-heading">${row.value.toFixed(2)}</span>
      </div>
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${row.customer}`}
          onClick={() => onRemove(row.id)}
          className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border border-border bg-surface text-ink-muted opacity-0 shadow-sm transition group-hover:opacity-100 hover:border-rose-300 hover:text-rose-500"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  )
}

const statusBucketColor: Record<StatusBucket, string> = {
  committed: 'rgb(16 185 129)',
  probable: 'var(--color-accent)',
  possible: 'rgb(245 158 11)',
  doubtful: 'rgb(244 63 94)',
}

type BucketChartPoint = { key: string; label: string; value: number; color: string }

function BucketStatusChart({ data }: { data: BucketChartPoint[] }) {
  const width = 640
  const height = 300
  const pad = { top: 28, right: 16, bottom: 28, left: 16 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const max = Math.max(...data.map((d) => d.value), 1) * 1.2
  const n = data.length
  const gap = 28
  const barW = (plotW - gap * (n - 1)) / n

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {data.map((d, i) => {
        const x = pad.left + i * (barW + gap)
        const barH = (d.value / max) * plotH
        const y = pad.top + plotH - barH
        return (
          <g key={d.key}>
            <rect x={x} y={y} width={barW} height={Math.max(barH, 1)} rx={6} fill={d.color} />
            <text x={x + barW / 2} y={y - 10} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--color-heading)">
              ${d.value.toFixed(2)}
            </text>
            <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize={12} fill="var(--color-ink-muted)">
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function DueNextWeekPanel({
  rows,
  onDropToTable,
  totalCount,
}: {
  rows: ReceivableRow[]
  onDropToTable: (event: DragEvent<HTMLDivElement>) => void
  totalCount: number
}) {
  return (
    <Card className="flex min-h-0 flex-col overflow-hidden @4xl:h-full @4xl:w-[30%] @4xl:shrink-0">
      <div className="shrink-0 border-b border-border px-4 py-3">
        <p className="text-sm font-semibold text-heading">Due Next Week</p>
        <p className="text-[11px] text-ink-muted">
          {rows.length} of {totalCount} pending placement
        </p>
      </div>
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDropToTable}
        className="flex-1 space-y-2 overflow-y-auto p-3"
      >
        {rows.length === 0 ? (
          <p className="py-8 text-center text-xs text-ink-muted">All receivables have been placed.</p>
        ) : (
          rows.map((row) => <ReceivableCard key={row.id} row={row} detailed />)
        )}
      </div>
    </Card>
  )
}

function StatusQuadrant({
  bucket,
  rows,
  onDrop,
  onRemove,
}: {
  bucket: StatusBucket
  rows: ReceivableRow[]
  onDrop: (id: string) => void
  onRemove: (id: string) => void
}) {
  const [isOver, setIsOver] = useState(false)
  const total = rows.reduce((sum, row) => sum + row.value, 0)

  return (
    <Card
      onDragOver={(event) => {
        event.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setIsOver(false)
        const id = event.dataTransfer.getData('text/plain')
        if (id) onDrop(id)
      }}
      className={clsx('flex h-full min-h-[190px] flex-col overflow-hidden transition', isOver && 'ring-2 ring-accent')}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-3 py-2">
        <Badge tone={statusBucketTone[bucket]} dot={false} className="px-2 py-0.5 text-[10px]">
          {statusBucketLabel[bucket]}
        </Badge>
        <span className="text-xs font-semibold text-heading">${total.toFixed(2)}</span>
      </div>
      <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-ink-muted">Drop receivables here</p>
        ) : (
          rows.map((row) => <ReceivableCard key={row.id} row={row} onRemove={onRemove} />)
        )}
      </div>
    </Card>
  )
}

export function ControlTowerPage() {
  const [activeTab, setActiveTab] = useState<string>('all')

  const rows = dueNextWeekReceivables
  const [placements, setPlacements] = useState<Record<string, StatusBucket | null>>(() =>
    Object.fromEntries(rows.map((row) => [row.id, null])),
  )
  const [aiSuggestOn, setAiSuggestOn] = useState(false)
  const [includeOverview, setIncludeOverview] = useState(true)
  const [showChart, setShowChart] = useState(false)

  const handleToggleAi = (next: boolean) => {
    setAiSuggestOn(next)
    setPlacements(() =>
      Object.fromEntries(rows.map((row) => [row.id, next ? suggestStatusBucket(row) : null])),
    )
  }

  const handleDropToBucket = (id: string, bucket: StatusBucket) => {
    setPlacements((prev) => ({ ...prev, [id]: bucket }))
  }

  const handleDropToTable = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/plain')
    if (id) setPlacements((prev) => ({ ...prev, [id]: null }))
  }

  const handleRemoveFromBucket = (id: string) => {
    setPlacements((prev) => ({ ...prev, [id]: null }))
  }

  const unassignedRows = useMemo(() => rows.filter((row) => !placements[row.id]), [rows, placements])

  const placedByBucket = useMemo(() => {
    const map = Object.fromEntries(statusBucketOrder.map((bucket) => [bucket, [] as ReceivableRow[]])) as Record<
      StatusBucket,
      ReceivableRow[]
    >
    for (const row of rows) {
      const bucket = placements[row.id]
      if (bucket) map[bucket].push(row)
    }
    return map
  }, [rows, placements])

  const chartData: BucketChartPoint[] = useMemo(
    () => [
      {
        key: 'pending',
        label: 'Pending',
        value: unassignedRows.reduce((sum, row) => sum + row.value, 0),
        color: 'var(--color-ink-muted)',
      },
      ...statusBucketOrder.map((bucket) => ({
        key: bucket,
        label: statusBucketLabel[bucket],
        value: placedByBucket[bucket].reduce((sum, row) => sum + row.value, 0),
        color: statusBucketColor[bucket],
      })),
    ],
    [unassignedRows, placedByBucket],
  )

  return (
    <section className="@container flex h-full flex-col gap-4">
      {/* <TabBar value={activeTab} onChange={setActiveTab} /> */}

      <ControlTowerFilterBar
        includeOverview={includeOverview}
        onToggleIncludeOverview={setIncludeOverview}
        aiSuggestOn={aiSuggestOn}
        onToggleAi={handleToggleAi}
        showChart={showChart}
        onToggleChart={() => setShowChart((prev) => !prev)}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 @4xl:flex-row">
        <DueNextWeekPanel rows={unassignedRows} onDropToTable={handleDropToTable} totalCount={rows.length} />

        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {showChart ? (
            <Card className="flex flex-1 flex-col p-5">
              <p className="text-sm font-semibold text-heading">Receivables by Status</p>
              <div className="mt-2 min-h-[320px] flex-1">
                <BucketStatusChart data={chartData} />
              </div>
            </Card>
          ) : (
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 @sm:grid-cols-2 @sm:grid-rows-2">
              {statusBucketOrder.map((bucket) => (
                <StatusQuadrant
                  key={bucket}
                  bucket={bucket}
                  rows={placedByBucket[bucket]}
                  onDrop={(id) => handleDropToBucket(id, bucket)}
                  onRemove={handleRemoveFromBucket}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
