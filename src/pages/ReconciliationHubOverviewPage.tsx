import { clsx } from 'clsx'
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  Clock,
  Download,
  Eye,
  FileEdit,
  FileText,
  Info,
  Landmark,
  Mail,
  MessageCircle,
  MoreVertical,
  RefreshCw,
  Search,
  Table2,
  UserX,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import { Table, type TableColumn } from '../components/ui/Table'
import { Tabs } from '../components/ui/Tabs'
import { useLayout } from '../context/LayoutContext'
import {
  attentionItems,
  bankFeedItems,
  reconciliationProgress,
  reconciliationStats,
  todaysReconciliationBreakdown,
  todaysReconciliationGeneratedAt,
  totalReceivedAmount,
  type BankFeedItem,
  type OpenInvoice,
  type OpenInvoiceStatus,
} from '../data/mockReconciliationHub'
import { bankFeedTone } from '../lib/status'

const currency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)

const invoiceStatusClasses: Record<OpenInvoiceStatus, string> = {
  Open: 'border border-border text-ink',
  Partial: 'border border-amber-200 bg-amber-100 font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
  Overdue: 'border border-rose-200 bg-rose-100 font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-300',
}

function ageBucket(days: number) {
  if (days <= 30) return { label: '0–30', className: 'border-border text-ink-muted' }
  if (days <= 60) return { label: '31–60', className: 'border-amber-200 text-amber-700 dark:border-amber-500/30 dark:text-amber-300' }
  if (days <= 90) return { label: '61–90', className: 'border-orange-200 text-orange-700 dark:border-orange-500/30 dark:text-orange-300' }
  return { label: '90+', className: 'border-rose-200 text-rose-700 dark:border-rose-500/30 dark:text-rose-300' }
}

