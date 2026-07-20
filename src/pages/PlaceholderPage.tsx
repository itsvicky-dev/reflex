import { LayoutGrid } from 'lucide-react'
import { Card } from '../components/ui/Card'

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <section>
      <Card className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-heading">{title}</h3>
        <p className="max-w-sm text-sm text-ink-muted">
          This section mirrors the reference layout but doesn&apos;t have content wired up yet.
        </p>
      </Card>
    </section>
  )
}
