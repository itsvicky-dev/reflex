/**
 * What each screen is, in the words the AI should understand it, plus prompts that make sense there.
 * The suggestions are what the client sees first, so each one maps to something the data can answer well.
 */

export type AiPageInfo = {
  id: string
  title: string
  /** Sent to the model so it knows exactly what the user is looking at. */
  description: string
  suggestions: { label: string; category: string }[]
}

const home: AiPageInfo = {
  id: 'home',
  title: 'Home',
  description:
    'Home dashboard: KPI cards (total outstanding, reconciled amount, unmatched payments, invoices pending allocation), the reconciliation chart (switchable Today / This Week / This Month / This Year), Needs Your Attention list, Outstanding by Ageing, Outstanding by Customer Type, Recent Reconciliation Activity, 7-Day Cash Flow Forecast, Revenue (current vs previous period) and the Customer Risk Matrix.',
  suggestions: [
    { label: 'Give me an executive summary of our receivables position', category: 'Summary' },
    { label: 'Why is revenue down versus the previous period?', category: 'Revenue' },
    { label: 'Chart outstanding by ageing bucket and flag the risk', category: 'Collections' },
    { label: 'Which customers need collections escalation this week?', category: 'Risk' },
    { label: 'How is AI reconciliation performing this week?', category: 'Reconciliation' },
  ],
}

const finPilot: AiPageInfo = {
  id: 'finpilot',
  title: 'FinPilot',
  description:
    'FinPilot: a filter bar (Daily, Last 7 Days); eight selectable KPI tiles (Today\'s Collections, Expected by End of Day, Net Cash Inflow 7d, Average Daily Inflow, Upcoming Large Inflows, Revenue, Overdue Collections, Forecast Accuracy) with a trend line for the selected tile; and the Cash Flow Visualization (Sankey: bank receipts -> reconciliation outcomes). The 7-day cash flow forecast, revenue chart and customer risk matrix live on the Home screen.',
  suggestions: [
    { label: 'Summarise the eight FinPilot KPIs and what needs attention', category: 'Summary' },
    { label: 'Forecast cash inflow for the next 7 days and call out the peak', category: 'Cash flow' },
    { label: 'Explain the revenue decline and its root causes', category: 'Revenue' },
    { label: 'Show how bank receipts flow into reconciliation outcomes', category: 'Reconciliation' },
    { label: 'Which customers are in the critical risk zone?', category: 'Risk' },
  ],
}

const forecastBoard: AiPageInfo = {
  id: 'forecast-board',
  title: 'Forecast Board',
  description:
    'Forecast Board: receivables due next week shown as draggable cards (customer, invoice, due date, value, payment probability) that the user places into Committed / Probable / Possible / Doubtful buckets; an "AI Suggestion" switch auto-places them; a Chart View shows value per bucket.',
  suggestions: [
    { label: 'Summarise next week’s receivables by payment probability', category: 'Forecast' },
    { label: 'How would the AI place these receivables?', category: 'AI suggestion' },
    { label: 'Which invoices are most at risk of slipping?', category: 'Risk' },
    { label: 'What is committed vs doubtful right now?', category: 'Board' },
    { label: 'What did the AI agents do this morning?', category: 'Activity' },
  ],
}

const hubOverview: AiPageInfo = {
  id: 'hub-overview',
  title: 'Reconciliation Hub · Overview',
  description:
    "Reconciliation Hub Overview: today's bank-feed KPIs (transactions, auto matched, needs review, unmatched), reconciliation progress ring, today's breakdown, the reconciliation chart by period, attention items, and the bank transactions table with tabs (All / Auto Matched / Needs Review / Unmatched) showing payee, mapped customer, invoice reference, status and AI matching confidence.",
  suggestions: [
    { label: 'Which transactions need review and why?', category: 'Review' },
    { label: 'Break down today’s bank feed by match status', category: 'Status' },
    { label: 'List unmatched payments and suggest how to resolve each', category: 'Unmatched' },
    { label: 'Where is AI confidence lowest?', category: 'Confidence' },
    { label: 'How does AI compare to manual reconciliation this week?', category: 'Performance' },
  ],
}

const workbench: AiPageInfo = {
  id: 'workbench',
  title: 'Reconciliation Hub · Workbench',
  description:
    'Reconciliation Workbench: a list of incoming bank payments (from DBS and OCBC statements) on the left; the selected payment on the right with the customer\'s open invoices, an AI or manual allocation (oldest invoice first), and the customer\'s known payers with matching priority. Filters cover match types and AI confidence.',
  suggestions: [
    { label: 'Explain the suggested allocation for the selected payment', category: 'Selected' },
    { label: 'Which payments look risky to auto-match?', category: 'Risk' },
    { label: 'Show FIFO allocation for every payment as a table', category: 'Allocation' },
    { label: 'Flag payer or reference mismatches', category: 'Anomalies' },
    { label: 'Summarise today’s incoming payments by bank', category: 'Summary' },
  ],
}

