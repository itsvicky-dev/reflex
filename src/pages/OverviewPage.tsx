import { clsx } from 'clsx'
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Expand,
  Percent,
  Search,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import { TrendBars } from '../components/ui/TrendBars'
import { exceptions, transactions, weeklyTrend } from '../data/mockReconciliation'
import { severityTone, transactionTone } from '../lib/status'
import { CalendarDays, Filter, RefreshCcw, Users2 } from 'lucide-react'

type Kpi = {
  label: string
  sublabel?: string
  value: string
  delta: string
  positive: boolean
  icon: LucideIcon
}

const kpis: Kpi[] = [
  { label: 'Matched Amount', sublabel: 'USD', value: '$2.41M', delta: '+4.2%', positive: true, icon: Wallet },
  { label: 'Auto-Match Rate', sublabel: 'Uniques', value: '96.8%', delta: '+1.1%', positive: true, icon: Percent },
  { label: 'Pending Items', sublabel: 'Uniques', value: '128', delta: '-3.4%', positive: true, icon: Wallet },
  { label: 'Open Exceptions', sublabel: 'Uniques', value: '18', delta: '+2 new', positive: false, icon: AlertTriangle },
  { label: 'Avg Resolution Time', sublabel: 'Days', value: '1.6d', delta: '-0.3d', positive: true, icon: Wallet },
  { label: 'Guides and next steps', sublabel: '', value: '', delta: '', positive: true, icon: Wallet },
]

const tabs = ['Source', 'Status', 'Owner'] as const

const bySource = Object.values(
  transactions.reduce<Record<string, { source: string; total: number; matched: number; unmatched: number }>>(
    (acc, txn) => {
      acc[txn.source] ??= { source: txn.source, total: 0, matched: 0, unmatched: 0 }
      acc[txn.source].total += 1
      if (txn.status === 'Matched') acc[txn.source].matched += 1
      if (txn.status === 'Unmatched') acc[txn.source].unmatched += 1
      return acc
    },
    {},
  ),
)

export function OverviewPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Source')
  const scrollerRef = useRef<HTMLDivElement>(null)

  function scrollCards() {
    scrollerRef.current?.scrollBy({ left: 260, behavior: 'smooth' })
  }

  return (
    <section className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <button type="button" className="flex items-center gap-1.5 font-medium text-accent hover:underline">
              <Filter className="h-3.5 w-3.5" /> Add Filter
            </button>
            <button type="button" className="flex items-center gap-1.5 font-medium text-accent hover:underline">
              <Users2 className="h-3.5 w-3.5" /> Add Segment
            </button>
            <span className="flex items-center gap-1.5 text-ink-muted">
              Data from 4 mins ago
              <RefreshCcw className="h-3.5 w-3.5 cursor-pointer hover:text-ink" />
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-hover">
              Daily
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-hover"
            >
              <CalendarDays className="h-3.5 w-3.5" /> Last 7 days
            </button>
          </div>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <div ref={scrollerRef} className="flex flex-1 gap-3 overflow-x-auto pb-2">
            {kpis.map((kpi, index) => (
              <div
                key={kpi.label}
                className={clsx(
                  'flex w-52 shrink-0 flex-col justify-between rounded-xl border p-3',
                  index === 0 ? 'border-accent/40 bg-accent/5' : 'border-border',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={clsx('truncate text-sm font-medium', index === 0 ? 'text-accent' : 'text-ink')}>
                    {kpi.label}
                    {kpi.sublabel && <span className="ml-1 font-normal text-ink-muted">({kpi.sublabel})</span>}
                  </p>
                  {kpi.value && <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-muted" />}
                </div>
                {kpi.value ? (
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-semibold text-heading">{kpi.value}</span>
                    <span className={clsx('text-xs font-medium', kpi.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                      {kpi.delta}
                    </span>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-ink-muted">Explore setup guides and best practices.</p>
                )}
              </div>
            ))}
          </div>
          <IconButton aria-label="Scroll metrics" onClick={scrollCards} className="shrink-0">
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-heading">Matching Trend</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink hover:bg-surface-hover"
            >
              Line chart
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <IconButton aria-label="Expand chart">
              <Expand className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" /> Matched
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500/70" /> Unmatched
          </span>
        </div>

        <div className="mt-4">
          <TrendBars data={weeklyTrend} />
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold text-heading">Breakdown by</p>
            <div className="flex gap-1 rounded-xl bg-surface-hover p-1">
              {tabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={clsx(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                    tab === item ? 'bg-accent text-accent-content' : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Search"
                className="w-40 rounded-lg border border-border bg-surface py-1.5 pl-8 pr-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent/50 focus:outline-none"
              />
            </div>
            <IconButton aria-label="Expand breakdown">
              <Expand className="h-4 w-4" />
            </IconButton>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          {tab === 'Source' ? (
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                  <th className="pb-3 font-medium">Source</th>
                  <th className="pb-3 font-medium">Items</th>
                  <th className="pb-3 font-medium">Matched</th>
                  <th className="pb-3 font-medium">Unmatched</th>
                </tr>
              </thead>
              <tbody>
                {bySource.map((row) => (
                  <tr key={row.source} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-medium text-heading">{row.source}</td>
                    <td className="py-3 text-ink">{row.total}</td>
                    <td className="py-3 text-ink-muted">{row.matched}</td>
                    <td className="py-3 text-ink-muted">{row.unmatched}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === 'Status' ? (
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                  <th className="pb-3 font-medium">Reference</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-medium text-heading">{txn.id}</td>
                    <td className="py-3 text-ink-muted">{txn.description}</td>
                    <td className="py-3 text-ink">{txn.amount}</td>
                    <td className="py-3">
                      <Badge tone={transactionTone[txn.status]}>{txn.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                  <th className="pb-3 font-medium">Reference</th>
                  <th className="pb-3 font-medium">Owner</th>
                  <th className="pb-3 font-medium">Note</th>
                  <th className="pb-3 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {exceptions.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-medium text-heading">{item.reference}</td>
                    <td className="py-3 text-ink-muted">{item.owner}</td>
                    <td className="py-3 text-ink-muted">{item.note}</td>
                    <td className="py-3">
                      <Badge tone={severityTone[item.severity]}>{item.severity}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button type="button" className="mt-4 text-sm font-medium text-accent hover:underline">
          + Add Metric
        </button>
      </Card>
    </section>
  )
}
