import { clsx } from 'clsx'
import { ChevronDown, Download, Mail, MessageCircle, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import { Table, type TableColumn } from '../components/ui/Table'
import {
  customers,
  outstandingAsOf,
  type CustomerInvoice,
  type CustomerInvoiceStatus,
  type CustomerOutstanding,
  type CustomerType,
} from '../data/mockCustomerPayments'

const sgd = (value: number) => `SGD ${value.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

type Bucket = '0-30' | '31-60' | '61-90' | '90+'
const buckets: Bucket[] = ['0-30', '31-60', '61-90', '90+']

function bucketOf(ageDays: number): Bucket {
  if (ageDays <= 30) return '0-30'
  if (ageDays <= 60) return '31-60'
  if (ageDays <= 90) return '61-90'
  return '90+'
}

function outstandingOf(invoice: CustomerInvoice) {
  return invoice.total - invoice.paid
}

function bucketTotals(customer: CustomerOutstanding) {
  const totals: Record<Bucket, number> = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
  for (const invoice of customer.invoices) {
    totals[bucketOf(invoice.ageDays)] += outstandingOf(invoice)
  }
  return totals
}

function totalOutstanding(customer: CustomerOutstanding) {
  return customer.invoices.reduce((sum, invoice) => sum + outstandingOf(invoice), 0)
}

function oldestAge(customer: CustomerOutstanding) {
  return Math.max(0, ...customer.invoices.map((invoice) => invoice.ageDays))
}

const bucketCardLabel: Record<Bucket, string> = {
  '0-30': '0–30 days · Current',
  '31-60': '31–60 days · Mild',
  '61-90': '61–90 days · Overdue',
  '90+': '90+ days · Critical',
}

const invoiceStatusClasses: Record<CustomerInvoiceStatus, string> = {
  Open: 'border border-border text-ink',
  Partial: 'bg-ink/10 font-medium text-heading',
  Overdue: 'bg-heading font-medium text-surface',
}

function ageBadge(days: number) {
  const bucket = bucketOf(days)
  return (
    <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs text-ink-muted">
      {days}d · {bucket}
    </span>
  )
}

function OpenInvoicesTable({ invoices }: { invoices: CustomerInvoice[] }) {
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
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td className="whitespace-nowrap px-3 py-2.5 font-medium text-accent">{invoice.id}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-ink">{invoice.date}</td>
              <td className="whitespace-nowrap px-3 py-2.5">{ageBadge(invoice.ageDays)}</td>
              <td className="whitespace-nowrap px-3 py-2.5">
                <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs', invoiceStatusClasses[invoice.status])}>
                  {invoice.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink">{invoice.total.toFixed(2)}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-ink">{invoice.paid.toFixed(2)}</td>
              <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-heading">
                {outstandingOf(invoice).toFixed(2)}
              </td>
              <td className="whitespace-nowrap px-3 py-2.5 text-ink-muted">{invoice.reason ?? '—'}</td>
              <td className="whitespace-nowrap px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <IconButton aria-label={`Chase ${invoice.id} via WhatsApp`} className="h-7 w-7">
                    <MessageCircle className="h-3.5 w-3.5" />
                  </IconButton>
                  <IconButton aria-label={`Chase ${invoice.id} via email`} className="h-7 w-7">
                    <Mail className="h-3.5 w-3.5" />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProfileBar({ totals, outstanding }: { totals: Record<Bucket, number>; outstanding: number }) {
  const current = totals['0-30']
  const overdue = outstanding - current
  const currentPct = outstanding > 0 ? (current / outstanding) * 100 : 0
  const overduePct = outstanding > 0 ? (overdue / outstanding) * 100 : 0
  return (
    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-hover">
      <div className="flex h-full w-full">
        {currentPct > 0 && <span className="bg-ink-muted/50" style={{ width: `${currentPct}%` }} />}
        {overduePct > 0 && <span className="bg-accent" style={{ width: `${overduePct}%` }} />}
      </div>
    </div>
  )
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={clsx(
            'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition',
            value === option.value ? 'bg-heading text-surface' : 'text-ink-muted hover:text-ink',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

type TypeFilter = 'All' | CustomerType
type BucketFilter = 'All' | Bucket
type SortBy = 'Outstanding' | 'Oldest' | 'A-Z'

export function CustomerPaymentsPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All')
  const [bucketFilter, setBucketFilter] = useState<BucketFilter>('All')
  const [sortBy, setSortBy] = useState<SortBy>('Outstanding')
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  const totalsByCustomer = useMemo(() => {
    const map = new Map<string, { totals: Record<Bucket, number>; outstanding: number }>()
    for (const customer of customers) {
      map.set(customer.id, { totals: bucketTotals(customer), outstanding: totalOutstanding(customer) })
    }
    return map
  }, [])

  const grandTotals = useMemo(() => {
    const totals: Record<Bucket, number> = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
    for (const { totals: customerTotals } of totalsByCustomer.values()) {
      for (const bucket of buckets) totals[bucket] += customerTotals[bucket]
    }
    return totals
  }, [totalsByCustomer])

  const grandOutstanding = buckets.reduce((sum, bucket) => sum + grandTotals[bucket], 0)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = customers.filter((customer) => {
      if (typeFilter !== 'All' && customer.type !== typeFilter) return false
      if (q && !customer.name.toLowerCase().includes(q) && !customer.code.toLowerCase().includes(q)) return false
      if (bucketFilter !== 'All') {
        const { totals } = totalsByCustomer.get(customer.id)!
        if (totals[bucketFilter] <= 0) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      if (sortBy === 'A-Z') return a.name.localeCompare(b.name)
      if (sortBy === 'Oldest') return oldestAge(b) - oldestAge(a)
      return totalsByCustomer.get(b.id)!.outstanding - totalsByCustomer.get(a.id)!.outstanding
    })

    return list
  }, [query, typeFilter, bucketFilter, sortBy, totalsByCustomer])

  function handleExpandAll() {
    if (expandedKeys.size === rows.length && rows.length > 0) {
      setExpandedKeys(new Set())
    } else {
      setExpandedKeys(new Set(rows.map((row) => row.id)))
    }
  }

  const columns: TableColumn<CustomerOutstanding>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (customer) => (
        <div className="min-w-0">
          <p className="whitespace-nowrap text-sm font-medium text-heading">{customer.name}</p>
          <p className="whitespace-nowrap text-xs text-ink-muted">
            {customer.code} · {customer.invoices.length} open invoice{customer.invoices.length === 1 ? '' : 's'}
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (customer) => <Badge tone={customer.type === 'Restaurant' ? 'accent' : 'neutral'}>{customer.type}</Badge>,
    },
    ...buckets.map((bucket) => ({
      key: bucket,
      header: bucket,
      align: 'right' as const,
      render: (customer: CustomerOutstanding) => {
        const value = totalsByCustomer.get(customer.id)!.totals[bucket]
        return value > 0 ? <span className="text-sm tabular-nums text-ink">{value.toFixed(2)}</span> : <span className="text-sm text-ink-muted">–</span>
      },
    })),
    {
      key: 'outstanding',
      header: 'Outstanding',
      align: 'right',
      render: (customer) => (
        <span className="text-sm font-semibold tabular-nums text-heading">{totalsByCustomer.get(customer.id)!.outstanding.toFixed(2)}</span>
      ),
    },
    {
      key: 'profile',
      header: 'Profile',
      render: (customer) => {
        const entry = totalsByCustomer.get(customer.id)!
        return <ProfileBar totals={entry.totals} outstanding={entry.outstanding} />
      },
    },
    {
      key: 'chase',
      header: 'Chase',
      render: (customer) => (
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="xs" className="!px-2">
            Chase
          </Button>
          <IconButton aria-label={`Chase ${customer.name} via WhatsApp`} className="h-8 w-8">
            <MessageCircle className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton aria-label={`Chase ${customer.name} via email`} className="h-8 w-8">
            <Mail className="h-3.5 w-3.5" />
          </IconButton>
        </div>
      ),
    },
  ]

  return (
    <section className="@container space-y-4">
      <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading">Customer Outstanding</h1>
          <p className="mt-0.5 text-xs text-ink-muted">
            {sgd(grandOutstanding)} outstanding across {customers.length} customers · as of {outstandingAsOf}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="white" size="sm" onClick={handleExpandAll}>
            <ChevronDown className="h-4 w-4" /> {expandedKeys.size === rows.length && rows.length > 0 ? 'Collapse all' : 'Expand all'}
          </Button>
          <Button variant="white" size="sm">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4" /> Send reminders
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
        {buckets.map((bucket) => (
          <Card key={bucket} className="min-w-0 overflow-hidden p-4">
            <p className="text-xs font-medium text-ink-muted">{bucketCardLabel[bucket]}</p>
            <p className="mt-1 text-xl font-semibold text-heading">{sgd(grandTotals[bucket])}</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
              <div
                className={clsx('h-full rounded-full', bucket === '0-30' ? 'bg-ink-muted/50' : 'bg-accent')}
                style={{ width: grandOutstanding > 0 ? `${(grandTotals[bucket] / grandOutstanding) * 100}%` : '0%' }}
              />
            </div>
          </Card>
        ))}
      </div>

      <Card className="min-w-0 p-4">
        <div className="flex flex-col gap-3 border-b border-border pb-4 @2xl:flex-row @2xl:items-center @2xl:justify-between">
          <div className="flex flex-col gap-3 @lg:flex-row @lg:items-center">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customer or code..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-muted focus:border-accent/50 focus:outline-none @lg:w-56"
            />
            <Segmented
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { label: 'All', value: 'All' },
                { label: 'Restaurant', value: 'Restaurant' },
                { label: 'Retail', value: 'Retail' },
              ]}
            />
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-xs text-ink-muted">Ageing bucket:</span>
              <Segmented
                value={bucketFilter}
                onChange={setBucketFilter}
                options={[
                  { label: 'All', value: 'All' },
                  { label: '0-30', value: '0-30' },
                  { label: '31-60', value: '31-60' },
                  { label: '61-90', value: '61-90' },
                  { label: '90+', value: '90+' },
                ]}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-xs text-ink-muted">Sort:</span>
            <Segmented
              value={sortBy}
              onChange={setSortBy}
              options={[
                { label: 'Outstanding', value: 'Outstanding' },
                { label: 'Oldest', value: 'Oldest' },
                { label: 'A–Z', value: 'A-Z' },
              ]}
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={rows}
          rowKey={(customer) => customer.id}
          emptyMessage="No customers match this filter."
          expandable
          expandColumnKey="customer"
          expandedKeys={expandedKeys}
          onExpandedKeysChange={setExpandedKeys}
          renderExpanded={(customer) => (
            <div>
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Open invoices</p>
              <OpenInvoicesTable invoices={customer.invoices} />
            </div>
          )}
        />
      </Card>
    </section>
  )
}
