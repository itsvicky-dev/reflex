import { clsx } from 'clsx'
import { BarChart3, Table2 } from 'lucide-react'
import { useState } from 'react'
import type { ChartSpec } from '../../../ai/types'
import { ColumnChart, RankedBarChart } from './BarCharts'
import { LineAreaChart } from './LineChart'
import { ScatterChart } from './ScatterChart'
import { SegmentedBar } from './SegmentedBar'
import { formatNumber, formatValue, seriesColor, useMeasuredWidth } from './chartUtils'

function Legend({ spec }: { spec: ChartSpec }) {
  const isLine = spec.type === 'line' || spec.type === 'area'
  return (
    <ul className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1">
      {spec.series.map((s, i) => (
        <li key={s.name} className="flex items-center gap-1.5 text-[11px] text-ink-muted">
          {isLine ? (
            <span className="h-[3px] w-3.5 rounded-full" style={{ backgroundColor: seriesColor(i) }} />
          ) : (
            <span className="h-2 w-2 rounded-[3px]" style={{ backgroundColor: seriesColor(i) }} />
          )}
          {s.name}
        </li>
      ))}
    </ul>
  )
}

/** Every chart has a table twin: tooltips enhance, they never gate access to a value. */
function ChartTable({ spec }: { spec: ChartSpec }) {
  const head = 'whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold text-ink-muted'
  const cell = 'px-3 py-2 text-xs text-ink'

  if (spec.type === 'scatter') {
    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse">
          <thead className="bg-surface-hover/60">
            <tr>
              <th className={head}>Item</th>
              <th className={clsx(head, 'text-right')}>{spec.xLabel ?? 'X'}</th>
              <th className={clsx(head, 'text-right')}>{spec.yLabel ?? 'Y'}</th>
              {spec.points?.some((p) => p.size !== undefined) && <th className={clsx(head, 'text-right')}>Size</th>}
              {spec.points?.some((p) => p.group) && <th className={head}>Group</th>}
            </tr>
          </thead>
          <tbody>
            {spec.points?.map((p, i) => (
              <tr key={`${p.label}-${i}`} className="border-t border-border">
                <td className={clsx(cell, 'font-medium text-heading')}>{p.label}</td>
                <td className={clsx(cell, 'text-right tabular-nums')}>{formatNumber(p.x)}</td>
                <td className={clsx(cell, 'text-right tabular-nums')}>{formatValue(p.y, spec)}</td>
                {spec.points?.some((q) => q.size !== undefined) && <td className={clsx(cell, 'text-right tabular-nums')}>{p.size !== undefined ? formatNumber(p.size) : '–'}</td>}
                {spec.points?.some((q) => q.group) && <td className={cell}>{p.group ?? '–'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse">
        <thead className="bg-surface-hover/60">
          <tr>
            <th className={head}>{spec.xLabel ?? 'Category'}</th>
            {spec.series.map((s) => (
              <th key={s.name} className={clsx(head, 'text-right')}>
                {s.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {spec.labels.map((label, i) => (
            <tr key={`${label}-${i}`} className="border-t border-border">
              <td className={clsx(cell, 'font-medium text-heading')}>{label}</td>
              {spec.series.map((s) => (
                <td key={s.name} className={clsx(cell, 'text-right tabular-nums')}>
                  {formatValue(s.values[i], spec)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function AiChart({ spec }: { spec: ChartSpec }) {
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const [ref, width] = useMeasuredWidth<HTMLDivElement>()
  const multi = spec.series.length >= 2 && spec.type !== 'segmented'

  return (
    <figure className="relative my-3 rounded-xl border border-border bg-surface">
      <figcaption className="flex items-start justify-between gap-3 px-4 pt-3.5">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold leading-snug text-heading">{spec.title}</div>
          {spec.subtitle && <div className="mt-0.5 text-[11px] leading-snug text-ink-muted">{spec.subtitle}</div>}
        </div>
        <div className="inline-flex shrink-0 items-center rounded-lg border border-border p-0.5" role="group" aria-label="Chart view">
          {(
            [
              ['chart', BarChart3, 'Chart'],
              ['table', Table2, 'Table'],
            ] as const
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              aria-label={`${label} view`}
              onClick={() => setView(key)}
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-md transition',
                view === key ? 'bg-heading text-surface' : 'text-ink-muted hover:text-ink',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </figcaption>

      <div ref={ref} className="min-w-0 px-4 pb-4 pt-3">
        {view === 'table' ? (
          <ChartTable spec={spec} />
        ) : (
          width > 0 && (
            <>
              {multi && <Legend spec={spec} />}
              {spec.type === 'bar' && <ColumnChart spec={spec} width={width} />}
              {spec.type === 'hbar' && <RankedBarChart spec={spec} width={width} />}
              {(spec.type === 'line' || spec.type === 'area') && <LineAreaChart spec={spec} width={width} />}
              {spec.type === 'scatter' && <ScatterChart spec={spec} width={width} />}
              {spec.type === 'segmented' && <SegmentedBar spec={spec} width={width} />}
            </>
          )
        )}
      </div>
    </figure>
  )
}

export function ChartSkeleton() {
  return (
    <div className="my-3 overflow-hidden rounded-xl border border-border bg-surface p-4" aria-label="Building chart" role="status">
      <div className="h-3 w-40 animate-pulse rounded bg-surface-hover" />
      <div className="mt-4 flex h-28 items-end gap-3">
        {[40, 70, 55, 90, 62, 78].map((h, i) => (
          <div key={i} className="flex-1 animate-pulse rounded-t bg-surface-hover" style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }} />
        ))}
      </div>
      <div className="mt-3 text-[11px] text-ink-muted">Building chart…</div>
    </div>
  )
}