function OpenInvoicesTable({ invoices }: { invoices: OpenInvoice[] }) {
  return (
    <div className="overflow-hidden">
      <table className="w-full min-w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-y border-border">
            {['Invoice', 'Date', 'Age', 'Status', 'Total', 'Paid', 'Outstanding', 'Reason', 'Chase'].map((label) => (
              <th
                key={label}
                className={clsx(
                  'whitespace-nowrap px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted',
                  ['Total', 'Paid', 'Outstanding'].includes(label) && 'text-right',
                )}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {invoices.map((invoice) => {
            const bucket = ageBucket(invoice.ageDays)
            const outstanding = invoice.total - invoice.paid
            return (
              <tr key={invoice.id}>
                <td className="whitespace-nowrap px-3 py-2.5 font-medium text-accent">{invoice.id}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink">{invoice.date}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className={clsx('inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium', bucket.className)}>
                    {invoice.ageDays}d · {bucket.label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs', invoiceStatusClasses[invoice.status])}>
                    {invoice.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink">{invoice.total.toFixed(2)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink">{invoice.paid.toFixed(2)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-heading">{outstanding.toFixed(2)}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-ink-muted">{invoice.reason ?? '—'}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <IconButton
                      aria-label={`Chase ${invoice.id} via WhatsApp`}
                      className="h-7 w-7 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </IconButton>
                    <IconButton
                      aria-label={`Chase ${invoice.id} via email`}
                      className="h-7 w-7 border-accent/30 text-accent hover:bg-accent/10"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const statTrend: Record<string, { color: string; glyph: string } | null> = {
  'bank-transactions': null,
  'auto-matched': { color: 'text-emerald-600 dark:text-emerald-400', glyph: '▲' },
  'needs-review': { color: 'text-rose-600 dark:text-rose-400', glyph: '▼' },
  unmatched: { color: 'text-rose-600 dark:text-rose-400', glyph: '▼' },
}

const statToTab: Record<string, Tab> = {
  'bank-transactions': 'All Transactions',
  'auto-matched': 'Auto Matched',
  'needs-review': 'Needs Review',
  unmatched: 'Unmatched',
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

function ProgressRing({ value }: { value: number }) {
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value / 100)

  return (
    <div className="relative flex h-52 w-52 shrink-0 items-center justify-center">
      <svg viewBox="0 0 144 144" className="h-52 w-52 -rotate-90">
        <circle cx="72" cy="72" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-surface-hover" />
        <circle
          cx="72"
          cy="72"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-accent transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-2xl font-semibold text-heading">{value}%</span>
        <span className="text-[10px] leading-tight text-ink-muted">Reconciliation</span>
        <span className="text-[10px] leading-tight text-ink-muted">Progress</span>
      </div>
    </div>
  )
}

function TransactionCell({ item }: { item: BankFeedItem }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-hover text-[10px] font-semibold text-ink">
        {initials(item.payee)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-heading">{item.customer}</p>
      </div>
    </div>
  )
}

export function ReconciliationHubOverviewPage() {
  const { setAiPanelOpen, setSidebarCollapsed } = useLayout()
  const [tab, setTab] = useState<Tab>('All Transactions')
  const [expanded, setExpanded] = useState(false)
  const [query, setQuery] = useState('')

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

  const previewColumns: TableColumn<BankFeedItem>[] = [
    { key: 'transaction', header: 'Transaction', render: (item) => <TransactionCell item={item} /> },
    {
      key: 'matched', header: 'Matched', render: (item) => <p className="truncate text-xs text-ink-muted">{item.customer ? `Matched to ${item.customer}` : item.bankReference}</p>
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (item) => <span className="font-medium text-heading">{currency(item.amount)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      render: (item) => <Badge tone={bankFeedTone[item.status]}>{item.status}</Badge>,
    },
  ]

  const fullColumns: TableColumn<BankFeedItem>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => (
        <>
          <p className="whitespace-nowrap font-medium text-heading">{item.date}</p>
          <p className="whitespace-nowrap text-xs text-ink-muted">{item.time}</p>
        </>
      ),
    },
    {
      key: 'payee',
      header: 'Payee / Narration',
      render: (item) => (
        <>
          <p className="whitespace-nowrap font-medium text-heading">{item.payee}</p>
          <p className="whitespace-nowrap text-xs text-ink-muted">{item.bankReference}</p>
        </>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) =>
        item.customer ? (
          <>
            <p className="whitespace-nowrap font-medium text-heading">{item.customer}</p>
            <p className="whitespace-nowrap text-xs text-ink-muted">{item.invoiceReference}</p>
          </>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <Badge>{item.status}</Badge>,
    },
    {
      key: 'confidence',
      header: 'Confidence',
      render: (item) => (item.confidence ? <span className="font-medium text-heading">{item.confidence}%</span> : <span className="text-ink-muted">—</span>),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (item) => <span className="font-medium text-heading">{currency(item.amount)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: () => (
        <div className="flex items-center justify-end gap-1">
          <IconButton aria-label="View transaction" className="h-8 w-8">
            <Eye className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton aria-label="More actions" className="h-8 w-8">
            <MoreVertical className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      ),
    },
  ]

  const tabBar = (
    <Tabs
      items={tabs.map((item) => ({ label: item, value: item, count: tabCounts[item] }))}
      value={tab}
      onChange={(value) => setTab(value as Tab)}
    />
  )

  const searchBox = (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search payee or customer"
        className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-accent/50 focus:outline-none @sm:w-64"
      />
    </div>
  )

  if (expanded) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <IconButton aria-label="Back to overview" onClick={handleShowMinimal}>
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <h1 className="text-xl font-semibold text-heading">All Transactions</h1>
        </div>

        <Card className="min-w-0 p-4">
          <div className="mb-4 flex justify-between gap-3 border-b border-border pb-4">
            {tabBar}
            {searchBox}
          </div>
          <Table
            columns={fullColumns}
            data={rows}
            rowKey={(item) => item.id}
            emptyMessage="No transactions match this filter."
            // selectable
            expandable
            expandColumnKey="date"
            // highlightColumnKey="amount"
            renderExpanded={(item) =>
              item.openInvoices?.length ? (
                <OpenInvoicesTable invoices={item.openInvoices} />
              ) : (
                <p className="px-1 py-2 text-sm text-ink-muted">No open invoices linked to this transaction.</p>
              )
            }
          />
        </Card>
      </section>
    )
  }

  return (
    <section className="@container space-y-4">
      <div className="flex flex-col gap-3 @lg:flex-row @lg:items-center @lg:justify-between">
        <h1 className="text-2xl font-medium text-heading">Reconciliation</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="white" size="sm" className="whitespace-nowrap">
            <Download className="h-4 w-4" /> Upload Bank Statement
          </Button>
          <Button variant="white" size="sm" className="whitespace-nowrap">
            <FileEdit className="h-4 w-4" /> Manual Entry
          </Button>
          <Button size="sm" className="whitespace-nowrap">
            <RefreshCw className="h-4 w-4" /> Auto Reconcile
          </Button>
        </div>
      </div>

      <div className="scrollbar-hide flex gap-3 bg-[#fff] dark:bg-[#111111] p-3 rounded-xl overflow-x-auto">
        {reconciliationStats.map((stat) => {
          const trend = statTrend[stat.id]
          const isSelected = tab === statToTab[stat.id]
          return (
            <div
              key={stat.id}
              tabIndex={0}
              onClick={() => setTab(statToTab[stat.id])}
              className={clsx(
                ' rounded-lg min-w-[200px] flex-1 basis-[200px] max-h-[70px] cursor-pointer border py-1.5 px-2 transition-colors border-border hover:border-accent/40',
              )}
            >
              <span className={clsx('truncate text-sm text-[#5a5e68]')}>{stat.label}</span>
              <div className="flex items-center gap-2">
                <p className={clsx('text-[24px] font-[400] text-black')}>{stat.value}</p>
                {trend ? (
                  <span className={clsx('flex items-center gap-0.5 text-xs font-semibold', trend.color)}>
                    <span aria-hidden className="text-[9px]">{trend.glyph}</span>
                    {stat.sublabel}
                  </span>
                ) : (
                  <span className="text-sm text-ink-muted">–</span>
                )}
              </div>
            </div>
          )
        })}

        <Card className="min-w-[200px] flex-1 basis-[200px] max-h-[70px] py-1.5 px-2 border border-border">
          <span className="truncate text-sm font-medium text-ink-muted">Total Amount</span>
          <div className="flex items-center gap-2">
            <p className="text-[24px] font-[400] text-black">{currency(totalReceivedAmount)}</p>
          </div>
        </Card>
      </div>

      {/* Analytics section */}
      <div className="grid gap-4 @4xl:grid-cols-2">
        <Card className="flex min-w-0 flex-col p-5">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted">
                <Landmark className="h-4 w-4" />
              </div>
              <h3 className="text-base font-semibold text-heading">Today&apos;s Reconciliation</h3>
            </div>
            <div>
            <button className="text-xs border border-transparent flex items-center gap-2 whitespace-nowrap rounded-lg p-1 text-accent bg-transparent hover:border-accent hover:bg-accent/10">
              Open Workspace
            </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-6">
            <ul className="min-w-0 flex-1 space-y-3 text-sm">
              {todaysReconciliationBreakdown.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 border-b border-border pb-2 last:border-0 last:pb-0">
                  <span className="truncate text-ink">{item.label}</span>
                  <span className="shrink-0 font-semibold text-heading">{item.value}</span>
                </li>
              ))}
            </ul>
            <ProgressRing value={reconciliationProgress} />
          </div>

          <div className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-ink-muted">
            <Info className="h-3.5 w-3.5" />
            <span>Today&apos;s reconciliation generated at {todaysReconciliationGeneratedAt}</span>
          </div>
        </Card>

        <Card className="flex min-w-0 flex-col p-5">
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
                <li key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-4 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-ink-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-heading">{item.label}</p>
                      <p className="truncate text-xs text-ink-muted">{item.sublabel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-heading">{item.count}</p>
                    <p className="whitespace-nowrap text-xs text-ink-muted">{currency(item.amount)}</p>
                  </div>
                  <div className="pl-3">
                    <Button variant="outline" size="sm" className="w-full whitespace-nowrap">
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
        <div className="flex flex-col gap-3 pb-4 @lg:flex-row @lg:items-center @lg:justify-between">
          {tabBar}
          <button onClick={handleViewFullTable} className=" text-xs border border-transparent flex items-center gap-2 whitespace-nowrap rounded-lg p-1 text-accent bg-transparent hover:border-accent hover:bg-accent/10">
            View Full Table
          </button>
        </div>

        <Table columns={previewColumns} data={preview} rowKey={(item) => item.id} emptyMessage="No transactions in this view." />
      </Card>
    </section>
  )
}
