import { clsx } from 'clsx'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Info,
  Landmark,
  LineChart as LineChartIcon,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  Users2,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { RiskMatrixChart } from '../components/ai/charts/RiskMatrixChart'
import { AskAiPopover } from '../components/ui/AskAiPopover'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ReconciliationBreakdownChart } from '../components/ui/ReconciliationBreakdownChart'
import {
  outstandingAgeing,
  outstandingByCustomerType,
  outstandingChangePct,
  outstandingTrend,
  reconciliationRate,
  recentReconciliationActivity,
  totalOpenInvoices,
  totalOutstanding,
  type PaymentMethod,
  type RecentActivityItem,
} from '../data/mockHome'
import {
  attentionItems,
  reconciliationBreakdownByFilter,
  todaysReconciliationGeneratedAt,
  totalReceivedAmount,
  type AttentionItem,
  type ReconciliationPeriodFilter,
} from '../data/mockReconciliationHub'
import {
  cashFlowForecast,
  customerRiskMatrix,
  outstandingDelayTrend,
  revenueTrend,
  type CashFlowPoint,
  type OutstandingDelayPoint,
  type RevenueWeek,
} from '../data/mockFinPilot'
import { recentActivityTone } from '../lib/status'

const USER_FIRST_NAME = 'Praburaju'

function getDayPeriod(hour: number) {
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function getGreetingMessage() {
  const now = new Date()
  const period = getDayPeriod(now.getHours())
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' })
  return `Happy ${dayName} ${period}`
}

function formatClockTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)

const dateFilterOptions: { id: ReconciliationPeriodFilter; label: string; cardLabel: string }[] = [
  { id: 'today', label: 'Today', cardLabel: "Today's Reconciliation" },
  { id: 'week', label: 'This Week', cardLabel: "This Week's Reconciliation" },
  { id: 'month', label: 'This Month', cardLabel: "This Month's Reconciliation" },
  { id: 'year', label: 'This Year', cardLabel: "This Year's Reconciliation" },
]

const attentionIcons: Record<string, LucideIcon> = {
  'unmatched-payments': AlertTriangle,
  'partial-payments': AlertTriangle,
  'attention-cases': AlertCircle,
  'outstanding-90': AlertCircle,
  'unmapped-payees': Users2,
}

const toneClasses: Record<AttentionItem['tone'], { chip: string; button: string }> = {
  danger: {
    chip: 'bg-ink/10 text-heading',
    button: 'border-border text-ink hover:bg-surface-hover',
  },
  warning: {
    chip: 'bg-surface-hover text-ink-muted',
    button: 'border-border hover:bg-surface-hover',
  },
  accent: {
    chip: 'bg-accent/10 text-accent',
    button: 'border-accent/30 text-accent hover:bg-accent/10',
  },
}

const ageingBarClasses: Record<string, string> = {
  success: 'bg-ink-muted/30',
  warning: 'bg-ink-muted',
  orange: 'bg-ink',
  danger: 'bg-heading',
}

const methodIcons: Record<PaymentMethod, LucideIcon> = {
  PayNow: Landmark,
  Transfer: ArrowLeftRight,
  COD: Clock,
}

