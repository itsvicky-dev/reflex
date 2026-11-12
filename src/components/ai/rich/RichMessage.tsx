import { ArrowUpRight } from 'lucide-react'
import { useMemo } from 'react'
import { parseRichContent } from '../../../ai/parseBlocks'
import { AiChart, ChartSkeleton } from './AiChart'
import { KpiSkeleton, KpiStrip } from './KpiStrip'
import { MarkdownBody } from './MarkdownBody'

/**
 * Renders an AI answer: Markdown (bold, italics, tables, callouts) interleaved with charts and KPI strips.
 * Safe while streaming: unfinished blocks show a skeleton instead of half-written JSON.
 */
export function RichMessage({
  content,
  streaming,
  onFollowUp,
  showFollowUps,
}: {
  content: string
  streaming: boolean
  onFollowUp?: (text: string) => void
  showFollowUps: boolean
}) {
  const segments = useMemo(() => parseRichContent(content, streaming), [content, streaming])
  const firstMarkdown = segments.findIndex((segment) => segment.kind === 'markdown')

  return (
    <div className="min-w-0">
      {segments.map((segment, index) => {
        if (segment.kind === 'markdown') return <MarkdownBody key={index} text={segment.text} lead={index === firstMarkdown} />
        if (segment.kind === 'chart') {
          if (segment.pending) return <ChartSkeleton key={index} />
          return segment.spec ? <AiChart key={index} spec={segment.spec} /> : null
        }
        if (segment.kind === 'kpis') {
          if (segment.pending) return <KpiSkeleton key={index} />
          return <KpiStrip key={index} items={segment.items} />
        }
        if (!showFollowUps || streaming || segment.items.length === 0) return null
        return (
          <div key={index} className="mt-3 flex flex-col items-start gap-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">Suggested follow-ups</p>
            {segment.items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onFollowUp?.(item)}
                className="group flex max-w-full items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-left text-xs text-ink transition hover:border-accent/40 hover:bg-accent/5 hover:text-heading"
              >
                <span className="truncate">{item}</span>
                <ArrowUpRight className="h-3 w-3 shrink-0 text-ink-muted transition group-hover:text-accent" />
              </button>
            ))}
          </div>
        )
      })}
      {streaming && content.length > 0 && <span className="mt-1 inline-block h-2 w-2 animate-pulse rounded-full bg-accent align-middle" aria-hidden />}
    </div>
  )
}
