import type { BadgeTone } from '../components/ui/Badge'
import type { ReportStatus, RunStatus, Severity, TransactionStatus } from '../data/mockReconciliation'

export const transactionTone: Record<TransactionStatus, BadgeTone> = {
  Matched: 'success',
  Unmatched: 'danger',
  Pending: 'warning',
}

export const severityTone: Record<Severity, BadgeTone> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
}

export const runTone: Record<RunStatus, BadgeTone> = {
  Completed: 'success',
  'In Progress': 'accent',
  Failed: 'danger',
}

export const reportTone: Record<ReportStatus, BadgeTone> = {
  Ready: 'success',
  Processing: 'warning',
}
