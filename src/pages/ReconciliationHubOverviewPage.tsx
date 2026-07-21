import { clsx } from 'clsx'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileEdit,
  FileText,
  Landmark,
  List,
  MoreVertical,
  RefreshCw,
  Search,
  Table2,
  UserX,
  Wallet,
  XCircle,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import { useLayout } from '../context/LayoutContext'
import {
  attentionItems,
  bankFeedItems,
  reconciliationProgress,
  reconciliationStats,
  todaysReconciliationBreakdown,
  totalReceivedAmount,
  type BankFeedItem,
  type BankFeedStatus,
} from '../data/mockReconciliationHub'
import { bankFeedTone } from '../lib/status'

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)

const statIcons: Record<string, LucideIcon> = {
  'bank-transactions': Landmark,
  'auto-matched': CheckCircle2,
  'needs-review': Search,
  unmatched: XCircle,
}

const attentionIcons: Record<string, LucideIcon> = {
  'unmapped-payees': UserX,
}

const tabs = ['All Transactions', 'Auto Matched', 'Needs Review', 'Unmatched'] as const
type Tab = (typeof tabs)[number]

const tabCounts: Record<Tab, number> = {
  'All Transactions': 146,
  'Auto Matched': 121,
  'Needs Review': 18,
  Unmatched: 7,
}

const tabStatusFilter: Partial<Record<Tab, BankFeedItem['status'][]>> = {
  'Auto Matched': ['Auto Matched'],
  'Needs Review': ['Needs Review', 'Partial Match'],
  Unmatched: ['Unmatched'],
}

const FEED_PREVIEW_COUNT = 5

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function confidenceColor(value: number) {
  if (value >= 90) return 'bg-emerald-500'
  if (value >= 70) return 'bg-amber-500'
  return 'bg-rose-500'
}

const statusDot: Record<BankFeedStatus, string> = {
  'Auto Matched': 'bg-emerald-500',
  'Partial Match': 'bg-amber-500',
  'Needs Review': 'bg-amber-500',
  Unmatched: 'bg-rose-500',
}

function ProgressRing({ value }: { value: number }) {
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value / 100)

  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg viewBox="0 0 112 112" className="h-28 w-28 -rotate-90">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="currentColor" strokeWidth="9" className="text-surface-hover" />
        <circle
          cx="56"
          cy="56"
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
        <span className="text-[10px] leading-tight text-ink-muted">Reconciliation</span>
        <span className="text-[10px] leading-tight text-ink-muted">Progress</span>
      </div>
    </div>
  )
}

function FeedRow({ item }: { item: BankFeedItem }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold text-ink">
          {initials(item.payee)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-heading">{item.payee}</p>
          <p className="truncate text-xs text-ink-muted">{item.customer ? `Matched to ${item.customer}` : item.bankReference}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4">
        <span className="whitespace-nowrap text-sm font-semibold text-heading">{currency(item.amount)}</span>
        <Badge tone={bankFeedTone[item.status]} className="whitespace-nowrap">
          {item.status}
        </Badge>
      </div>
    </div>
  )
}

