export type TransactionStatus = 'Matched' | 'Unmatched' | 'Pending'
export type Severity = 'High' | 'Medium' | 'Low'
export type RunStatus = 'Completed' | 'In Progress' | 'Failed'
export type ReportStatus = 'Ready' | 'Processing'

export type Transaction = {
  id: string
  date: string
  description: string
  source: string
  amount: string
  status: TransactionStatus
}

export type ExceptionItem = {
  id: string
  reference: string
  severity: Severity
  owner: string
  age: string
  note: string
}

export type ReconciliationRun = {
  id: string
  name: string
  period: string
  matched: number
  unmatched: number
  status: RunStatus
}

export type ReportItem = {
  id: string
  name: string
  period: string
  generatedOn: string
  status: ReportStatus
  size: string
}

export const transactions: Transaction[] = [
  { id: 'TXN-8841', date: 'Jul 19', description: 'Wire transfer - Acme Corp', source: 'Bank Feed', amount: '$42,500.00', status: 'Matched' },
  { id: 'TXN-8842', date: 'Jul 19', description: 'ACH payment - Northwind', source: 'Ledger', amount: '$8,120.50', status: 'Matched' },
  { id: 'TXN-8843', date: 'Jul 19', description: 'Card settlement batch #221', source: 'Payment Gateway', amount: '$1,204.10', status: 'Pending' },
  { id: 'TXN-8844', date: 'Jul 18', description: 'Refund - Contoso Ltd', source: 'Ledger', amount: '$620.00', status: 'Unmatched' },
  { id: 'TXN-8845', date: 'Jul 18', description: 'Wire transfer - Globex', source: 'Bank Feed', amount: '$15,300.00', status: 'Matched' },
  { id: 'TXN-8846', date: 'Jul 18', description: 'Payroll disbursement', source: 'Ledger', amount: '$96,410.75', status: 'Matched' },
  { id: 'TXN-8847', date: 'Jul 17', description: 'Card settlement batch #220', source: 'Payment Gateway', amount: '$980.40', status: 'Unmatched' },
]

export const exceptions: ExceptionItem[] = [
  { id: 'EXC-2291', reference: 'TXN-8844', severity: 'High', owner: 'Priya Nair', age: '2d', note: 'Amount mismatch of $180 against ledger entry.' },
  { id: 'EXC-2292', reference: 'TXN-8847', severity: 'High', owner: 'Unassigned', age: '1d', note: 'No matching bank record found for settlement batch.' },
  { id: 'EXC-2293', reference: 'TXN-8839', severity: 'Medium', owner: 'Daniel Cho', age: '4d', note: 'Duplicate reference number across two ledgers.' },
  { id: 'EXC-2294', reference: 'TXN-8830', severity: 'Low', owner: 'Priya Nair', age: '6d', note: 'Timing difference, expected to clear next cycle.' },
]

export const reconciliationRuns: ReconciliationRun[] = [
  { id: 'RUN-114', name: 'Operating Account - USD', period: 'Jul 19, 2026', matched: 1842, unmatched: 12, status: 'Completed' },
  { id: 'RUN-113', name: 'Payroll Clearing', period: 'Jul 18, 2026', matched: 96, unmatched: 0, status: 'Completed' },
  { id: 'RUN-112', name: 'Payment Gateway Settlements', period: 'Jul 17, 2026', matched: 512, unmatched: 8, status: 'In Progress' },
  { id: 'RUN-111', name: 'Vendor Escrow - EUR', period: 'Jul 16, 2026', matched: 210, unmatched: 3, status: 'Failed' },
]

export const reports: ReportItem[] = [
  { id: 'RPT-501', name: 'Monthly Reconciliation Summary', period: 'Jun 2026', generatedOn: 'Jul 1, 2026', status: 'Ready', size: '1.2 MB' },
  { id: 'RPT-502', name: 'Exception Audit Trail', period: 'Jun 2026', generatedOn: 'Jul 1, 2026', status: 'Ready', size: '640 KB' },
  { id: 'RPT-503', name: 'Weekly Variance Report', period: 'Jul 14-19, 2026', generatedOn: 'Jul 19, 2026', status: 'Processing', size: '—' },
]

export const weeklyTrend = [
  { label: 'Mon', matched: 82, unmatched: 8 },
  { label: 'Tue', matched: 91, unmatched: 4 },
  { label: 'Wed', matched: 76, unmatched: 12 },
  { label: 'Thu', matched: 88, unmatched: 6 },
  { label: 'Fri', matched: 95, unmatched: 3 },
  { label: 'Sat', matched: 60, unmatched: 2 },
  { label: 'Sun', matched: 54, unmatched: 1 },
]
