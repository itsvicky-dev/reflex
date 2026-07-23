import { clsx } from 'clsx'
import { ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { categoryIcon, categoryLabel, controlTowerLogs, controlTowerTabs } from '../data/mockControlTower'

function TabBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="scrollbar-hide flex items-center gap-1.5 overflow-x-auto border-b border-border pb-3">
      {controlTowerTabs.map((tab) => {
        const Icon = tab.icon
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={clsx(
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-1.5 text-sm font-medium transition',
              active
                ? 'border-accent/30 bg-accent/10 text-accent'
                : 'border-border text-ink-muted hover:bg-surface-hover hover:text-ink',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

function LogRow({
  log,
  isFirst,
  isLast,
}: {
  log: (typeof controlTowerLogs)[number]
  isFirst: boolean
  isLast: boolean
}) {
  const Icon = categoryIcon[log.category]
  const isAiGenerated = log.category === 'insight' || log.category === 'recommendation'

  return (
    <div className="flex">
      <div className="flex w-20 shrink-0 items-center justify-end pr-3">
        <span className="text-xs font-semibold text-heading">{log.time}</span>
      </div>

      <div className="flex w-4 shrink-0 flex-col items-center">
        <span className={clsx('w-px flex-1', isFirst ? 'bg-transparent' : 'bg-border')} />
        <span className="h-2 w-2 shrink-0 rounded-full bg-accent ring-4 ring-accent/15" />
        <span className={clsx('w-px flex-1', isLast ? 'bg-transparent' : 'bg-border')} />
      </div>

      <button
        type="button"
        className="mx-2 flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-3.5 text-left transition hover:bg-surface-hover"
      >
        <div
          className={clsx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            isAiGenerated ? 'bg-accent/10 text-accent' : 'bg-ink/[0.06] text-ink-muted',
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-heading">{log.title}</p>
          <p className="mt-0.5 truncate text-xs text-ink-muted">{log.description}</p>
        </div>

        <Badge tone={isAiGenerated ? 'accent' : 'neutral'} dot={false} className="shrink-0">
          {categoryLabel[log.category]}
        </Badge>

        <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
      </button>
    </div>
  )
}

export function ControlTowerPage() {
  const [activeTab, setActiveTab] = useState<string>('all')

  const logs = useMemo(
    () => (activeTab === 'all' ? controlTowerLogs : controlTowerLogs.filter((log) => log.category === activeTab)),
    [activeTab],
  )

  const today = useMemo(
    () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    [],
  )

  return (
    <section className="space-y-4">
      <TabBar value={activeTab} onChange={setActiveTab} />

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-heading">
            Today <span className="text-ink-muted">· {today}</span>
          </p>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-ink-muted">
              <RefreshCw className="h-3.5 w-3.5" />
              Auto refresh is on
            </span>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink"
            >
              Most Recent
              <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col">
          {logs.map((log, index) => (
            <LogRow key={log.id} log={log} isFirst={index === 0} isLast={index === logs.length - 1} />
          ))}

          {logs.length === 0 && (
            <p className="py-10 text-center text-sm text-ink-muted">No activity in this category yet today.</p>
          )}
        </div>
      </Card>
    </section>
  )
}