export function ReconciliationHubOverviewPage() {
  const { setAiPanelOpen, setSidebarCollapsed } = useLayout()
  const [tab, setTab] = useState<Tab>('All Transactions')
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => {
    const allow = tabStatusFilter[tab]
    return allow ? bankFeedItems.filter((item) => allow.includes(item.status)) : bankFeedItems
  }, [tab])

  const preview = filtered.slice(0, FEED_PREVIEW_COUNT)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return filtered
    return filtered.filter((item) => item.payee.toLowerCase().includes(q) || item.customer?.toLowerCase().includes(q))
  }, [filtered, query])

  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id))

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected((prev) => {
      if (rows.length > 0 && rows.every((row) => prev.has(row.id))) return new Set()
      return new Set(rows.map((row) => row.id))
    })
  }

  function scrollTableBy(delta: number) {
    scrollRef.current?.scrollBy({ left: delta, behavior: 'smooth' })
  }

  function handleViewFullTable() {
    setExpanded(true)
    setSidebarCollapsed(true)
    setAiPanelOpen(true)
  }

  function handleShowMinimal() {
    setExpanded(false)
    setSidebarCollapsed(false)
    setAiPanelOpen(false)
  }

  return (
    <section className="@container space-y-4">
      <div className="flex flex-col gap-3 @lg:flex-row @lg:items-center @lg:justify-between">
        <h1 className="text-2xl font-bold text-heading">Reconciliation</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Download className="h-4 w-4" /> Upload Bank Statement
          </Button>
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <FileEdit className="h-4 w-4" /> Manual Entry
          </Button>
          <Button size="sm" className="whitespace-nowrap">
            <RefreshCw className="h-4 w-4" /> Auto Reconcile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 @md:grid-cols-3 @4xl:grid-cols-5">
        {reconciliationStats.map((stat) => {
          const Icon = statIcons[stat.id]
          return (
            <Card key={stat.id} className="min-w-0 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted">
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div>
                  <span className="truncate text-sm font-medium text-ink">{stat.label}</span>
                  <p className="mt-3 text-2xl font-semibold text-heading">{stat.value}</p>
                  <p className="text-xs text-ink-muted">{stat.sublabel}</p>
                </div>
              </div>
              <button type="button" className="mt-2 flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                {stat.cta} <ArrowRight className="h-3 w-3" />
              </button>
            </Card>
          )
        })}

        <Card className="min-w-0 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted">
              <Wallet className="h-[18px] w-[18px]" />
            </div>
            <span className="truncate text-sm font-medium text-ink">Total Amount</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-heading">{currency(totalReceivedAmount)}</p>
          <p className="text-xs text-ink-muted">Total Received</p>
          <button type="button" className="mt-2 flex items-center gap-1 text-xs font-medium text-accent hover:underline">
            View Summary <ArrowRight className="h-3 w-3" />
          </button>
        </Card>
      </div>

      <div className="grid gap-4 @4xl:grid-cols-2">
        <Card className="min-w-0 p-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted">
              <Landmark className="h-4 w-4" />
            </div>
            <h3 className="text-base font-semibold text-heading">Today&apos;s Reconciliation</h3>
          </div>

          <div className="mt-4 flex items-center gap-6">
            <ul className="min-w-0 flex-1 space-y-3 text-sm">
              {todaysReconciliationBreakdown.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-ink">{item.label}</span>
                  <span className="shrink-0 font-semibold text-heading">{item.value}</span>
                </li>
              ))}
            </ul>
            <ProgressRing value={reconciliationProgress} />
          </div>

          <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4 @sm:flex-row @sm:items-center">
            <Button className="@sm:flex-1">
              Open Reconciliation Workspace <ArrowRight className="h-4 w-4" />
            </Button>
            <button type="button" className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-ink hover:text-accent">
              <FileText className="h-4 w-4" /> View Bank Statement
            </button>
          </div>
        </Card>

        <Card className="min-w-0 p-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-heading">Needs Your Attention</h3>
            </div>
            <button type="button" className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-accent hover:underline">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <ul className="mt-2 divide-y divide-border">
            {attentionItems.map((item) => {
              const Icon = attentionIcons[item.id] ?? AlertTriangle
              return (
                <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-heading">{item.label}</p>
                      <p className="truncate text-xs text-ink-muted">{item.sublabel}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-heading">{item.count}</p>
                      <p className="whitespace-nowrap text-xs text-ink-muted">{currency(item.amount)}</p>
                    </div>
                    <Button variant="outline" size="sm" className="whitespace-nowrap">
                      {item.cta}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <Card className="min-w-0 p-5">
        <div className="flex flex-col gap-3 border-b border-border pb-4 @lg:flex-row @lg:items-center @lg:justify-between">
          <div className="flex flex-wrap gap-1 rounded-xl bg-surface-hover p-1">
            {tabs.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={clsx(
                  'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  tab === item ? 'bg-accent text-accent-content' : 'text-ink-muted hover:text-ink',
                )}
              >
                {item} <span className="opacity-70">({tabCounts[item]})</span>
              </button>
            ))}
          </div>

          {expanded && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search payee or customer"
                  className="w-48 rounded-lg border border-border bg-surface py-1.5 pl-8 pr-2 text-xs text-ink placeholder:text-ink-muted focus:border-accent/50 focus:outline-none @sm:w-56"
                />
              </div>
              <button
                type="button"
                onClick={handleShowMinimal}
                className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-ink hover:text-accent"
              >
                <List className="h-4 w-4" /> Show minimal view
              </button>
            </div>
          )}
        </div>

        {!expanded ? (
          <>
            <div className="divide-y divide-border">
              {preview.map((item) => (
                <FeedRow key={item.id} item={item} />
              ))}
              {preview.length === 0 && <p className="py-8 text-center text-sm text-ink-muted">No transactions in this view.</p>}
            </div>

            <button
              type="button"
              onClick={handleViewFullTable}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-ink transition hover:bg-surface-hover"
            >
              <Table2 className="h-4 w-4" /> View Full Table
            </button>
          </>
        ) : (
          <div className="mt-3 flex overflow-hidden rounded-xl border border-border">
            <table className="shrink-0 border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-hover text-xs uppercase tracking-wider text-ink-muted">
                  <th className="w-10 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all rows"
                      className="h-3.5 w-3.5"
                      style={{ accentColor: 'var(--color-accent)' }}
                    />
                  </th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium">Payee / Narration</th>
                  <th className="whitespace-nowrap px-3 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="h-16 border-b border-border/60 last:border-0">
                    <td className="px-3 align-middle">
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleRow(item.id)}
                        aria-label={`Select ${item.payee}`}
                        className="h-3.5 w-3.5"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                    </td>
                    <td className="px-3 align-middle">
                      <div className="flex items-center gap-2">
                        <span className={clsx('h-2 w-2 shrink-0 rounded-full', statusDot[item.status])} />
                        <div className="min-w-0">
                          <p className="whitespace-nowrap font-medium text-heading">{item.payee}</p>
                          <p className="whitespace-nowrap text-xs text-ink-muted">{item.bankReference}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 align-middle font-medium text-heading">{currency(item.amount)}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-ink-muted">
                      No matches.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="w-px shrink-0 bg-border" />

            <div className="min-w-0 flex-1">
              <div ref={scrollRef} className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-hover text-xs uppercase tracking-wider text-ink-muted">
                      <th className="whitespace-nowrap px-3 py-3 font-medium">Transaction Date</th>
                      <th className="whitespace-nowrap px-3 py-3 font-medium">Customer (Mapped)</th>
                      <th className="whitespace-nowrap px-3 py-3 font-medium">Status</th>
                      <th className="whitespace-nowrap px-3 py-3 font-medium">Matching Confidence</th>
                      <th className="whitespace-nowrap px-3 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item) => (
                      <tr key={item.id} className="h-16 border-b border-border/60 last:border-0">
                        <td className="whitespace-nowrap px-3 align-middle">
                          <p className="font-medium text-heading">{item.date}</p>
                          <p className="text-xs text-ink-muted">{item.time}</p>
                        </td>
                        <td className="px-3 align-middle">
                          {item.customer ? (
                            <>
                              <p className="whitespace-nowrap font-medium text-heading">{item.customer}</p>
                              <p className="whitespace-nowrap text-xs text-ink-muted">{item.invoiceReference}</p>
                            </>
                          ) : (
                            <span className="text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 align-middle">
                          <Badge tone={bankFeedTone[item.status]}>{item.status}</Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 align-middle">
                          {item.confidence ? (
                            <div
                              className={clsx(
                                'flex h-8 w-16 items-center justify-center rounded-lg text-xs font-semibold text-white',
                                confidenceColor(item.confidence),
                              )}
                            >
                              {item.confidence}%
                            </div>
                          ) : (
                            <span className="text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 align-middle">
                          <div className="flex items-center justify-end gap-1">
                            <IconButton aria-label="View transaction" className="h-8 w-8">
                              <Eye className="h-3.5 w-3.5" />
                            </IconButton>
                            <IconButton aria-label="More actions" className="h-8 w-8">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-ink-muted">
                          No transactions match this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Card>
    </section>
  )
}
