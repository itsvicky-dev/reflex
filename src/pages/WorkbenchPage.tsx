import { clsx } from 'clsx'
import { Check, Download, Flag, Info, Plus, Search, SlidersHorizontal, X, Zap } from 'lucide-react'
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

type Filters = {
  matchType: Set<string>
  aiConfidence: number | null
}

const MATCH_TYPE_OPTIONS = [
  'Matching Multiple Invoices',
  'Partial Payment Matches',
  'Advance Payments',
  'Short Payment',
  'Over Payment',
  'Duplicate Payment Detection',
  'Manual Review Suggested',
] as const

function emptyFilters(): Filters {
  return { matchType: new Set(), aiConfidence: null }
}

function filtersActive(f: Filters) {
  return f.matchType.size > 0 || f.aiConfidence !== null
}

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

function FilterDrawer({
  open,
  onClose,
  filters,
  onApply,
}: {
  open: boolean
  onClose: () => void
  filters: Filters
  onApply: (f: Filters) => void
}) {
  const [draft, setDraft] = useState<Filters>({
    matchType: new Set(filters.matchType),
    aiConfidence: filters.aiConfidence,
  })

  function toggleMatchType(value: string) {
    setDraft((prev) => {
      const next = new Set(prev.matchType)
      next.has(value) ? next.delete(value) : next.add(value)
      return { ...prev, matchType: next }
    })
  }

  if (!open) return null

  const activeCount = draft.matchType.size + (draft.aiConfidence !== null ? 1 : 0)

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-[340px] flex-col bg-white shadow-2xl dark:bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-white">Filter Payments</p>
            <p className="mt-0.5 text-xs text-zinc-400">
              {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} active` : 'No filters applied'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:text-black"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Match Type section */}
          <div className="px-6 py-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-950 dark:text-white">Match Type</p>
              {draft.matchType.size > 0 && (
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, matchType: new Set() }))}
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="space-y-1">
              {MATCH_TYPE_OPTIONS.map((opt) => {
                const checked = draft.matchType.has(opt)
                return (
                  <label
                    key={opt}
                    className={clsx(
                      'flex cursor-pointer items-center border text-zinc-800 gap-3 rounded-lg px-3 py-2.5 transition',
                      checked
                        ? 'border-zinc-950'
                        : 'border-transparent hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800/50',
                    )}
                  >
                    <span
                      className={clsx(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition border-zinc-300 bg-white dark:border-zinc-600 dark:bg-transparent',
                      )}
                    >
                      {checked && (
                        <svg className="h-2.5 w-2.5 text-zinc-950" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <input type="checkbox" checked={checked} onChange={() => toggleMatchType(opt)} className="sr-only" />
                    <span className="text-sm font-medium">{opt}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="mx-6 border-t border-zinc-100 dark:border-zinc-800" />

          {/* AI Confidence section */}
          <div className="px-6 py-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-950 dark:text-white">AI Confidence</p>
              {draft.aiConfidence !== null && (
                <button
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, aiConfidence: null }))}
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">Show only payments where AI confidence is at or above this threshold.</p>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-800/50 dark:focus-within:border-white">
              <span className="text-sm font-semibold text-zinc-950 dark:text-white">≥</span>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="80"
                value={draft.aiConfidence ?? ''}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    aiConfidence: e.target.value === '' ? null : Math.min(100, Math.max(0, Number(e.target.value))),
                  }))
                }
                className="w-full bg-transparent text-sm font-semibold text-zinc-950 placeholder:font-normal placeholder:text-zinc-400 focus:outline-none dark:text-white"
              />
              <span className="text-sm font-semibold text-zinc-950 dark:text-white">%</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-100 px-6 py-4 dark:border-zinc-800">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                const empty = emptyFilters()
                setDraft(empty)
                onApply(empty)
              }}
            >
              Reset all
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                onApply(draft)
                onClose()
              }}
            >
              Apply{activeCount > 0 ? ` (${activeCount})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

function InvoicePdfDrawer({
  invoice,
  customerName,
  onClose,
}: {
  invoice: AllocationInvoice | null
  customerName: string
  onClose: () => void
}) {
  if (!invoice) return null
  const outstanding = invoice.total - invoice.paidSoFar

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm font-semibold text-heading">Invoice {invoice.id}</p>
          <button type="button" onClick={onClose} className="text-ink-muted hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-xl border border-border bg-white p-6 text-sm dark:bg-surface">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-bold text-heading">INVOICE</p>
                <p className="mt-0.5 text-xs text-ink-muted">{invoice.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-muted">Issued</p>
                <p className="font-medium text-heading">{invoice.issuedDate}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="font-semibold uppercase tracking-wide text-ink-muted">Bill to</p>
                <p className="mt-1 font-medium text-heading">{customerName}</p>
                <p className="text-ink-muted">123 Business Park, Singapore</p>
              </div>
              <div className="text-right">
                <p className="font-semibold uppercase tracking-wide text-ink-muted">From</p>
                <p className="mt-1 font-medium text-heading">Your Company Pte Ltd</p>
                <p className="text-ink-muted">456 Supplier Road, Singapore</p>
              </div>
            </div>

            <table className="mt-6 w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-semibold uppercase tracking-wide text-ink-muted">Description</th>
                  <th className="pb-2 text-right font-semibold uppercase tracking-wide text-ink-muted">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-3 text-ink">Goods / Services supplied</td>
                  <td className="py-3 text-right tabular-nums text-heading">{sgd(invoice.total)}</td>
                </tr>
                {invoice.paidSoFar > 0 && (
                  <tr className="border-b border-border">
                    <td className="py-3 text-ink-muted">Less: payment received</td>
                    <td className="py-3 text-right tabular-nums text-ink-muted">−{sgd(invoice.paidSoFar)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-accent/10 px-4 py-3">
              <p className="text-sm font-semibold text-heading">Outstanding</p>
              <p className="text-sm font-bold tabular-nums text-accent">{sgd(outstanding)}</p>
            </div>

            <div className="mt-6 flex items-center gap-2">
              <span
                className={clsx(
                  'rounded-full px-2.5 py-1 text-xs font-medium',
                  invoice.status === 'Partial'
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-emerald-500/10 text-emerald-600',
                )}
              >
                {invoice.status === 'Partial' ? 'Partially paid' : 'Open'}
              </span>
              <span className="text-xs text-ink-muted">{invoice.ageDays} days old</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
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
        className={clsx('relative h-5 w-9 shrink-0 rounded-full transition', mode === 'ai' ? 'bg-border' : 'bg-accent')}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            mode === 'ai' ? 'translate-x-[-15px]' : 'translate-x-[0]',
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
        'flex w-full items-start justify-between gap-3 border-l-2 border-b-0 px-4 py-3 text-left transition',
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

function AllocationCard({
  payment,
  mode,
  onModeChange,
}: {
  payment: IncomingPayment
  mode: AllocationMode
  onModeChange: (mode: AllocationMode) => void
}) {
  const [overrides, setOverrides] = useState<Record<string, Set<string>>>({})
  const [pdfInvoice, setPdfInvoice] = useState<AllocationInvoice | null>(null)

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
          <li
            key={invoice.id}
            className="flex cursor-pointer items-start gap-3 py-3 hover:bg-surface-hover rounded-lg px-1 transition"
            onClick={() => setPdfInvoice(invoice)}
          >
            <input
              type="checkbox"
              checked={isChecked}
              disabled={mode === 'ai'}
              onChange={() => toggleInvoice(invoice.id)}
              onClick={(e) => e.stopPropagation()}
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

      <InvoicePdfDrawer invoice={pdfInvoice} customerName={payment.customer.name} onClose={() => setPdfInvoice(null)} />
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
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Filters>(emptyFilters())

  const selectedPayment = incomingPayments.find((p) => p.id === selectedId) ?? incomingPayments[0]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return incomingPayments.filter((payment) => {
      if (
        q &&
        !payment.payerName.toLowerCase().includes(q) &&
        !payment.customer.name.toLowerCase().includes(q) &&
        !payment.bankRef.toLowerCase().includes(q)
      )
        return false
      return true
    })
  }, [query, activeFilters])

  const filterBadges = useMemo(() => {
    const badges: { group: keyof Filters; value: string }[] = []
    for (const value of activeFilters.matchType) badges.push({ group: 'matchType', value })
    if (activeFilters.aiConfidence !== null) badges.push({ group: 'aiConfidence', value: `AI ≥ ${activeFilters.aiConfidence}%` })
    return badges
  }, [activeFilters])

  function removeFilter(group: keyof Filters, value: string) {
    setActiveFilters((prev) => {
      if (group === 'aiConfidence') return { ...prev, aiConfidence: null }
      const next = new Set(prev.matchType)
      next.delete(value)
      return { ...prev, matchType: next }
    })
  }

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
          <Button variant="white" size="sm" onClick={() => setFilterOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Add
          </Button>
          <Button variant="white" size="sm">
            <Download className="h-4 w-4" /> Import statement
          </Button>
          <Button size="sm">
            <Zap className="h-4 w-4" /> Auto-match all
          </Button>
        </div>
      </div>


      {filterBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-3">
          {filterBadges.map(({ group, value }) => (
            <span
              key={`${group}-${value}`}
              className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent"
            >
              {value}
              <button type="button" onClick={() => removeFilter(group, value)} className="ml-0.5 hover:opacity-70">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {filtersActive(activeFilters) && (
            <button
              type="button"
              onClick={() => setActiveFilters(emptyFilters())}
              className="text-xs text-ink-muted underline hover:text-ink"
            >
              Clear all
            </button>
          )}
        </div>
      )}


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

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={activeFilters}
        onApply={(f) => setActiveFilters(f)}
      />
    </section>
  )
}