function MiniSparkline({ data, className }: { data: number[]; className?: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 30 - ((value - min) / range) * 26
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={className}>
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CardHeader({ icon: Icon, title, aiSuggestions }: { icon: LucideIcon; title: string; aiSuggestions?: string[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {/* <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted">
        <Icon className="h-3.5 w-3.5" />
      </div> */}
      <h3 className="text-sm font-semibold text-heading">{title}</h3>
      <AskAiPopover contextLabel={title} suggestions={aiSuggestions} />
    </div>
  )
}

function MethodCell({ method }: { method: PaymentMethod }) {
  if (method === 'PayNow') {
    return (
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-ink">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-accent text-[9px] font-bold text-accent-content">P</span>
        PayNow
      </span>
    )
  }
  const Icon = methodIcons[method]
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-ink">
      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
      {method}
    </span>
  )
}

const activityColumnLabels = ['Customer', 'Invoice / Ref', 'Payment', 'Method', 'Status', 'Updated']

function RecentActivityTable({ items }: { items: RecentActivityItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-border">
            {activityColumnLabels.map((label) => (
              <th key={label} className="whitespace-nowrap px-2 py-2 font-medium text-ink-muted">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="whitespace-nowrap px-2 py-2 font-medium text-heading">{item.customer}</td>
              <td className="whitespace-nowrap px-2 py-2">
                {item.invoiceRef ? (
                  <span className="font-medium text-accent underline underline-offset-2">{item.invoiceRef}</span>
                ) : (
                  <span className="text-ink-muted">—</span>
                )}
              </td>
              <td className="whitespace-nowrap px-2 py-2 font-medium text-heading">{currency(item.amount)}</td>
              <td className="whitespace-nowrap px-2 py-2">
                <MethodCell method={item.method} />
              </td>
              <td className="whitespace-nowrap px-2 py-2">
                <Badge tone={recentActivityTone[item.status]}>{item.status}</Badge>
              </td>
              <td className="whitespace-nowrap px-2 py-2 text-ink-muted">{item.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CashFlowChart({ points }: { points: CashFlowPoint[] }) {
  const width = 560
  const height = 180
  const pad = { top: 26, right: 12, bottom: 22, left: 12 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const max = Math.max(...points.map((p) => p.value)) * 1.2
  const n = points.length

  const xAt = (index: number) => pad.left + (index / (n - 1)) * plotW
  const yAt = (value: number) => pad.top + plotH - (value / max) * plotH

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(p.value)}`).join(' ')
  const areaPath = `${linePath} L${xAt(n - 1)},${pad.top + plotH} L${xAt(0)},${pad.top + plotH} Z`

  const forecastStart = points.findIndex((p) => p.forecast)
  const peakIndex = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0)

  return (
    <div>
      {forecastStart !== -1 && (
        <div
          className="mb-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
          style={{
            marginLeft: `${(xAt(forecastStart) / width) * 100}%`,
            marginRight: `${((width - xAt(n - 1)) / width) * 100}%`,
          }}
        >
          <span className="h-px flex-1 bg-emerald-500/40" />
          Forecast
          <span className="h-px flex-1 bg-emerald-500/40" />
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id="home-cashflow-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#home-cashflow-fill)" />
        <path d={linePath} fill="none" stroke="rgb(16 185 129)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => {
          const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'
          return (
            <g key={p.date}>
              <circle cx={xAt(i)} cy={yAt(p.value)} r={i === peakIndex ? 4 : 3} fill="rgb(16 185 129)" />
              <text
                x={xAt(i)}
                y={yAt(p.value) - 10}
                textAnchor={anchor}
                fontSize={10}
                fontWeight={i === peakIndex ? 700 : 500}
                fill={i === peakIndex ? 'rgb(5 150 105)' : 'var(--color-heading)'}
              >
                ₹{p.value.toFixed(2)} Cr
              </text>
              <text x={xAt(i)} y={height - 8} textAnchor={anchor} fontSize={9} fill="var(--color-ink-muted)">
                {p.date}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-0.5 flex justify-between text-[9px] text-ink-muted">
        {points.map((p) => (
          <span key={p.date} className={clsx(p.forecast && p.value === points[peakIndex].value && 'font-medium text-emerald-600 dark:text-emerald-400')}>
            {p.day}
          </span>
        ))}
      </div>
    </div>
  )
}

function RevenueTrendChart({ weeks, yMax }: { weeks: RevenueWeek[]; yMax: number }) {
  const width = 620
  const height = 220
  const pad = { top: 16, right: 8, bottom: 8, left: 30 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const n = weeks.length
  const groupW = plotW / n
  const barW = groupW * 0.26
  const gap = groupW * 0.06

  const yAt = (value: number) => pad.top + plotH - (value / yMax) * plotH
  const yTicks = Array.from({ length: yMax + 1 }, (_, i) => i)

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={yAt(tick)} y2={yAt(tick)} stroke="var(--color-border)" strokeWidth={1} />
            <text x={pad.left - 8} y={yAt(tick) + 3} textAnchor="end" fontSize={10} fill="var(--color-ink-muted)">
              {tick === 0 ? '0' : `${tick} Cr`}
            </text>
          </g>
        ))}

        {weeks.map((week, i) => {
          const groupX = pad.left + i * groupW
          const bar1X = groupX + groupW * 0.16
          const bar2X = bar1X + barW + gap
          const baseY = yAt(0)
          const curY = yAt(week.current)
          const prevY = yAt(week.previous)
          return (
            <g key={week.label}>
              <rect x={bar1X} y={curY} width={barW} height={baseY - curY} rx={3} fill="var(--color-accent)" />
              <text x={bar1X + barW / 2} y={curY - 8} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-heading)">
                ₹{week.current.toFixed(2)} Cr
              </text>
              <rect x={bar2X} y={prevY} width={barW} height={baseY - prevY} rx={3} fill="var(--color-border)" />
              <text x={bar2X + barW / 2} y={prevY - 8} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-heading)">
                ₹{week.previous.toFixed(2)} Cr
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex">
        {weeks.map((week) => (
          <div key={week.label} className="flex-1 text-center text-xs">
            <p className="font-medium text-heading">{week.label}</p>
            <p className="text-[11px] text-ink-muted">{week.range}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const trendSeriesColor = {
  outstanding: 'var(--color-chart-series-1)',
  delay: 'var(--color-chart-series-2)',
}

function OutstandingDelayTrendChart({ points }: { points: OutstandingDelayPoint[] }) {
  const width = 1200
  const height = 220
  const pad = { top: 16, right: 16, bottom: 22, left: 12 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const n = points.length
  const colW = plotW / n

  const outstandingBase = points[0].outstandingCr
  const delayBase = points[0].delayDays
  const outstandingIndex = points.map((p) => (p.outstandingCr / outstandingBase) * 100)
  const delayIndex = points.map((p) => (p.delayDays / delayBase) * 100)
  const max = Math.max(...outstandingIndex, ...delayIndex) * 1.1

  const xAt = (index: number) => pad.left + (index / (n - 1)) * plotW
  const yAt = (value: number) => pad.top + plotH - (value / max) * plotH
  const pathFor = (values: number[]) => values.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(v)}`).join(' ')

  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-4 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: trendSeriesColor.outstanding }} />
          {outstandingDelayTrend.outstandingSeriesLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: trendSeriesColor.delay }} />
          {outstandingDelayTrend.delaySeriesLabel}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" onMouseLeave={() => setHoverIndex(null)}>
        <path d={pathFor(outstandingIndex)} fill="none" stroke={trendSeriesColor.outstanding} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathFor(delayIndex)} fill="none" stroke={trendSeriesColor.delay} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {hoverIndex !== null && (
          <line x1={xAt(hoverIndex)} x2={xAt(hoverIndex)} y1={pad.top} y2={pad.top + plotH} stroke="var(--color-chart-baseline)" strokeWidth={1} strokeDasharray="3 3" />
        )}

        {points.map((p, i) => (
          <g key={p.label}>
            <circle cx={xAt(i)} cy={yAt(outstandingIndex[i])} r={3} fill={trendSeriesColor.outstanding} />
            <circle cx={xAt(i)} cy={yAt(delayIndex[i])} r={3} fill={trendSeriesColor.delay} />
            <text x={xAt(i)} y={height - 6} textAnchor="middle" fontSize={9} fill="var(--color-ink-muted)">
              {p.label}
            </text>
            <rect
              x={xAt(i) - colW / 2}
              y={pad.top}
              width={colW}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
          </g>
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 min-w-[150px] -translate-x-1/2 rounded-lg border border-border bg-surface px-2.5 py-2 text-[11px] shadow-md"
          style={{ left: `${(xAt(hoverIndex!) / width) * 100}%`, top: 0 }}
        >
          <p className="mb-1 font-medium text-heading">{hovered.label}</p>
          <div className="space-y-0.5 text-ink-muted">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: trendSeriesColor.outstanding }} />
                Outstanding
              </span>
              <span className="font-medium text-heading">₹{hovered.outstandingCr.toFixed(1)} Cr</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: trendSeriesColor.delay }} />
                Delay
              </span>
              <span className="font-medium text-heading">{hovered.delayDays} days</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const maxCustomerTypeOutstanding = Math.max(...outstandingByCustomerType.map((row) => row.outstanding))

const maxAgeingAmount = Math.max(...outstandingAgeing.map((bucket) => bucket.amount))

const unmatchedAttention = attentionItems.find((item) => item.id === 'unmatched-payments')!
const partialAttention = attentionItems.find((item) => item.id === 'partial-payments')!

export function HomePage() {
  const navigate = useNavigate()

  const [dateFilter, setDateFilter] = useState<ReconciliationPeriodFilter>('week')
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)
  const [filterMenuPosition, setFilterMenuPosition] = useState<{ top: number; left: number } | null>(null)

  const filterButtonRef = useRef<HTMLButtonElement>(null)
  const filterMenuRef = useRef<HTMLDivElement>(null)

  const activeFilter = dateFilterOptions.find((option) => option.id === dateFilter)!
  const activeBreakdown = reconciliationBreakdownByFilter[dateFilter]
  const lastSyncedLabel = formatClockTime(new Date(Date.now() - 10 * 60 * 1000))

  useLayoutEffect(() => {
    if (!filterMenuOpen || !filterButtonRef.current) return
    const rect = filterButtonRef.current.getBoundingClientRect()
    setFilterMenuPosition({ top: rect.bottom + 6, left: rect.left })
  }, [filterMenuOpen])

  useEffect(() => {
    if (!filterMenuOpen) return
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (filterMenuRef.current?.contains(target) || filterButtonRef.current?.contains(target)) return
      setFilterMenuOpen(false)
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setFilterMenuOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [filterMenuOpen])

  return (
    <section className="@container space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-1.5 text-lg font-semibold text-heading">
            {getGreetingMessage()}, {USER_FIRST_NAME} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-0.5 text-xs text-ink-muted">Here&apos;s your payment reconciliation status as of today.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Last synced: Today, {lastSyncedLabel}
          </span>
          <Button type="button" variant="accent-outline" className="flex items-center gap-1.5 text-xs font-medium !p-1 !px-2">
            <RefreshCcw className="h-3 w-3" /> Sync Data
          </Button>
          <button
            ref={filterButtonRef}
            type="button"
            onClick={() => setFilterMenuOpen((open) => !open)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink hover:bg-surface-hover"
          >
            <CalendarDays className="h-3 w-3 text-ink-muted" /> {activeFilter.label}{' '}
            <ChevronDown className={clsx('h-3 w-3 text-ink-muted transition-transform', filterMenuOpen && 'rotate-180')} />
          </button>

          {filterMenuOpen &&
            filterMenuPosition &&
            createPortal(
              <div
                ref={filterMenuRef}
                style={{ top: filterMenuPosition.top, left: filterMenuPosition.left }}
                className="fixed z-50 w-40 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-2xl"
              >
                {dateFilterOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setDateFilter(option.id)
                      setFilterMenuOpen(false)
                    }}
                    className={clsx(
                      'flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition hover:bg-surface-hover',
                      option.id === dateFilter ? 'font-medium text-accent' : 'text-ink',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>,
              document.body,
            )}
        </div>
      </div>

      <div className="scrollbar-hide flex gap-4 overflow-x-auto bg-white p-3 rounded-lg">
        <div className="relative min-w-[220px] flex-1 shrink-0 overflow-hidden p-2 px-4 border border-border rounded-lg">
          <div className="flex gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="mt-2.5 text-sm font-medium text-ink-muted">Total Outstanding</p>
              <p className="mt-1 text-xl font-semibold text-heading">{currency(totalOutstanding)}</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-green-500">
                <TrendingDown className="h-3 w-3" /> {Math.abs(outstandingChangePct)}% vs last month
              </p>
            </div>
          </div>
          {/* <p className="text-[11px] text-ink-muted">{totalOpenInvoices} open invoices</p> */}
        </div>

        <div className="min-w-[220px] flex-1 shrink-0 p-2 border border-border rounded-lg">
          <div className="flex gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="mt-2.5 text-sm font-medium text-ink-muted">Reconciled Amount</p>
              <p className="mt-1 text-xl font-semibold text-heading">{currency(totalReceivedAmount)}</p>
              <p className="text-[10px] text-accent">{reconciliationRate}% AI-Reconciled</p>
            </div>
          </div>
        </div>

        <div className="flex min-w-[220px] flex-1 shrink-0 flex-col p-2 px-4 border border-border rounded-lg">
          <div className="flex gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="mt-2.5 text-sm font-medium text-ink-muted">Unmatched Payments</p>
              <p className="mt-1 text-xl font-semibold text-heading">{unmatchedAttention.count}</p>
              <p className="text-[11px] text-red-500">{currency(unmatchedAttention.amount)} requires review</p>
            </div>
          </div>
          {/* <Button
            variant="outline"
            size="xs"
            onClick={() => navigate('/exceptions')}
            className="mt-2.5 self-start border-border text-ink hover:bg-surface-hover"
          >
            Review <ArrowRight className="h-3 w-3" />
          </Button> */}
        </div>

        <div className="flex min-w-[220px] flex-1 shrink-0 flex-col p-2 px-4 border border-border rounded-lg">
          <div className="flex gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="mt-2.5 text-sm font-medium text-ink-muted">Invoice</p>
              <p className="mt-1 text-xl font-semibold">{partialAttention.count}</p>
              <p className="text-[11px] text-red-500">{currency(partialAttention.amount)} pending allocation</p>
            </div>
          </div>
          {/* <Button
            variant="outline"
            size="xs"
            onClick={() => navigate('/reconciliation-hub/overview')}
            className="mt-2.5 self-start border-accent/30 text-accent hover:bg-accent/10"
          >
            Allocate <ArrowRight className="h-3 w-3" />
          </Button> */}
        </div>
      </div >

      <div className="grid gap-4 @4xl:grid-cols-12">
        <Card className="flex min-w-0 flex-col p-4 @4xl:col-span-6">
          <CardHeader
            icon={Landmark}
            title={activeFilter.cardLabel}
            aiSuggestions={['Why did reconciliation dip in this period?', 'Compare with the previous period', 'Summarize this chart']}
          />

          <div className="mt-3 flex-1">
            <ReconciliationBreakdownChart points={activeBreakdown.points} rangeLabel={activeBreakdown.rangeLabel} />
          </div>

          <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-ink-muted">
            <Info className="h-3.5 w-3.5" />
            <span>Today&apos;s reconciliation generated at {todaysReconciliationGeneratedAt}</span>
          </div>
          {/* <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3 @sm:flex-row @sm:items-center @sm:justify-between">
            <Button size="sm" onClick={() => navigate('/reconciliation-hub/overview')} className="whitespace-nowrap">
              Open Reconciliation Workspace <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <button
              type="button"
              onClick={() => navigate('/reconciliation-hub/bank-statements')}
              className="flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-ink hover:text-accent"
            >
              <FileText className="h-3 w-3" /> View Bank Statement
            </button>
          </div> */}
        </Card>

        <Card className="flex min-w-0 flex-col p-4 @4xl:col-span-6">
          <div className="flex items-center justify-between gap-2">
            <CardHeader
              icon={AlertTriangle}
              title="Needs Your Attention"
              aiSuggestions={['Prioritize these for me', 'Which items are highest risk?', 'Draft follow-up actions']}
            />
            <div>
              <Button
                type="button"
                variant="accent-outline"
                onClick={() => navigate('/exceptions')}
                className="flex items-center gap-1.5 text-xs !py-1 !px-2  font-medium"
              >
                View All Exceptions <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <ul className="mt-1.5 divide-y divide-border">
            {attentionItems.map((item) => {
              const Icon = attentionIcons[item.id] ?? AlertTriangle
              const tone = toneClasses[item.tone]
              return (
                <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 py-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className={clsx('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted')}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-heading">{item.label}</p>
                      <p className="truncate text-[11px] text-ink-muted">{item.sublabel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-heading">{item.count}</p>
                    <p className="whitespace-nowrap text-[11px] text-ink-muted">{currency(item.amount)}</p>
                  </div>
                  <div className="pl-2">
                    <Button variant="outline" size="xs" className={clsx('w-full whitespace-nowrap bg-transparent hover:text-accent hover:bg-accent/10 hover:border-accent', tone.button)}>
                      {item.cta}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 @4xl:grid-cols-12">
        <Card className="flex min-w-0 flex-col p-4 @4xl:col-span-4">
          <div className="flex items-center justify-between gap-2">
          <CardHeader
            icon={BarChart3}
            title="Outstanding by Ageing"
            aiSuggestions={['Which ageing bucket grew the most?', 'Show customers in 90+ days', 'Summarize collection risk']}
          />
          <Button
            type="button"
            variant='accent-outline'
            onClick={() => navigate('/reports')}
            className="flex items-center gap-1 !py-1 text-xs !px-1"
          >
            View Ageing Report <ArrowRight className="h-3 w-3" />
          </Button>
          </div>
          <div className="mt-3 flex flex-1 items-center gap-3">
            <ul className="flex-1 space-y-2.5 text-xs">
              {outstandingAgeing.map((bucket) => (
                <li key={bucket.id} className="grid grid-cols-[1fr_auto] items-center gap-x-3">
                  <div className='w-full'>
                  <span className="truncate text-ink-muted">{bucket.label}</span>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className={clsx('h-full rounded-full', ageingBarClasses[bucket.tone])}
                      style={{ width: `${(bucket.amount / maxAgeingAmount) * 100}%` }}
                    />
                  </div>
                  </div>
                  <span className="text-right font-semibold text-heading">{currency(bucket.amount)}</span>
                </li>
              ))}
            </ul>

            <div className="flex shrink-0 flex-col items-center justify-center border-l border-border pl-3 text-center">
              <p className="text-xl font-semibold text-accent">{currency(totalOutstanding)}</p>
              <p className="whitespace-nowrap text-[11px] text-ink-muted">Total Outstanding</p>
            </div>
          </div>
        </Card>

        <Card className="flex min-w-0 flex-col p-4 @4xl:col-span-3">
          <CardHeader
            icon={Users2}
            title="Outstanding by Customer Type"
            aiSuggestions={['Which customer type is riskiest?', 'Compare to last month', 'Suggest collection priorities']}
          />

          <div className="mt-3 grid flex-1 auto-rows-min grid-cols-[1fr_auto_auto] items-center gap-x-3 gap-y-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wide text-ink-muted">Type</span>
            <span className="text-right text-[10px] font-medium uppercase tracking-wide text-ink-muted">Outstanding</span>
            <span className="text-right text-[10px] font-medium uppercase tracking-wide text-ink-muted">Invoices</span>

            {outstandingByCustomerType.map((row) => (
              <Fragment key={row.id}>
                <div className="min-w-0">
                  <p className="mb-1 truncate text-xs font-medium text-heading">{row.label}</p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(row.outstanding / maxCustomerTypeOutstanding) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="whitespace-nowrap text-right text-xs font-semibold text-heading">{currency(row.outstanding)}</span>
                <span className="whitespace-nowrap text-right text-xs font-medium text-accent">{row.openInvoices}</span>
              </Fragment>
            ))}

            <span className="whitespace-nowrap border-t border-border pt-2.5 text-xs font-semibold text-heading">Total</span>
            <span className="whitespace-nowrap border-t border-border pt-2.5 text-right text-xs font-semibold text-accent">
              {currency(totalOutstanding)}
            </span>
            <span className="whitespace-nowrap border-t border-border pt-2.5 text-right text-xs font-semibold text-heading">
              {totalOpenInvoices}
            </span>
          </div>
        </Card>

        <Card className="min-w-0 p-4 @4xl:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <CardHeader
              icon={Activity}
              title="Recent Reconciliation Activity"
              aiSuggestions={["Summarize today's activity", 'Flag unusual transactions', 'Show unmatched items']}
            />
            <Button
              type="button"
              variant="accent-outline"
              className="flex items-center gap-1.5 text-xs !py-1 !px-2  font-medium"
              onClick={() => navigate('/reconciliation-hub/overview')}
            >
              View All Activity <ArrowRight className="h-3 w-3" />
            </Button>
          </div>

          <div className="mt-3">
            <RecentActivityTable items={recentReconciliationActivity} />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 @2xl:grid-cols-2">
        <Card className="flex min-w-0 flex-col p-4">
          <CardHeader
            icon={TrendingUp}
            title="7-Day Cash Flow Forecast"
            aiSuggestions={['When will cash inflow peak?', 'Compare with previous 7 days', 'Summarize this forecast']}
          />
          <div className="mt-3">
            <CashFlowChart points={cashFlowForecast.points} />
          </div>
        </Card>

        <Card className="flex min-w-0 flex-col p-4">
          <CardHeader
            icon={LineChartIcon}
            title="Revenue"
            aiSuggestions={['Why did revenue decline this period?', 'Compare with the previous period', 'Summarize this chart']}
          />
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              {revenueTrend.currentLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full border-2 border-border" />
              {revenueTrend.previousLabel}
            </span>
          </div>
          <div className="mt-2">
            <RevenueTrendChart weeks={revenueTrend.weeks} yMax={revenueTrend.yMax} />
          </div>
        </Card>
      </div>

      <Card className="flex min-w-0 flex-col p-4">
        <CardHeader
          icon={AlertTriangle}
          title="Customer Risk Matrix"
          aiSuggestions={['Which customers are highest risk?', 'Show accounts in the critical zone', 'Suggest collection priorities']}
        />

        <div className="mt-3 grid grid-cols-1 gap-5 @4xl:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0">
            <p className="mb-1 text-sm font-medium text-heading">{customerRiskMatrix.chart.subtitle}</p>
            <RiskMatrixChart chart={customerRiskMatrix.chart} />
          </div>

          <div className="flex min-w-0 flex-col gap-4 @4xl:border-l @4xl:border-border @4xl:pl-5">
            <div>
              <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                Accounts in Critical Zone
                <Info className="h-3.5 w-3.5" />
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-heading">{customerRiskMatrix.criticalAccountsCount}</p>
              <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{customerRiskMatrix.totalAtRiskCr} at risk of non-payment</p>
            </div>

            <div className="rounded-lg border border-border p-3 text-xs">
              <p className="text-ink-muted">Top At-Risk Account</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-heading">{customerRiskMatrix.topAccount.name}</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">{customerRiskMatrix.topAccount.outstanding}</span>
              </div>
              <p className="mt-0.5 text-ink-muted">{customerRiskMatrix.topAccount.delayDays} days past due</p>
            </div>

            <div className="flex min-w-0 items-start gap-1.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-muted" />
              <p className="text-xs leading-relaxed text-ink-muted">
                {customerRiskMatrix.insight.lead}{' '}
                {customerRiskMatrix.insight.links.map((link, index) => (
                  <span key={link}>
                    <span className="font-medium text-accent">{link}</span>
                    {index < customerRiskMatrix.insight.links.length - 1 ? ' and ' : '.'}
                  </span>
                ))}{' '}
                {customerRiskMatrix.insight.detail}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* <Card className="flex min-w-0 flex-col p-4">
        <CardHeader
          icon={AlertTriangle}
          title="Outstanding Amount vs. Payment Delay Trend"
          aiSuggestions={['Why is payment delay growing faster?', 'Which weeks saw the biggest jump?', 'Summarize this trend']}
        />
        <p className="mt-1 text-xs text-ink-muted">{outstandingDelayTrend.subtitle}</p>
        <div className="mt-3">
          <OutstandingDelayTrendChart points={outstandingDelayTrend.points} />
        </div>
        <div className="mt-3 flex items-start gap-1.5 border-t border-border pt-3 text-xs text-ink-muted">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            {outstandingDelayTrend.insight.lead}{' '}
            <span className="font-semibold text-heading">{outstandingDelayTrend.insight.highlight}</span>, {outstandingDelayTrend.insight.tail}
          </span>
        </div>
      </Card> */}
    </section >
  )
}
