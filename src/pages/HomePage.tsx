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
  Landmark,
  RefreshCcw,
  TrendingDown,
  Users2,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
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
  reconciliationProgress,
  todaysReconciliationBreakdown,
  todaysReconciliationGeneratedAt,
  totalReceivedAmount,
  type AttentionItem,
} from '../data/mockReconciliationHub'
import { recentActivityTone } from '../lib/status'

const USER_FIRST_NAME = 'Praburaju'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)

const breakdownDotClasses: Record<string, string> = {
  neutral: 'bg-ink-muted',
  success: 'bg-emerald-500',
  accent: 'bg-accent',
  warning: 'bg-amber-500',
}

const attentionIcons: Record<string, LucideIcon> = {
  'unmatched-payments': AlertTriangle,
  'partial-payments': AlertTriangle,
  'attention-cases': AlertCircle,
  'outstanding-90': AlertCircle,
  'unmapped-payees': Users2,
}

const toneClasses: Record<AttentionItem['tone'], { chip: string; button: string }> = {
  danger: {
    chip: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    button: 'border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10',
  },
  warning: {
    chip: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    button: 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10',
  },
  accent: {
    chip: 'bg-accent/10 text-accent',
    button: 'border-accent/30 text-accent hover:bg-accent/10',
  },
}

const ageingBarClasses: Record<string, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  orange: 'bg-orange-500',
  danger: 'bg-rose-500',
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

function ProgressRing({ value }: { value: number }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value / 100)

  return (
    <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
      <svg viewBox="0 0 128 128" className="h-32 w-32 -rotate-90">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" strokeWidth="9" className="text-surface-hover" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-accent transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-xl font-semibold text-heading">{value}%</span>
        <span className="text-[9px] leading-tight text-ink-muted">Reconciliation</span>
        <span className="text-[9px] leading-tight text-ink-muted">Progress</span>
      </div>
    </div>
  )
}

function CardHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <h3 className="text-sm font-semibold text-heading">{title}</h3>
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

const maxCustomerTypeOutstanding = Math.max(...outstandingByCustomerType.map((row) => row.outstanding))

const maxAgeingAmount = Math.max(...outstandingAgeing.map((bucket) => bucket.amount))

const unmatchedAttention = attentionItems.find((item) => item.id === 'unmatched-payments')!
const partialAttention = attentionItems.find((item) => item.id === 'partial-payments')!

