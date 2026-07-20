import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { reconciliationRuns } from '../data/mockReconciliation'
import { runTone } from '../lib/status'

export function ReconciliationPage() {
  return (
    <section className="space-y-4">
      <Card className="overflow-x-auto p-5">
        <h3 className="text-base font-semibold text-heading">Reconciliation Runs</h3>
        <p className="text-sm text-ink-muted">Bank vs. ledger matching runs across every connected account.</p>

        <table className="mt-4 w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
              <th className="pb-3 font-medium">Run</th>
              <th className="pb-3 font-medium">Account</th>
              <th className="pb-3 font-medium">Period</th>
              <th className="pb-3 font-medium">Matched</th>
              <th className="pb-3 font-medium">Unmatched</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {reconciliationRuns.map((run) => (
              <tr key={run.id} className="border-b border-border/60 last:border-0">
                <td className="py-3 font-medium text-heading">{run.id}</td>
                <td className="py-3 text-ink-muted">{run.name}</td>
                <td className="py-3 text-ink-muted">{run.period}</td>
                <td className="py-3 text-ink">{run.matched.toLocaleString()}</td>
                <td className="py-3 text-ink">{run.unmatched}</td>
                <td className="py-3">
                  <Badge tone={runTone[run.status]}>{run.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  )
}
