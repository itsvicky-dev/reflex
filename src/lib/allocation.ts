import type { AllocationInvoice, IncomingPayment } from '../data/mockWorkbench'

export function outstandingOf(invoice: AllocationInvoice) {
  return invoice.total - invoice.paidSoFar
}

/** Invoices the engine ticks for a payment: oldest first until the payment is covered (FIFO). */
export function fifoSelection(payment: IncomingPayment): Set<string> {
  let remaining = payment.amount
  const ids = new Set<string>()
  for (const invoice of payment.customer.invoices) {
    if (remaining <= 0) break
    const outstanding = outstandingOf(invoice)
    if (outstanding <= 0) continue
    ids.add(invoice.id)
    remaining -= outstanding
  }
  return ids
}

export type AllocationLine = {
  invoiceId: string
  outstanding: number
  applied: number
  clears: boolean
  remainingAfter: number
}

/** The exact amounts the Workbench shows as "Applying X - clears / Y remaining" for the AI (FIFO) mode. */
export function fifoAllocation(payment: IncomingPayment): AllocationLine[] {
  const selected = fifoSelection(payment)
  let remaining = payment.amount
  const lines: AllocationLine[] = []
  for (const invoice of payment.customer.invoices) {
    if (!selected.has(invoice.id)) continue
    const outstanding = outstandingOf(invoice)
    const applied = Math.min(Math.max(remaining, 0), outstanding)
    remaining -= applied
    lines.push({
      invoiceId: invoice.id,
      outstanding,
      applied,
      clears: applied >= outstanding,
      remainingAfter: outstanding - applied,
    })
  }
  return lines
}
