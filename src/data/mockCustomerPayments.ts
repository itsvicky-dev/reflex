export type CustomerType = 'Restaurant' | 'Retail'

export type CustomerInvoiceStatus = 'Open' | 'Partial' | 'Overdue'

export type CustomerInvoice = {
  id: string
  date: string
  ageDays: number
  status: CustomerInvoiceStatus
  total: number
  paid: number
  reason?: string
}

export type CustomerOutstanding = {
  id: string
  code: string
  name: string
  type: CustomerType
  invoices: CustomerInvoice[]
}

export const customers: CustomerOutstanding[] = [
  {
    id: 'chop-chop-grill',
    code: 'REST-04',
    name: 'The Chop Chop Grill',
    type: 'Restaurant',
    invoices: [
      { id: 'INV-24860', date: '2026-05-19', ageDays: 53, status: 'Partial', total: 2850, paid: 500, reason: 'Dispute pending' },
      { id: 'INV-25015', date: '2026-06-08', ageDays: 33, status: 'Open', total: 3100, paid: 0 },
      { id: 'INV-25260', date: '2026-06-30', ageDays: 11, status: 'Open', total: 2680, paid: 0 },
    ],
  },
  {
    id: 'golden-wok',
    code: 'REST-02',
    name: 'Golden Wok Pte Ltd',
    type: 'Restaurant',
    invoices: [
      { id: 'INV-25188', date: '2026-06-22', ageDays: 19, status: 'Partial', total: 2340, paid: 1500 },
      { id: 'INV-25301', date: '2026-07-03', ageDays: 8, status: 'Open', total: 1780, paid: 0 },
      { id: 'INV-25402', date: '2026-07-09', ageDays: 2, status: 'Open', total: 2100, paid: 0 },
    ],
  },
  {
    id: 'tandoor-co',
    code: 'REST-06',
    name: 'Tandoor & Co.',
    type: 'Restaurant',
    invoices: [
      { id: 'INV-25120', date: '2026-06-28', ageDays: 25, status: 'Open', total: 1780, paid: 0 },
      { id: 'INV-24990', date: '2026-06-08', ageDays: 45, status: 'Open', total: 1520, paid: 0 },
    ],
  },
  {
    id: 'curry-leaf-bistro',
    code: 'REST-01',
    name: 'Curry Leaf Bistro',
    type: 'Restaurant',
    invoices: [
      { id: 'INV-25360', date: '2026-07-05', ageDays: 8, status: 'Open', total: 1240, paid: 0 },
      { id: 'INV-25190', date: '2026-07-01', ageDays: 14, status: 'Open', total: 1080, paid: 0 },
    ],
  },
  {
    id: 'little-saigon-cafe',
    code: 'REST-05',
    name: 'Little Saigon Café',
    type: 'Restaurant',
    invoices: [
      { id: 'INV-25340', date: '2026-07-04', ageDays: 9, status: 'Open', total: 900, paid: 0 },
      { id: 'INV-25280', date: '2026-06-30', ageDays: 11, status: 'Open', total: 630, paid: 0 },
    ],
  },
  {
    id: 'nasi-kandar-house',
    code: 'REST-03',
    name: 'Nasi Kandar House',
    type: 'Restaurant',
    invoices: [{ id: 'INV-25388', date: '2026-07-05', ageDays: 6, status: 'Open', total: 1380, paid: 0 }],
  },
  {
    id: 'sunrise-mart',
    code: 'RET-01',
    name: 'Sunrise Mart',
    type: 'Retail',
    invoices: [{ id: 'INV-25411', date: '2026-07-08', ageDays: 3, status: 'Open', total: 420, paid: 0 }],
  },
  {
    id: 'blue-ocean-trading',
    code: 'RET-02',
    name: 'Blue Ocean Trading',
    type: 'Retail',
    invoices: [{ id: 'INV-25405', date: '2026-07-07', ageDays: 4, status: 'Open', total: 380, paid: 0 }],
  },
  {
    id: 'kims-grocery',
    code: 'RET-03',
    name: "Kim's Grocery",
    type: 'Retail',
    invoices: [{ id: 'INV-25396', date: '2026-07-06', ageDays: 5, status: 'Open', total: 310, paid: 0 }],
  },
  {
    id: 'silver-spoon-supplies',
    code: 'RET-04',
    name: 'Silver Spoon Supplies',
    type: 'Retail',
    invoices: [{ id: 'INV-25379', date: '2026-07-04', ageDays: 7, status: 'Open', total: 275, paid: 0 }],
  },
  {
    id: 'evergreen-distributors',
    code: 'RET-05',
    name: 'Evergreen Distributors',
    type: 'Retail',
    invoices: [{ id: 'INV-25366', date: '2026-07-02', ageDays: 9, status: 'Open', total: 260, paid: 0 }],
  },
  {
    id: 'union-hardware',
    code: 'RET-06',
    name: 'Union Hardware',
    type: 'Retail',
    invoices: [{ id: 'INV-25350', date: '2026-06-29', ageDays: 12, status: 'Open', total: 256, paid: 0 }],
  },
]

export const outstandingAsOf = '11 Jul 2026'
