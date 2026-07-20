import { AlertTriangle, ArrowLeftRight, FileBarChart2, GitCompareArrows, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '../components/ui/Card'

const items: { to: string; label: string; description: string; icon: LucideIcon }[] = [
  {
    to: '/reconciliation',
    label: 'Reconciliation Runs',
    description: 'Bank vs. ledger matching runs across every connected account.',
    icon: GitCompareArrows,
  },
  {
    to: '/transactions',
    label: 'Transactions',
    description: 'Every transaction feeding into the matching engine.',
    icon: ArrowLeftRight,
  },
  {
    to: '/exceptions',
    label: 'Exceptions',
    description: 'Mismatches awaiting triage and resolution.',
    icon: AlertTriangle,
  },
  {
    to: '/reports',
    label: 'Reports',
    description: 'Exported period summaries and audit-ready reports.',
    icon: FileBarChart2,
  },
]

export function AllContentPage() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <Link key={item.to} to={item.to}>
          <Card className="flex h-full items-start gap-4 p-5 transition hover:border-accent/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-heading">{item.label}</h3>
              <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
            </div>
          </Card>
        </Link>
      ))}
    </section>
  )
}
