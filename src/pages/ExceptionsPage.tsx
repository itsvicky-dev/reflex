import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { exceptions } from '../data/mockReconciliation'
import { severityTone } from '../lib/status'

export function ExceptionsPage() {
  return (
    <section className="space-y-4">
      <div className="grid gap-4">
        {exceptions.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-heading">{item.id}</h3>
                  <Badge tone={severityTone[item.severity]}>{item.severity}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-muted">{item.note}</p>
                <p className="mt-2 text-xs text-ink-muted">
                  Linked to <span className="font-medium text-ink">{item.reference}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 text-sm text-ink-muted sm:flex-col sm:items-end sm:gap-1">
                <span>{item.owner}</span>
                <span className="text-xs">Opened {item.age} ago</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
