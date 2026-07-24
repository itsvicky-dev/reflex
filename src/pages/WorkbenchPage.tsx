import { clsx } from 'clsx'
import { Check, Download, Flag, Info, Plus, Search, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import {
  incomingPayments,
  statementsPulledAt,
  unmatchedCount,
  type AllocationInvoice,
  type IncomingPayment,
  type PayerPriority,
} from '../data/mockWorkbench'

type AllocationMode = 'ai' | 'manual'

const sgd = (value: number) =>
  `SGD ${value.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const signed = (value: number) => `+${value.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const priorityClasses: Record<PayerPriority, string> = {
  High: 'font-semibold text-heading',
  Medium: 'font-medium text-ink',
  Low: 'text-ink-muted',
}

function outstandingOf(invoice: AllocationInvoice) {
  return invoice.total - invoice.paidSoFar
}

function fifoSelection(payment: IncomingPayment): Set<string> {
  let remaining = payment.amount
  const ids = new Set<string>()
  for (const invoice of payment.customer.invoices) {
    if (remaining <= 0) break
    const outstanding = outstandingOf(invoice)
    if (outstanding <= 0) continue
    ids.add(invoice.id)
    remaining -= outstanding
  }
  return ids
}

function ModeToggle({ mode, onChange }: { mode: AllocationMode; onChange: (mode: AllocationMode) => void }) {
  return (
    <div className="inline-flex shrink-0 items-center gap-2 text-xs">
      <span className={clsx('font-medium', mode === 'ai' ? 'text-heading' : 'text-ink-muted')}>AI Allocated</span>
      <button
        type="button"
        role="switch"
        aria-checked={mode === 'manual'}
        aria-label="Toggle allocation mode"
        onClick={() => onChange(mode === 'ai' ? 'manual' : 'ai')}
        className={clsx('relative h-5 w-9 shrink-0 rounded-full transition', mode === 'manual' ? 'bg-accent' : 'bg-border')}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            mode === 'manual' ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </button>
      <span className={clsx('font-medium', mode === 'manual' ? 'text-heading' : 'text-ink-muted')}>Manual</span>
    </div>
  )
}

function PaymentRow({ payment, selected, onSelect }: { payment: IncomingPayment; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={clsx(
        'flex w-full items-start justify-between gap-3 border-l-2 px-4 py-3 text-left transition',
        selected ? 'border-accent bg-accent/5' : 'border-transparent hover:bg-surface-hover',
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-heading">
          {payment.payerName} <span className="text-ink-muted">→</span> {payment.customer.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-ink-muted">
          {payment.id} · {payment.bankRef || payment.method} · {payment.bank} · {payment.date}
        </p>
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-heading">{signed(payment.amount)}</span>
    </button>
  )
}

function AllocationCard({ payment, mode, onModeChange }: { payment: IncomingPayment; mode: AllocationMode; onModeChange: (mode: AllocationMode) => void }) {
  const [overrides, setOverrides] = useState<Record<string, Set<string>>>({})

  const checked = mode === 'manual' ? overrides[payment.id] ?? fifoSelection(payment) : fifoSelection(payment)

  function toggleInvoice(id: string) {
    if (mode === 'ai') return
    setOverrides((prev) => {
      const current = new Set(prev[payment.id] ?? fifoSelection(payment))
      if (current.has(id)) current.delete(id)
      else current.add(id)
      return { ...prev, [payment.id]: current }
    })
  }

  let remaining = payment.amount
  const allocationRows = payment.customer.invoices.map((invoice) => {
    const outstanding = outstandingOf(invoice)
    const isChecked = checked.has(invoice.id)
    const applied = isChecked ? Math.min(Math.max(remaining, 0), outstanding) : 0
    if (isChecked) remaining -= applied
    return { invoice, outstanding, applied, checked: isChecked }
  })

  const totalApplied = allocationRows.reduce((sum, row) => sum + row.applied, 0)
  const allocationPct = payment.amount > 0 ? Math.min(100, (totalApplied / payment.amount) * 100) : 0
  const isFullyAllocated = totalApplied > 0 && totalApplied >= payment.amount
  const allocationLabel = totalApplied === 0 ? 'Unallocated' : isFullyAllocated ? 'Fully allocated' : 'Partially allocated'

  return (
    <Card className="min-w-0 p-5">
      <div className="flex flex-col gap-3 @sm:flex-row @sm:items-start @sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Outstanding invoices for</p>
          <p className="mt-0.5 truncate text-base font-semibold text-heading">{payment.customer.name}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {payment.customer.type} · Credit limit {payment.customer.creditLimitLabel}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <ModeToggle mode={mode} onChange={onModeChange} />
          <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
            <Zap className="h-3.5 w-3.5" />
            FIFO suggested
          </span>
        </div>
      </div>

      <ul className="mt-4 divide-y divide-border">
        {allocationRows.map(({ invoice, outstanding, applied, checked: isChecked }) => (
          <li key={invoice.id} className="flex items-start gap-3 py-3">
            <input
              type="checkbox"
              checked={isChecked}
              disabled={mode === 'ai'}
              onChange={() => toggleInvoice(invoice.id)}
              className="mt-1 h-4 w-4 shrink-0 rounded border-border accent-[var(--color-accent)] disabled:opacity-60"
              aria-label={`Allocate to ${invoice.id}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-heading">{invoice.id}</span>
                <span className="text-xs text-ink-muted">· {invoice.ageDays}d old</span>
                {invoice.status === 'Partial' && (
                  <Badge tone="neutral">Partial · {sgd(invoice.paidSoFar)} paid</Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-ink-muted">Issued {invoice.issuedDate} · Total {sgd(invoice.total)}</p>
              {isChecked && applied > 0 && (
                <p className="mt-1 text-xs font-medium text-accent">
                  Applying {sgd(applied)} — {applied >= outstanding ? 'clears' : `${sgd(outstanding - applied)} remaining`}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold tabular-nums text-heading">{outstanding.toFixed(2)}</p>
              {invoice.status === 'Partial' && <p className="text-xs text-ink-muted line-through">{invoice.total.toFixed(2)}</p>}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Allocating from {payment.id}</p>
          <Badge tone={isFullyAllocated ? 'accent' : 'neutral'}>{allocationLabel}</Badge>
        </div>
        <p className="mt-1 text-base font-semibold text-heading">
          {totalApplied.toFixed(2)} <span className="text-xs font-normal text-ink-muted">of {payment.amount.toFixed(2)}</span>
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-hover">
          <div
            className={clsx('h-full rounded-full transition-all', totalApplied === 0 ? 'bg-border' : isFullyAllocated ? 'bg-accent' : 'bg-accent/50')}
            style={{ width: `${allocationPct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 @sm:flex-row @sm:justify-end">
        <Button variant="outline" size="sm">
          <Flag className="h-3.5 w-3.5" /> Flag as issue
        </Button>
        <Button size="sm">
          <Check className="h-3.5 w-3.5" /> Confirm &amp; post
        </Button>
      </div>
    </Card>
  )
}

function PayersCard({ payment }: { payment: IncomingPayment }) {
  const { customer } = payment
  return (
    <Card className="min-w-0 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Payers for</p>
          <p className="mt-0.5 truncate text-base font-semibold text-heading">{customer.name}</p>
        </div>
        <Badge tone="neutral">{customer.payers.length} Payers</Badge>
      </div>

      <ul className="mt-3 divide-y divide-border">
        {customer.payers.map((payer) => (
          <li key={payer.name} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-heading">{payer.name}</p>
              <p className="truncate text-xs text-ink-muted">{payer.role}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className={clsx('text-xs', priorityClasses[payer.priority])}>{payer.priority} priority</span>
              <button type="button" className="text-xs font-medium text-accent hover:underline">
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-accent hover:border-accent/50 hover:bg-accent/5"
      >
        <Plus className="h-3.5 w-3.5" /> Add payer for {customer.name}
      </button>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-surface-hover p-3 text-xs leading-relaxed text-ink-muted">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          <span className="font-semibold text-heading">How matching priority works: </span>
          When a payment lands, the engine looks for <span className="font-semibold text-heading">High</span> priority payer names first,
          then <span className="font-medium text-ink">Medium</span>, then <span className="text-ink-muted">Low</span>. Amount, date and bank
          reference are the tiebreakers.
        </p>
      </div>
    </Card>
  )
}

export function WorkbenchPage() {
  const [selectedId, setSelectedId] = useState(incomingPayments[0].id)
  const [mode, setMode] = useState<AllocationMode>('ai')
  const [query, setQuery] = useState('')

  const selectedPayment = incomingPayments.find((payment) => payment.id === selectedId) ?? incomingPayments[0]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return incomingPayments
    return incomingPayments.filter(
      (payment) =>
        payment.payerName.toLowerCase().includes(q) ||
        payment.customer.name.toLowerCase().includes(q) ||
        payment.bankRef.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <section className="@container space-y-4">
      <div className="flex flex-col gap-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading">Reconciliation Workbench</h1>
          <p className="mt-0.5 text-xs text-ink-muted">
            {incomingPayments.length} incoming payments waiting · pulled from DBS &amp; OCBC email statements at {statementsPulledAt}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="white" size="sm">
            <Download className="h-4 w-4" /> Import statement
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4" /> Auto-match all
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-[1.3fr_1fr]">
        <Card className="flex min-w-0 flex-col p-4">
          <div className="flex flex-col gap-3 border-b border-border pb-3 @lg:flex-row @lg:items-center @lg:justify-between">
            <p className="text-base font-semibold text-heading">Incoming payments</p>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search payer / ref..."
                  className="w-full rounded-lg border border-border bg-surface py-1.5 pl-8 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-accent/50 focus:outline-none @sm:w-56"
                />
              </div>
              <span className="whitespace-nowrap text-xs font-medium text-accent">{unmatchedCount} unmatched</span>
            </div>
          </div>

          <div className="divide-y divide-border">
            {filtered.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} selected={payment.id === selectedId} onSelect={() => setSelectedId(payment.id)} />
            ))}
            {filtered.length === 0 && <p className="py-10 text-center text-sm text-ink-muted">No payments match this search.</p>}
          </div>
        </Card>

        <div className="space-y-4">
          <AllocationCard payment={selectedPayment} mode={mode} onModeChange={setMode} />
          <PayersCard payment={selectedPayment} />
        </div>
      </div>
    </section>
  )
}