export function HomePage() {
  const navigate = useNavigate()

  return (
    <section className="@container space-y-4">
      <div className="flex flex-col gap-3 @lg:flex-row @lg:items-start @lg:justify-between">
        <div>
          <h1 className="flex items-center gap-1.5 text-lg font-semibold text-heading">
            {getGreeting()}, {USER_FIRST_NAME} <span aria-hidden>👋</span>
          </h1>
          <p className="mt-0.5 text-xs text-ink-muted">Here&apos;s your payment reconciliation status as of today.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Last synced: Today, {todaysReconciliationGeneratedAt}
          </span>
          <button type="button" className="flex items-center gap-1.5 text-xs font-medium text-accent hover:underline">
            <RefreshCcw className="h-3 w-3" /> Sync Data
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-ink hover:bg-surface-hover"
          >
            <CalendarDays className="h-3 w-3 text-ink-muted" /> July 2026 <ChevronDown className="h-3 w-3 text-ink-muted" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 @sm:grid-cols-2 @4xl:grid-cols-4">
        <Card className="relative overflow-hidden p-4">
          <div className="flex gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="mt-2.5 text-xs font-medium text-ink-muted">Total Outstanding</p>
              <p className="mt-1 text-xl font-semibold text-rose-600 dark:text-rose-400">{currency(totalOutstanding)}</p>
            </div>
          </div>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
            <TrendingDown className="h-3 w-3" /> {Math.abs(outstandingChangePct)}% vs last month
          </p>
          <p className="text-[11px] text-ink-muted">{totalOpenInvoices} open invoices</p>
          <MiniSparkline data={outstandingTrend} className="absolute bottom-3 right-3 h-7 w-16 text-rose-400/60" />
        </Card>

        <Card className="p-4">
          <div className="flex gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="mt-2.5 text-xs font-medium text-ink-muted">Reconciled Amount</p>
              <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-400">{currency(totalReceivedAmount)}</p>
            </div>
          </div>
          <p className="text-[11px] text-ink-muted">{reconciliationRate}% reconciliation rate</p>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${reconciliationRate}%` }} />
            </div>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{reconciliationRate}%</span>
          </div>
        </Card>

        <Card className="flex flex-col p-4">
          <div className="flex gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="mt-2.5 text-xs font-medium text-ink-muted">Unmatched Payments</p>
              <p className="mt-1 text-xl font-semibold text-amber-600 dark:text-amber-400">{unmatchedAttention.count}</p>
            </div>
          </div>
          <p className="text-[11px] text-ink-muted">{currency(unmatchedAttention.amount)} requires review</p>
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate('/exceptions')}
            className="mt-2.5 self-start border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/30 dark:text-amber-400 dark:hover:bg-amber-500/10"
          >
            Review <ArrowRight className="h-3 w-3" />
          </Button>
        </Card>

        <Card className="flex flex-col p-4">
          <div className="flex gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="mt-2.5 text-xs font-medium text-ink-muted">Invoice</p>
              <p className="mt-1 text-xl font-semibold text-accent">{partialAttention.count}</p>
            </div>
          </div>
          <p className="text-[11px] text-ink-muted">{currency(partialAttention.amount)} pending allocation</p>
          <Button
            variant="outline"
            size="xs"
            onClick={() => navigate('/reconciliation-hub/overview')}
            className="mt-2.5 self-start border-accent/30 text-accent hover:bg-accent/10"
          >
            Allocate <ArrowRight className="h-3 w-3" />
          </Button>
        </Card>
      </div >

      <div className="grid gap-4 @4xl:grid-cols-12">
        <Card className="flex min-w-0 flex-col p-4 @4xl:col-span-5">
          <CardHeader icon={Landmark} title="Today's Reconciliation" />

          <div className="mt-3 flex items-center gap-4">
            <ul className="min-w-0 flex-1 space-y-2.5 text-xs">
              {todaysReconciliationBreakdown.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 truncate text-ink">
                    <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', breakdownDotClasses[item.tone])} />
                    {item.label}
                  </span>
                  <span className="shrink-0 font-semibold text-heading">{item.value}</span>
                </li>
              ))}
            </ul>
            <ProgressRing value={reconciliationProgress} />
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3 @sm:flex-row @sm:items-center @sm:justify-between">
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
          </div>
        </Card>

        <Card className="flex min-w-0 flex-col p-4 @4xl:col-span-7">
          <div className="flex items-center justify-between gap-2">
            <CardHeader icon={AlertTriangle} title="Needs Your Attention" />
            <button
              type="button"
              onClick={() => navigate('/exceptions')}
              className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-accent hover:underline"
            >
              View All Exceptions <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <ul className="mt-1.5 divide-y divide-border">
            {attentionItems.map((item) => {
              const Icon = attentionIcons[item.id] ?? AlertTriangle
              const tone = toneClasses[item.tone]
              return (
                <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 py-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className={clsx('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', tone.chip)}>
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
                    <Button variant="outline" size="xs" className={clsx('w-full whitespace-nowrap bg-transparent', tone.button)}>
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
          <CardHeader icon={BarChart3} title="Outstanding by Ageing" />
          <button
            type="button"
            onClick={() => navigate('/reports')}
            className="mt-1 flex items-center gap-1 self-start text-[11px] font-medium text-accent hover:underline"
          >
            View Ageing Report <ArrowRight className="h-3 w-3" />
          </button>
          <div className="mt-3 flex flex-1 items-center gap-3">
            <ul className="flex-1 space-y-2.5 text-xs">
              {outstandingAgeing.map((bucket) => (
                <li key={bucket.id} className="grid grid-cols-[64px_1fr_auto] items-center gap-x-3">
                  <span className="truncate text-ink-muted">{bucket.label}</span>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                    <div
                      className={clsx('h-full rounded-full', ageingBarClasses[bucket.tone])}
                      style={{ width: `${(bucket.amount / maxAgeingAmount) * 100}%` }}
                    />
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
          <CardHeader icon={Users2} title="Outstanding by Customer Type" />

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
            <CardHeader icon={Activity} title="Recent Reconciliation Activity" />
            <button
              type="button"
              onClick={() => navigate('/reconciliation-hub/overview')}
              className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-accent hover:underline"
            >
              View All Activity <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-3">
            <RecentActivityTable items={recentReconciliationActivity} />
          </div>
        </Card>
      </div>
    </section >
  )
}
