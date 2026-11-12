import { clsx } from 'clsx'
import { AlertTriangle, Check, Copy, Info, Lightbulb, Mail } from 'lucide-react'
import { Children, isValidElement, useState, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import { Link } from 'react-router-dom'
import remarkGfm from 'remark-gfm'

function nodeText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) {
    const text = nodeText(node.props.children)
    return node.type === 'p' || node.type === 'br' ? `${text}\n` : text
  }
  return ''
}

type CalloutKind = 'recommendation' | 'watch' | 'insight' | 'draft'

function calloutKind(text: string): CalloutKind {
  const head = text.trim().slice(0, 24).toLowerCase()
  if (/^subject\s*:/.test(head)) return 'draft'
  if (head.startsWith('recommend') || head.startsWith('next step') || head.startsWith('action')) return 'recommendation'
  if (head.startsWith('watch') || head.startsWith('risk') || head.startsWith('warning') || head.startsWith('caution')) return 'watch'
  return 'insight'
}

const calloutStyle: Record<Exclude<CalloutKind, 'draft'>, { border: string; bg: string; icon: typeof Info; iconClass: string }> = {
  recommendation: { border: 'border-accent', bg: 'bg-accent/[0.06]', icon: Lightbulb, iconClass: 'text-accent' },
  watch: { border: 'border-[color:var(--color-chart-warning)]', bg: 'bg-[color:var(--color-chart-warning)]/10', icon: AlertTriangle, iconClass: 'text-ink-muted' },
  insight: { border: 'border-border', bg: 'bg-surface-hover/60', icon: Info, iconClass: 'text-ink-muted' },
}

function DraftBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false)
  const text = nodeText(children).replace(/\n{3,}/g, '\n\n').trim()

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard unavailable (insecure context): ignore
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-hover/60 px-3 py-1.5">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink-muted">
          <Mail className="h-3.5 w-3.5" /> Draft for your review
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-ink-muted transition hover:bg-surface-hover hover:text-ink"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="flex flex-col gap-2 px-3.5 py-3 text-[13px] leading-relaxed text-ink [&_strong]:font-semibold [&_strong]:text-heading">{children}</div>
    </div>
  )
}

const components: Components = {
  p: ({ children }) => <p className="text-[13px] leading-[1.65] text-ink">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-heading">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: ({ children }) => <h3 className="pt-2 text-[15px] font-semibold text-heading first:pt-0">{children}</h3>,
  h2: ({ children }) => <h3 className="pt-2 text-[15px] font-semibold text-heading first:pt-0">{children}</h3>,
  h3: ({ children }) => <h4 className="pt-1.5 text-[13.5px] font-semibold text-heading first:pt-0">{children}</h4>,
  h4: ({ children }) => <h5 className="pt-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted first:pt-0">{children}</h5>,
  ul: ({ children }) => <ul className="space-y-1.5">{children}</ul>,
  // Numbered lists keep native markers; bullets (below) get a small dot instead.
  ol: ({ children }) => (
    <ol className="list-decimal space-y-1.5 pl-5 text-[13px] marker:font-medium marker:text-ink-muted [&>li]:pl-0 [&>li]:before:hidden">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="relative pl-4 text-[13px] leading-[1.6] text-ink before:absolute before:left-0.5 before:top-[0.62em] before:h-1 before:w-1 before:rounded-full before:bg-ink-muted/70">
      {children}
    </li>
  ),
  hr: () => <hr className="my-1 border-border" />,
  a: ({ href, children }) => {
    const className = 'font-medium text-accent underline decoration-accent/30 underline-offset-2 transition hover:decoration-accent'
    if (href?.startsWith('/')) {
      return (
        <Link to={href} className={className}>
          {children}
        </Link>
      )
    }
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={className}>
        {children}
      </a>
    )
  },
  code: ({ children, className }) =>
    className ? (
      <code className={clsx('font-mono text-[12px]', className)}>{children}</code>
    ) : (
      <code className="rounded bg-surface-hover px-1 py-0.5 font-mono text-[12px] text-heading">{children}</code>
    ),
  pre: ({ children }) => <pre className="overflow-x-auto rounded-lg border border-border bg-surface-hover p-3 text-[12px] leading-relaxed text-heading">{children}</pre>,
  blockquote: ({ children }) => {
    const kind = calloutKind(nodeText(Children.toArray(children)))
    if (kind === 'draft') return <DraftBlock>{children}</DraftBlock>
    const style = calloutStyle[kind]
    const Icon = style.icon
    return (
      <blockquote className={clsx('flex gap-2.5 rounded-lg border-l-2 px-3.5 py-2.5', style.border, style.bg)}>
        <Icon className={clsx('mt-[3px] h-3.5 w-3.5 shrink-0', style.iconClass)} />
        <div className="flex min-w-0 flex-col gap-1.5 text-[13px] leading-[1.6] text-ink">{children}</div>
      </blockquote>
    )
  },
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-left text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-surface-hover/60">{children}</thead>,
  th: ({ children, style }) => (
    <th style={style} className="whitespace-nowrap px-3 py-2 text-[11px] font-semibold text-ink-muted">
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="border-t border-border px-3 py-2 align-top text-xs leading-snug tabular-nums text-ink">
      {children}
    </td>
  ),
}

export function MarkdownBody({ text, lead = false }: { text: string; lead?: boolean }) {
  return (
    <div className={clsx('flex flex-col gap-2.5', lead && '[&>p:first-child]:text-[14px] [&>p:first-child]:leading-[1.6] [&>p:first-child]:text-heading')}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  )
}
