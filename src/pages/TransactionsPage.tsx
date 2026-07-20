import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { transactions, type TransactionStatus } from '../data/mockReconciliation'
import { transactionTone } from '../lib/status'

const filters: Array<TransactionStatus | 'All'> = ['All', 'Matched', 'Unmatched', 'Pending']

export function TransactionsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const [query, setQuery] = useState('')

  const visible = useMemo(
    () =>
      transactions.filter((txn) => {
        const matchesFilter = filter === 'All' || txn.status === filter
        const matchesQuery =
          query.trim().length === 0 ||
          txn.id.toLowerCase().includes(query.toLowerCase()) ||
          txn.description.toLowerCase().includes(query.toLowerCase())
        return matchesFilter && matchesQuery
      }),
    [filter, query],
  )

  return (
    <section className="space-y-4">
      <Card className="p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  filter === item ? 'bg-accent/10 text-accent' : 'text-ink-muted hover:bg-surface-hover'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by ID or description"
              className="w-full rounded-xl border border-border bg-surface py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-muted focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 sm:w-72"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
                <th className="pb-3 font-medium">Reference</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((txn) => (
                <tr key={txn.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 font-medium text-heading">{txn.id}</td>
                  <td className="py-3 text-ink-muted">{txn.date}</td>
                  <td className="py-3 text-ink-muted">{txn.description}</td>
                  <td className="py-3 text-ink-muted">{txn.source}</td>
                  <td className="py-3 text-ink">{txn.amount}</td>
                  <td className="py-3">
                    <Badge tone={transactionTone[txn.status]}>{txn.status}</Badge>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-ink-muted">
                    No transactions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  )
}
