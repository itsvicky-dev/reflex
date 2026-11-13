import { clsx } from 'clsx'
import { ArrowRight, Check, Coins } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { relabel, setSymbolChoice, SYMBOL_OPTIONS, useSymbolChoice, type SymbolChoice } from '../../features/currency/symbol'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

// Real figures from the app, exactly as they are written today, so the preview shows what will change.
const SAMPLES = [
  { label: 'Home · Total outstanding', text: '$128,450' },
  { label: 'FinPilot · Today’s collections', text: '₹4.82 Cr' },
  { label: 'Customers · The Chop Chop Grill outstanding', text: 'SGD 8,630' },
]

const labelOf = (value: SymbolChoice) => SYMBOL_OPTIONS.find((option) => option.value === value)?.label ?? value

export function CurrencySettings() {
  const applied = useSymbolChoice()
  const [draft, setDraft] = useState<SymbolChoice>(applied)
  const [justApplied, setJustApplied] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const changed = draft !== applied

  function apply() {
    setSymbolChoice(draft)
    setJustApplied(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setJustApplied(false), 2500)
  }

  return (
    // Everything inside shows the symbols themselves, so the app-wide symbol switch must not rewrite it.
    <Card className="p-5" data-currency-skip>
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
          <Coins className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-heading">Currency</h3>
          <p className="text-sm text-ink-muted">
            Choose the currency symbol shown across the workspace. Amounts stay exactly the same: only the symbol changes.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">Currency symbol</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Currency symbol">
          {SYMBOL_OPTIONS.map((option) => {
            const selected = draft === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setDraft(option.value)}
                className={clsx(
                  'flex flex-col items-start rounded-xl border px-3 py-2.5 text-left transition',
                  selected ? 'border-accent/30 bg-accent/10' : 'border-border hover:bg-surface-hover',
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className={clsx('text-sm font-semibold', selected ? 'text-accent' : 'text-heading')}>{option.label}</span>
                  {selected && <Check className="h-4 w-4 text-accent" strokeWidth={3} />}
                </span>
                <span className="mt-0.5 text-[11px] leading-snug text-ink-muted">{option.hint}</span>
                {applied === option.value && (
                  <span className="mt-1.5 rounded-full bg-surface-hover px-2 py-0.5 text-[10px] font-medium text-ink-muted">Applied</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-border">
        <p className="border-b border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Preview · {labelOf(draft)}
        </p>
        <ul className="divide-y divide-border">
          {SAMPLES.map((sample) => (
            <li key={sample.label} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5 text-sm">
              <span className="text-ink">{sample.label}</span>
              <span className="flex items-center gap-2 tabular-nums">
                <span className="text-xs text-ink-muted">{sample.text}</span>
                <ArrowRight className="h-3 w-3 text-ink-muted" />
                <span className="font-semibold text-heading">{relabel(sample.text, draft)}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="button" onClick={apply} disabled={!changed}>
          Apply
        </Button>
        {justApplied ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400" role="status">
            <Check className="h-4 w-4" strokeWidth={3} /> Applied: {labelOf(applied)}
          </span>
        ) : changed ? (
          <span className="text-sm text-ink-muted">Not applied yet. Pick Apply to change the symbol everywhere.</span>
        ) : (
          <span className="text-sm text-ink-muted">
            {applied === 'ORIGINAL' ? 'Each screen is showing its own symbol.' : `All amounts are showing ${labelOf(applied)}.`}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[11px] leading-relaxed text-ink-muted">
          Demo setting: values are not converted between currencies, so the numbers are identical whichever symbol you choose.
        </p>
      </div>
    </Card>
  )
}
