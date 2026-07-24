import { clsx } from 'clsx'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Card } from '../components/ui/Card'
import {
  customerDirectory,
  customerHealthTier,
  type CustomerAccountType,
  type CustomerHealthTier,
  type CustomerProfile,
} from '../data/mockCustomerDirectory'

const sgd = (value: number) => `SGD ${value.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const tierLabel: Record<CustomerHealthTier, string> = {
  healthy: 'Healthy',
  watch: 'Watch',
  critical: 'Critical',
}

const tierCornerColor: Record<CustomerHealthTier, string> = {
  healthy: 'var(--color-chart-good)',
  watch: 'var(--color-chart-warning)',
  critical: 'var(--color-chart-critical)',
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function StatusCorner({ tier }: { tier: CustomerHealthTier }) {
  const color = tierCornerColor[tier]
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-xl"
      style={{
        background: `linear-gradient(128deg, transparent 42%, color-mix(in oklab, ${color} 10%, transparent) 100%)`,
      }}
    />
  )
}

const tierDotColor: Record<CustomerHealthTier, string> = {
  healthy: 'bg-[color:var(--color-chart-good)]',
  watch: 'bg-[color:var(--color-chart-warning)]',
  critical: 'bg-[color:var(--color-chart-critical)]',
}

const tierTextColor: Record<CustomerHealthTier, string> = {
  healthy: 'text-[color:var(--color-chart-good)]',
  watch: 'text-[color:var(--color-chart-warning)]',
  critical: 'text-[color:var(--color-chart-critical)]',
}

function CustomerCard({ customer }: { customer: CustomerProfile }) {
  const tier = customerHealthTier(customer.healthScore)

  return (
    <Card className="relative min-w-0 overflow-hidden p-4 transition-shadow hover:shadow-md">
      <StatusCorner tier={tier} />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-surface-hover text-xs font-semibold text-heading">
            {initials(customer.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-heading">{customer.name}</p>
            <p className="truncate text-xs text-ink-muted">
              {customer.code} · {customer.city}
            </p>
          </div>
        </div>
        <span className={clsx('inline-flex shrink-0 items-center gap-1.5 text-xs font-medium', tierTextColor[tier])}>
          <span className={clsx('h-1.5 w-1.5 rounded-full', tierDotColor[tier])} />
          {tierLabel[tier]}
        </span>
      </div>

      <div className="relative mt-4">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>Profile score</span>
          <span className="font-semibold tabular-nums text-heading">{customer.healthScore}%</span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-hover">
          <div className={clsx('h-full rounded-full', tierDotColor[tier])} style={{ width: `${customer.healthScore}%` }} />
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
        <div>
          <p className="text-[11px] text-ink-muted">Overdue</p>
          <p className={clsx('mt-0.5 text-sm font-semibold tabular-nums', customer.overdueAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-heading')}>
            {customer.overdueAmount > 0 ? sgd(customer.overdueAmount) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-ink-muted">Upcoming</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-heading">{customer.upcomingAmount > 0 ? sgd(customer.upcomingAmount) : '—'}</p>
          {customer.upcomingAmount > 0 && <p className="mt-0.5 text-[11px] text-ink-muted">Due {customer.upcomingDueDate}</p>}
        </div>
      </div>
    </Card>
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

type TypeFilter = 'All' | CustomerAccountType
type TierFilter = 'All' | CustomerHealthTier

export function CustomersPage() {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All')
  const [tierFilter, setTierFilter] = useState<TierFilter>('All')

  const counts = useMemo(() => {
    const result: Record<CustomerHealthTier, number> = { healthy: 0, watch: 0, critical: 0 }
    for (const customer of customerDirectory) result[customerHealthTier(customer.healthScore)] += 1
    return result
  }, [])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return customerDirectory.filter((customer) => {
      if (typeFilter !== 'All' && customer.type !== typeFilter) return false
      if (tierFilter !== 'All' && customerHealthTier(customer.healthScore) !== tierFilter) return false
      if (q && !customer.name.toLowerCase().includes(q) && !customer.code.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, typeFilter, tierFilter])

  return (
    <section className="@container space-y-4">
      <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading">Customers</h1>
          <p className="mt-0.5 text-xs text-ink-muted">
            {customerDirectory.length} customers · {counts.healthy} healthy · {counts.watch} watch · {counts.critical} critical
          </p>
        </div>
      </div>

      <Card className="min-w-0 p-4">
        <div className="flex flex-col gap-3 border-b border-border pb-4 @lg:flex-row @lg:items-center @lg:justify-between">
          <div className="flex flex-col gap-3 @lg:flex-row @lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customer or code..."
                className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-accent/50 focus:outline-none @sm:w-56"
              />
            </div>
            <Segmented
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { label: 'All', value: 'All' },
                { label: 'Restaurant', value: 'Restaurant' },
                { label: 'Retail', value: 'Retail' },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-xs text-ink-muted">Health:</span>
            <Segmented
              value={tierFilter}
              onChange={setTierFilter}
              options={[
                { label: 'All', value: 'All' },
                { label: 'Healthy', value: 'healthy' },
                { label: 'Watch', value: 'watch' },
                { label: 'Critical', value: 'critical' },
              ]}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 @lg:grid-cols-2 @4xl:grid-cols-3">
          {rows.map((customer) => (
            <CustomerCard key={customer.id} customer={customer} />
          ))}
          {rows.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-ink-muted">No customers match this filter.</p>
          )}
        </div>
      </Card>
    </section>
  )
}
