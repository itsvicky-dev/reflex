import { useLayoutEffect } from 'react'
import { applyCurrencySymbol } from '../../features/currency/domRelabel'
import { useSymbolChoice } from '../../features/currency/symbol'

/** Keeps the whole app showing the currency symbol chosen in Settings. Renders nothing. */
export function CurrencySymbolSync() {
  const choice = useSymbolChoice()

  // A layout effect runs before the browser paints, so a reload never flashes the old symbol.
  useLayoutEffect(() => {
    applyCurrencySymbol(choice)
    return () => applyCurrencySymbol('ORIGINAL')
  }, [choice])

  return null
}
