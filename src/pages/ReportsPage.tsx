import { Download } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import { reports } from '../data/mockReconciliation'
import { reportTone } from '../lib/status'

export function ReportsPage() {
  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm text-ink-muted">Auto-Match Success</p>
          <h4 className="mt-2 text-3xl font-semibold text-heading">96.8%</h4>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-ink-muted">Open Variance</p>
          <h4 className="mt-2 text-3xl font-semibold text-heading">$18.2K</h4>
        </Card>
      </div>

      <Card className="overflow-x-auto p-5">
        <h3 className="text-base font-semibold text-heading">Generated Reports</h3>
        <p className="text-sm text-ink-muted">Export period summaries and audit-ready reconciliation reports.</p>

        <table className="mt-4 w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wider text-ink-muted">
              <th className="pb-3 font-medium">Report</th>
              <th className="pb-3 font-medium">Period</th>
              <th className="pb-3 font-medium">Generated</th>
              <th className="pb-3 font-medium">Size</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Download</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-b border-border/60 last:border-0">
                <td className="py-3 font-medium text-heading">{report.name}</td>
                <td className="py-3 text-ink-muted">{report.period}</td>
                <td className="py-3 text-ink-muted">{report.generatedOn}</td>
                <td className="py-3 text-ink-muted">{report.size}</td>
                <td className="py-3">
                  <Badge tone={reportTone[report.status]}>{report.status}</Badge>
                </td>
                <td className="py-3 text-right">
                  <IconButton aria-label={`Download ${report.name}`} disabled={report.status !== 'Ready'} className="ml-auto">
                    <Download className="h-4 w-4" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  )
}
