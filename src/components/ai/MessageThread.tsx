import { clsx } from 'clsx'
import { AlertCircle, Check, Copy, LayoutGrid, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toCopyText } from '../../ai/parseBlocks'
import type { AiMessage } from '../../ai/types'
import { relabel, useSymbolChoice } from '../../features/currency/symbol'
import { RichMessage } from './rich/RichMessage'

const THINKING_STEPS = ['Reading your workspace data', 'Analysing figures and trends', 'Preparing your answer']

function ThinkingIndicator({ pageTitle }: { pageTitle?: string }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => setStep((s) => Math.min(s + 1, THINKING_STEPS.length - 1)), 1300)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-2 text-xs text-ink-muted" role="status" aria-live="polite">
      <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
      <span>
        {THINKING_STEPS[step]}
        {step === 0 && pageTitle ? ` · ${pageTitle}` : ''}…
      </span>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      // clipboard unavailable
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-ink-muted transition hover:bg-surface-hover hover:text-ink"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function AssistantMessage({
  message,
  isLast,
  isThinking,
  onFollowUp,
  onRegenerate,
}: {
  message: AiMessage
  isLast: boolean
  isThinking: boolean
  onFollowUp: (text: string) => void
  onRegenerate: () => void
}) {
  const streaming = message.status === 'streaming'
  const failed = message.status === 'error'
  const stopped = message.status === 'stopped'
  const symbolChoice = useSymbolChoice()

  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Sparkles className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[11px] font-semibold text-heading">Reflex</div>

        {isThinking && message.content.length === 0 ? (
          <ThinkingIndicator />
        ) : (
          message.content.length > 0 && (
            <RichMessage content={message.content} streaming={streaming} onFollowUp={onFollowUp} showFollowUps={isLast} />
          )
        )}

        {failed && (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-[color:var(--color-chart-critical)]/30 bg-[color:var(--color-chart-critical)]/[0.06] px-3 py-2.5">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[color:var(--color-chart-critical)]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-relaxed text-ink">{message.error ?? 'Something went wrong.'}</p>
              {isLast && (
                <button
                  type="button"
                  onClick={onRegenerate}
                  className="mt-1.5 flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                >
                  <RefreshCw className="h-3 w-3" /> Try again
                </button>
              )}
            </div>
          </div>
        )}

        {stopped && <div className="mt-1.5 text-[11px] italic text-ink-muted">Response stopped.</div>}

        {!streaming && message.content.length > 0 && (
          <div className="-ml-1.5 mt-1.5 flex items-center gap-0.5">
            <CopyButton text={relabel(toCopyText(message.content), symbolChoice)} />
            {isLast && (
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-ink-muted transition hover:bg-surface-hover hover:text-ink"
              >
                <RefreshCw className="h-3 w-3" /> Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function MessageThread({
  messages,
  isThinking,
  isStreaming,
  variant,
  onFollowUp,
  onRegenerate,
  className,
}: {
  messages: AiMessage[]
  isThinking: boolean
  isStreaming: boolean
  variant: 'panel' | 'page'
  onFollowUp: (text: string) => void
  onRegenerate: () => void
  className?: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef(true)
  const lastMessage = messages[messages.length - 1]

  // A new user message always brings the thread to the bottom; during streaming we only follow if the reader is already there.
  useEffect(() => {
    stickRef.current = true
  }, [messages.length])

  useEffect(() => {
    const el = scrollRef.current
    if (el && stickRef.current) el.scrollTo({ top: el.scrollHeight })
  }, [messages, isThinking])

  return (
    <div
      ref={scrollRef}
      onScroll={(event) => {
        const el = event.currentTarget
        stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 140
      }}
      className={clsx('scrollbar-hide overflow-y-auto', className)}
    >
      <div className={clsx('flex flex-col gap-6', variant === 'page' ? 'mx-auto w-full max-w-[760px] px-6 py-8' : 'px-3.5 py-4')}>
        {messages.map((message, index) =>
          message.role === 'user' ? (
            <div key={message.id} className="flex flex-col items-end gap-1.5">
              {(message.contextLabel || message.pageTitle) && (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-surface-hover px-2 py-0.5 text-[11px] text-ink-muted">
                  <LayoutGrid className="h-3 w-3 shrink-0 text-pink-500" />
                  <span className="truncate">{message.contextLabel ?? message.pageTitle}</span>
                </span>
              )}
              <div
                className={clsx(
                  'max-w-[88%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed',
                  variant === 'panel' ? 'bg-accent text-accent-content' : 'bg-accent/10 text-heading',
                )}
              >
                {message.content}
              </div>
            </div>
          ) : (
            <AssistantMessage
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
              isThinking={isThinking && message === lastMessage}
              onFollowUp={onFollowUp}
              onRegenerate={onRegenerate}
            />
          ),
        )}
      </div>
      {/* keeps the last answer clear of the composer while streaming */}
      <div className={isStreaming ? 'h-4' : 'h-1'} />
    </div>
  )
}
