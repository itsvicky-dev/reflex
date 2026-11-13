import { useSyncExternalStore } from 'react'

/**
 * Demo-only currency SYMBOL switch (Settings > Currency).
 *
 * Nothing is converted: every amount keeps exactly the number it has today, and only the symbol (and the currency code
 * where one is written, e.g. "(USD)") changes. "ORIGINAL" leaves every screen as it is.
 */

export type SymbolChoice = 'ORIGINAL' | 'INR' | 'USD' | 'CAD'

export const SYMBOL_OPTIONS: { value: SymbolChoice; label: string; hint: string }[] = [
  { value: 'ORIGINAL', label: 'Default', hint: 'Each screen keeps its own symbol' },
  { value: 'INR', label: 'INR (₹)', hint: 'Indian rupee' },
  { value: 'USD', label: 'USD ($)', hint: 'US dollar' },
  { value: 'CAD', label: 'CAD (CA$)', hint: 'Canadian dollar' },
]

export const SYMBOLS: Record<Exclude<SymbolChoice, 'ORIGINAL'>, string> = { INR: '₹', USD: '$', CAD: 'CA$' }

/** A currency symbol written directly in front of an amount: "$128,450", "₹4.82 Cr", "SGD 8,630", "CA$20". */
const AMOUNT_PREFIX = /(?:₹|CA\$|\$|SGD ?)(?=\d)/g
/** A symbol used as a label inside brackets: "Outstanding Amount (₹)", "(₹ Cr)". */
const LABEL_SYMBOL = /(?<=\()(?:₹|CA\$|\$)(?=[ )])/g
/** A currency code standing on its own: "(USD)", "Operating Account - USD". */
const CURRENCY_CODE = /\b(?:USD|SGD|INR|CAD)\b/g
/** A symbol that sits alone in its own text node because the amount follows it as a separate piece of JSX. */
const BARE_SYMBOL = /^(?:₹|CA\$|\$|SGD ?)$/

/** The text with every currency symbol and code replaced by the chosen one. Numbers are never touched. */
export function relabel(text: string, choice: SymbolChoice): string {
  if (choice === 'ORIGINAL' || text.length === 0) return text
  return text.replace(AMOUNT_PREFIX, SYMBOLS[choice]).replace(LABEL_SYMBOL, SYMBOLS[choice]).replace(CURRENCY_CODE, choice)
}

/** Same for a text node that holds only a symbol, when the next text node starts with the amount's digits. */
export function relabelBareSymbol(text: string, nextText: string, choice: SymbolChoice): string {
  if (choice === 'ORIGINAL' || !BARE_SYMBOL.test(text) || !/^\d/.test(nextText)) return text
  return SYMBOLS[choice]
}

/* ------------------------------------------------------------------ */
/* the chosen symbol: remembered between visits                        */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'reflex.currency-symbol.v1'
const isChoice = (value: unknown): value is SymbolChoice => value === 'ORIGINAL' || value === 'INR' || value === 'USD' || value === 'CAD'

function load(): SymbolChoice {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as { choice?: unknown } | null
    return isChoice(saved?.choice) ? saved.choice : 'ORIGINAL'
  } catch {
    return 'ORIGINAL'
  }
}

let choice: SymbolChoice = load()
const listeners = new Set<() => void>()

export const getSymbolChoice = (): SymbolChoice => choice

export function setSymbolChoice(next: SymbolChoice) {
  choice = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ choice: next }))
  } catch {
    // storage unavailable (private mode): the choice just won't be remembered
  }
  listeners.forEach((listener) => listener())
}

// A change made in another open window or tab of the app shows up here too.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return
    choice = load()
    listeners.forEach((listener) => listener())
  })
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const useSymbolChoice = (): SymbolChoice => useSyncExternalStore(subscribe, getSymbolChoice)

/** One line for the assistant's CURRENT VIEW message, so its wording matches what is on screen. */
export function currencyViewLine(current: SymbolChoice = choice): string | null {
  if (current === 'ORIGINAL') return null
  const symbol = SYMBOLS[current]
  return `Display currency: the user chose to show amounts as ${current} (symbol ${symbol}). Numbers are unchanged and only the symbol differs: write every amount with ${symbol} in front (for example ${symbol}128,450), call the currency ${current}, and never convert values or mention exchange rates.`
}