const customers: AiPageInfo = {
  id: 'customers',
  title: 'Customer Intelligence · Customers',
  description:
    'Customers directory: 12 customer cards (restaurant and retail accounts) with health score and tier (Healthy / Watch / Critical), overdue and upcoming amounts; searchable and filterable by type and health tier. Clicking a card opens the customer detail view.',
  suggestions: [
    { label: 'Rank customers by health score and show who is critical', category: 'Health' },
    { label: 'Compare restaurants vs retail on overdue exposure', category: 'Segments' },
    { label: 'Which account manager has the riskiest portfolio?', category: 'Portfolio' },
    { label: 'Who has the highest overdue balance and what should we do?', category: 'Collections' },
    { label: 'Show customers with no upcoming payments due', category: 'Cash flow' },
  ],
}

const payments: AiPageInfo = {
  id: 'payments',
  title: 'Customer Intelligence · Payments',
  description:
    'Customer Outstanding: ageing bucket cards (0-30, 31-60, 61-90, 90+) and a table of customers with per-bucket outstanding, expandable to open invoices (status, age, total, paid, outstanding, reason). Filters: type, ageing bucket, sort. Chase actions per customer.',
  suggestions: [
    { label: 'Chart the ageing profile across all customers', category: 'Ageing' },
    { label: 'Who should we chase first, and why?', category: 'Priority' },
    { label: 'Which invoices are partially paid or disputed?', category: 'Invoices' },
    { label: 'Draft a payment reminder for the oldest overdue invoice', category: 'Draft' },
    { label: 'Compare restaurant and retail outstanding', category: 'Segments' },
  ],
}

const customerDetail: AiPageInfo = {
  id: 'customer-detail',
  title: 'Customer Intelligence · Customer 360',
  description:
    'Customer 360 detail view: header (health score, outstanding, overdue, upcoming) for the selected customer, then Summary, Recommended Actions, AI Executive Summary, Financial Health, Risk Assessment, Business Relationship, Payment Behaviour (heat map), Revenue Trend, Payment History and Disputes panels. The header numbers belong to the selected customer; the detailed panels below show the sample profile of Kaveri Precision Pvt. Ltd.',
  suggestions: [
    { label: 'Summarise this customer’s payment risk', category: 'Risk' },
    { label: 'What should we do about their overdue balance?', category: 'Action' },
    { label: 'Draft a polite payment reminder to this customer', category: 'Draft' },
    { label: 'How does this customer compare to the portfolio?', category: 'Benchmark' },
    { label: 'Show their invoices and ageing', category: 'Invoices' },
  ],
}

const overview: AiPageInfo = {
  id: 'overview',
  title: 'Overview',
  description:
    'Reconciliation Overview: recent transactions, open exceptions, reconciliation runs, report status and the weekly matched/unmatched trend (USD).',
  suggestions: [
    { label: 'Summarise reconciliation health and open exceptions', category: 'Summary' },
    { label: 'Chart the weekly matched vs unmatched trend', category: 'Trend' },
    { label: 'Which exceptions are highest priority?', category: 'Exceptions' },
    { label: 'Why did a reconciliation run fail?', category: 'Runs' },
    { label: 'Give me an executive summary of receivables', category: 'Receivables' },
  ],
}

const workspace: AiPageInfo = {
  id: 'workspace',
  title: 'Workspace',
  description: 'No specific dashboard is open; answer from the whole workspace.',
  suggestions: [
    { label: 'Give me an executive summary of our receivables position', category: 'Summary' },
    { label: 'Which customers are at risk of non-payment right now?', category: 'Risk' },
    { label: 'Forecast cash inflow for the next 7 days', category: 'Cash flow' },
    { label: 'Show invoices requiring immediate action', category: 'Invoices' },
    { label: 'Investigate reconciliation exceptions', category: 'Reconciliation' },
    { label: 'Compare restaurants and retail performance', category: 'Performance' },
  ],
}

export function resolveAiPage(pathname: string): AiPageInfo {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/home') return home
  if (path === '/finance-navigator') return finPilot
  if (path === '/control-tower') return forecastBoard
  if (path === '/reconciliation-hub/overview') return hubOverview
  if (path === '/reconciliation-hub/workbench') return workbench
  if (path === '/customer-intelligence/customers') return customers
  if (path === '/customer-intelligence/payments') return payments
  if (path.startsWith('/customer-intelligence/overview')) return customerDetail
  if (['/overview', '/transactions', '/exceptions', '/reports', '/reconciliation'].includes(path)) return overview
  return workspace
}

/** The customer id in /customer-intelligence/overview/:id, when present. */
export function customerIdFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/customer-intelligence\/overview\/([^/]+)/)
  return match ? decodeURIComponent(match[1]) : null
}
