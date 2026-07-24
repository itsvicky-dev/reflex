export type InvoiceStatus = 'Open' | 'Partial'

export type AllocationInvoice = {
  id: string
  ageDays: number
  status: InvoiceStatus
  issuedDate: string
  total: number
  paidSoFar: number
}

export type PayerPriority = 'High' | 'Medium' | 'Low'

export type Payer = {
  name: string
  role: string
  priority: PayerPriority
}

export type CustomerProfile = {
  name: string
  type: string
  creditLimitLabel: string
  invoices: AllocationInvoice[]
  payers: Payer[]
}

export type IncomingPayment = {
  id: string
  payerName: string
  bankRef: string
  method: string
  bank: 'DBS' | 'OCBC'
  date: string
  amount: number
  customer: CustomerProfile
}

const goldenWok: CustomerProfile = {
  name: 'Golden Wok Pte Ltd',
  type: 'Restaurant',
  creditLimitLabel: 'SGD 12,000.00',
  invoices: [
    { id: 'INV-25188', ageDays: 19, status: 'Partial', issuedDate: '2026-06-22', total: 2340, paidSoFar: 1500 },
    { id: 'INV-25301', ageDays: 8, status: 'Open', issuedDate: '2026-07-03', total: 1780, paidSoFar: 0 },
    { id: 'INV-25402', ageDays: 2, status: 'Open', issuedDate: '2026-07-09', total: 2100, paidSoFar: 0 },
  ],
  payers: [
    { name: 'K. RAMESH', role: 'Owner — Golden Wok', priority: 'High' },
    { name: 'GOLDEN WOK PTE LTD', role: 'Company account', priority: 'High' },
  ],
}

const chopChopGrill: CustomerProfile = {
  name: 'The Chop Chop Grill',
  type: 'Restaurant',
  creditLimitLabel: 'SGD 9,000.00',
  invoices: [
    { id: 'INV-24860', ageDays: 53, status: 'Partial', issuedDate: '2026-05-19', total: 2850, paidSoFar: 500 },
    { id: 'INV-25015', ageDays: 33, status: 'Open', issuedDate: '2026-06-08', total: 3100, paidSoFar: 0 },
    { id: 'INV-25260', ageDays: 11, status: 'Open', issuedDate: '2026-06-30', total: 2680, paidSoFar: 0 },
  ],
  payers: [
    { name: 'CHOP CHOP HOLDINGS', role: 'Holding company', priority: 'High' },
    { name: 'M. SUBRAMANIAM', role: 'Manager — The Chop Chop Grill', priority: 'Medium' },
  ],
}

const curryLeafBistro: CustomerProfile = {
  name: 'Curry Leaf Bistro',
  type: 'Restaurant',
  creditLimitLabel: 'SGD 6,000.00',
  invoices: [
    { id: 'INV-25190', ageDays: 14, status: 'Open', issuedDate: '2026-07-01', total: 1080, paidSoFar: 0 },
    { id: 'INV-25360', ageDays: 8, status: 'Open', issuedDate: '2026-07-05', total: 1240, paidSoFar: 0 },
  ],
  payers: [{ name: 'ANITA S/O RAJ', role: 'Owner — Curry Leaf Bistro', priority: 'High' }],
}

const mrsChen: CustomerProfile = {
  name: 'Mrs. Chen (Blk 214)',
  type: 'Household',
  creditLimitLabel: 'SGD 500.00',
  invoices: [{ id: 'INV-25410', ageDays: 3, status: 'Open', issuedDate: '2026-07-08', total: 92, paidSoFar: 0 }],
  payers: [{ name: 'CHEN L.', role: 'Resident — Blk 214', priority: 'Medium' }],
}

const nasiKandarHouse: CustomerProfile = {
  name: 'Nasi Kandar House',
  type: 'Restaurant',
  creditLimitLabel: 'SGD 4,000.00',
  invoices: [{ id: 'INV-25388', ageDays: 6, status: 'Open', issuedDate: '2026-07-05', total: 1380, paidSoFar: 0 }],
  payers: [{ name: 'NASI KANDAR SG', role: 'Supplier account — Nasi Kandar House', priority: 'High' }],
}

export const incomingPayments: IncomingPayment[] = [
  { id: 'BT-7841', payerName: 'K. RAMESH', bankRef: 'PAYNOW/GWOK-BAL', method: 'PayNow', bank: 'DBS', date: '2026-07-11', amount: 840, customer: goldenWok },
  { id: 'BT-7842', payerName: 'CHOP CHOP HOLDINGS', bankRef: 'FAST/CC-24860', method: 'FAST', bank: 'DBS', date: '2026-07-11', amount: 2350, customer: chopChopGrill },
  { id: 'BT-7843', payerName: 'ANITA S/O RAJ', bankRef: 'PAYNOW/INV25105', method: 'PayNow', bank: 'DBS', date: '2026-07-11', amount: 1240, customer: curryLeafBistro },
  { id: 'BT-7844', payerName: 'M. SUBRAMANIAM', bankRef: 'PAYNOW/PARTIAL', method: 'PayNow', bank: 'DBS', date: '2026-07-11', amount: 500, customer: chopChopGrill },
  { id: 'BT-7845', payerName: 'CHEN L.', bankRef: 'PAYNOW/', method: 'PayNow', bank: 'OCBC', date: '2026-07-11', amount: 92, customer: mrsChen },
  { id: 'BT-7846', payerName: 'NASI KANDAR SG', bankRef: 'FAST/NK-JUN', method: 'FAST', bank: 'OCBC', date: '2026-07-11', amount: 1380, customer: nasiKandarHouse },
  { id: 'BT-7847', payerName: 'TANDOOR & CO', bankRef: 'PAYNOW/TC-1180', method: 'PayNow', bank: 'DBS', date: '2026-07-11', amount: 1780, customer: goldenWok },
  { id: 'BT-7848', payerName: 'LITTLE SAIGON CAFE', bankRef: 'FAST/LSC-930', method: 'FAST', bank: 'OCBC', date: '2026-07-10', amount: 900, customer: curryLeafBistro },
  { id: 'BT-7849', payerName: 'GREEN LEAF CAFE', bankRef: 'PAYNOW/GLC-410', method: 'PayNow', bank: 'DBS', date: '2026-07-10', amount: 2100, customer: goldenWok },
  { id: 'BT-7850', payerName: 'FRESH KITCHEN SG', bankRef: 'FAST/FK-772', method: 'FAST', bank: 'DBS', date: '2026-07-10', amount: 630, customer: curryLeafBistro },
]

export const unmatchedCount = 20
export const statementsPulledAt = '08:14 AM'
