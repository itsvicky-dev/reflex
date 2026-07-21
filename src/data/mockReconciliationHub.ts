export type BankFeedStatus = 'Auto Matched' | 'Partial Match' | 'Needs Review' | 'Unmatched'

export type OpenInvoiceStatus = 'Open' | 'Partial' | 'Overdue'

export type OpenInvoice = {
  id: string
  date: string
  ageDays: number
  status: OpenInvoiceStatus
  total: number
  paid: number
  reason?: string
}

export type BankFeedItem = {
  id: string
  date: string
  time: string
  payee: string
  bankReference: string
  amount: number
  customer?: string
  invoiceReference?: string
  status: BankFeedStatus
  confidence?: number
  openInvoices?: OpenInvoice[]
}

export const bankFeedItems: BankFeedItem[] = [
  {
    id: 'BF-1032',
    date: '07 May 2026',
    time: '10:32 AM',
    payee: 'ABC FOODS PTE LTD',
    bankReference: 'REF: 20260507-1032',
    amount: 4200,
    customer: 'ABC Foods Pte Ltd',
    invoiceReference: 'INV-2034',
    status: 'Auto Matched',
    confidence: 98,
    openInvoices: [{ id: 'INV-2034', date: '07 May 2026', ageDays: 0, status: 'Open', total: 4200, paid: 4200 }],
  },
  {
    id: 'BF-772991',
    date: '07 May 2026',
    time: '10:15 AM',
    payee: 'TAN JIAN HAO',
    bankReference: 'REF: PAYNOW-772991',
    amount: 1850,
    customer: 'Tan Jian Hao',
    invoiceReference: 'INV-2031, INV-2030 (Partial)',
    status: 'Partial Match',
    confidence: 78,
    openInvoices: [
      { id: 'INV-24860', date: '2026-05-19', ageDays: 53, status: 'Partial', total: 2850, paid: 500, reason: 'Dispute pending' },
      { id: 'INV-25015', date: '2026-06-08', ageDays: 33, status: 'Open', total: 3100, paid: 0 },
      { id: 'INV-25260', date: '2026-06-30', ageDays: 11, status: 'Open', total: 2680, paid: 0 },
    ],
  },
  {
    id: 'BF-772812',
    date: '07 May 2026',
    time: '09:58 AM',
    payee: 'GREEN LEAF CAFE',
    bankReference: 'REF: PAYNOW-772812',
    customer: 'Green Leaf Cafe',
    amount: 3400,
    status: 'Unmatched',
  },
  {
    id: 'BF-1234567890',
    date: '07 May 2026',
    time: '09:41 AM',
    payee: 'FRESH KITCHEN',
    bankReference: 'REF: 1234567890',
    amount: 2100,
    customer: 'Fresh Kitchen',
    invoiceReference: 'INV-2028',
    status: 'Auto Matched',
    confidence: 95,
    openInvoices: [{ id: 'INV-2028', date: '07 May 2026', ageDays: 0, status: 'Open', total: 2100, paid: 2100 }],
  },
  {
    id: 'BF-883455',
    date: '07 May 2026',
    time: '09:20 AM',
    payee: 'KUMARAN RESTAURANT',
    bankReference: 'REF: IBFT-883455',
    amount: 2750,
    customer: 'Kumaran Restaurant',
    invoiceReference: 'INV-2027',
    status: 'Needs Review',
    confidence: 60,
    openInvoices: [{ id: 'INV-2027', date: '2026-06-22', ageDays: 19, status: 'Open', total: 2750, paid: 0 }],
  },
  {
    id: 'BF-772701',
    date: '07 May 2026',
    time: '09:05 AM',
    payee: 'JOHN TAN',
    bankReference: 'REF: PAYNOW-772701',
    amount: 1200,
    customer: 'John Tan',
    invoiceReference: 'INV-2026 (Partial)',
    status: 'Partial Match',
    confidence: 70,
    openInvoices: [{ id: 'INV-2026', date: '2026-05-30', ageDays: 42, status: 'Partial', total: 1980, paid: 1200, reason: 'Short payment' }],
  },
  {
    id: 'BF-772588',
    date: '07 May 2026',
    time: '08:45 AM',
    payee: 'GLOBAL TRADING PTE LTD',
    bankReference: 'REF: PAYNOW-772588',
    amount: 5600,
    customer: 'Global Trading Ltd',
    invoiceReference: 'INV-2025, INV-2024 (Partial)',
    status: 'Needs Review',
    confidence: 55,
    openInvoices: [
      { id: 'INV-2025', date: '2026-04-02', ageDays: 94, status: 'Overdue', total: 3600, paid: 0, reason: 'Awaiting remittance' },
      { id: 'INV-2024', date: '2026-05-14', ageDays: 58, status: 'Partial', total: 2000, paid: 800 },
    ],
  },
]

export type ReconciliationStat = {
  id: string
  label: string
  value: number
  sublabel: string
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'accent'
  cta: string
}

export const reconciliationStats: ReconciliationStat[] = [
  { id: 'bank-transactions', label: 'Bank Transactions', value: 146, sublabel: 'Today', tone: 'accent', cta: 'View Details' },
  { id: 'auto-matched', label: 'Auto Matched', value: 121, sublabel: '82.9%', tone: 'success', cta: 'View Matched' },
  { id: 'needs-review', label: 'Needs Review', value: 18, sublabel: '12.3%', tone: 'warning', cta: 'Review Now' },
  { id: 'unmatched', label: 'Unmatched', value: 7, sublabel: '4.8%', tone: 'danger', cta: 'View Unmatched' },
]

export const totalReceivedAmount = 86240

export const todaysReconciliationBreakdown = [
  { id: 'received', label: 'Bank Transactions Received', value: 146, tone: 'neutral' as const },
  { id: 'auto', label: 'Automatically Matched', value: 121, tone: 'success' as const },
  { id: 'manual', label: 'Manual Matches Completed', value: 7, tone: 'accent' as const },
  { id: 'review', label: 'Needs Review', value: 18, tone: 'warning' as const },
  { id: 'reconciled', label: 'Reconciled', value: 87, tone: 'success' as const },
]

export const reconciliationProgress = 87

export type AttentionItem = {
  id: string
  label: string
  sublabel: string
  count: number
  amount: number
  cta: string
  tone: 'danger' | 'warning' | 'accent'
}

export const attentionItems: AttentionItem[] = [
  { id: 'unmatched-payments', label: 'Unmatched Payments', sublabel: 'Bank transactions not yet matched', count: 18, amount: 12640, cta: 'Review', tone: 'danger' },
  { id: 'partial-payments', label: 'Partial Payments', sublabel: 'Payments pending allocation', count: 12, amount: 8420, cta: 'Allocate', tone: 'warning' },
  { id: 'attention-cases', label: 'Attention Cases', sublabel: 'Invoices require adjustment', count: 6, amount: 5210, cta: 'Resolve', tone: 'warning' },
  { id: 'outstanding-90', label: 'Outstanding > 90 Days', sublabel: 'Requires follow up', count: 23, amount: 10000, cta: 'Follow Up', tone: 'danger' },
  { id: 'unmapped-payees', label: 'Unmapped Payees', sublabel: 'Payees not mapped to customers', count: 8, amount: 3760, cta: 'Map Now', tone: 'accent' },
]
