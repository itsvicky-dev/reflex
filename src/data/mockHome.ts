export type AgeingBucket = {
  id: string
  label: string
  amount: number
  tone: 'success' | 'warning' | 'orange' | 'danger'
}

export const outstandingAgeing: AgeingBucket[] = [
  { id: '0-30', label: '0–30 Days', amount: 68400, tone: 'success' },
  { id: '31-60', label: '31–60 Days', amount: 32200, tone: 'warning' },
  { id: '61-90', label: '61–90 Days', amount: 17850, tone: 'orange' },
  { id: '90-plus', label: '90+ Days', amount: 10000, tone: 'danger' },
]

export const totalOutstanding = 128450

export const outstandingChangePct = -8.4

export const reconciliationRate = 92.4

export const outstandingTrend = [32, 24, 28, 18, 22, 30, 44]

export type CustomerTypeBreakdown = {
  id: string
  label: string
  outstanding: number
  openInvoices: number
}

export const outstandingByCustomerType: CustomerTypeBreakdown[] = [
  { id: 'retail', label: 'Retail', outstanding: 42300, openInvoices: 124 },
  { id: 'wholesale', label: 'Wholesale', outstanding: 51850, openInvoices: 96 },
  { id: 'restaurant', label: 'Restaurant', outstanding: 34300, openInvoices: 122 },
]

export const totalOpenInvoices = 342

export type PaymentMethod = 'PayNow' | 'Transfer' | 'COD'

export type RecentActivityStatus = 'Matched' | 'Partial' | 'Unmatched' | 'Cleared'

export type RecentActivityItem = {
  id: string
  customer: string
  invoiceRef?: string
  amount: number
  method: PaymentMethod
  status: RecentActivityStatus
  updatedAt: string
}

export const recentReconciliationActivity: RecentActivityItem[] = [
  { id: 'act-1', customer: 'ABC Foods', invoiceRef: 'INV-2034', amount: 4200, method: 'PayNow', status: 'Matched', updatedAt: '10:42 AM' },
  { id: 'act-2', customer: 'John Tan', invoiceRef: 'INV-2031', amount: 1850, method: 'PayNow', status: 'Partial', updatedAt: '10:28 AM' },
  { id: 'act-3', customer: 'XYZ Mart', amount: 3400, method: 'Transfer', status: 'Unmatched', updatedAt: '10:15 AM' },
  // { id: 'act-4', customer: 'Fresh Kitchen', invoiceRef: 'INV-2028', amount: 2100, method: 'COD', status: 'Cleared', updatedAt: '09:58 AM' },
  // { id: 'act-5', customer: 'Green Leaf Cafe', invoiceRef: 'INV-2025', amount: 1300, method: 'PayNow', status: 'Matched', updatedAt: '09:41 AM' },
]
