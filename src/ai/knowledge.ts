/**
 * Builds the "workspace data" the model is grounded in, straight from the same data modules the screens render.
 *
 * Design notes
 *  - One labelled section per screen, so the model can attribute every number to the widget it came from.
 *  - Compact pipe-delimited tables instead of verbose JSON: ~40% fewer tokens, and models read them well.
 *  - Totals, shares, ranks, FIFO allocations and anomaly flags are PRE-COMPUTED here, so the model reads
 *    numbers instead of doing arithmetic (LLMs are least reliable at exactly that).
 *  - When the mock modules are replaced by real APIs, only the imports in this file need to change.
 */

import {
  aiExplanation,
  cashFlowForecast,
  cashFlowVisualization,
  collectionsSummary,
  customerRiskMatrix,
  finPilotStats,
  outstandingDelayTrend,
  revenueTrend,
} from '../data/mockFinPilot'
import {
  controlTowerLogs,
  dueNextWeekReceivables,
  overdueReceivables,
  probabilityLabel,
  statusBucketLabel,
  statusBucketOrder,
  suggestStatusBucket,
} from '../data/mockControlTower'
import { customerDirectory, customerHealthTier, type CustomerProfile } from '../data/mockCustomerDirectory'
import * as customer360 from '../data/mockCustomerOverview'
import { customers as outstandingCustomers, outstandingAsOf } from '../data/mockCustomerPayments'
import * as home from '../data/mockHome'
import { transactions, exceptions, reconciliationRuns, reports, weeklyTrend } from '../data/mockReconciliation'
import {
  attentionItems,
  bankFeedItems,
  reconciliationBreakdownByFilter,
  reconciliationProgress,
  reconciliationStats,
  todaysReconciliationBreakdown,
  todaysReconciliationGeneratedAt,
  totalReceivedAmount,
  type ReconciliationPeriodFilter,
} from '../data/mockReconciliationHub'
import { incomingPayments, statementsPulledAt, unmatchedCount } from '../data/mockWorkbench'
import { fifoAllocation, outstandingOf } from '../lib/allocation'

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

type Cell = string | number | boolean | null | undefined
type Col<T> = readonly [header: string, get: (row: T) => Cell]

const num = (value: number, digits = 2) => Number(value.toFixed(digits))
const sum = (values: number[]) => values.reduce((a, b) => a + b, 0)
const pct = (part: number, whole: number, digits = 1) => (whole === 0 ? 0 : num((part / whole) * 100, digits))

function cell(value: Cell) {
  return value === null || value === undefined || value === '' ? '-' : String(value)
}

function table<T>(rows: readonly T[], cols: readonly Col<T>[]): string {
  const header = cols.map(([name]) => name).join(' | ')
  const body = rows.map((row) => cols.map(([, get]) => cell(get(row))).join(' | '))
  return [header, ...body].join('\n')
}

function section(title: string, ...parts: string[]) {
  return [`${'='.repeat(3)} ${title} ${'='.repeat(3)}`, ...parts].join('\n')
}

const widget = (name: string, body: string) => `--- Widget: ${name}\n${body}`

function bucketOfAge(days: number) {
  if (days <= 30) return '0-30'
  if (days <= 60) return '31-60'
  if (days <= 90) return '61-90'
  return '90+'
}

/* ------------------------------------------------------------------ */
/* Home                                                                */
/* ------------------------------------------------------------------ */

function buildHome(): string {
  const unmatched = attentionItems.find((item) => item.id === 'unmatched-payments')!
  const partial = attentionItems.find((item) => item.id === 'partial-payments')!

  const periodNames: Record<ReconciliationPeriodFilter, string> = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
  }

  const periods = (Object.keys(reconciliationBreakdownByFilter) as ReconciliationPeriodFilter[]).map((key) => {
    const { rangeLabel, points } = reconciliationBreakdownByFilter[key]
    const total = sum(points.map((p) => p.total))
    const ai = sum(points.map((p) => p.aiReconciled))
    const manual = sum(points.map((p) => p.manualReconciled))
    const review = sum(points.map((p) => p.needsReview))
    const amount = sum(points.map((p) => p.amount))
    return [
      `[${periodNames[key]}] range: ${rangeLabel} | total_transactions=${total} | amount_usd=${amount} | ai_reconciled=${ai} (${pct(ai, total)}%) | manual=${manual} (${pct(manual, total)}%) | needs_review=${review} (${pct(review, total)}%)`,
      table(points, [
        ['bucket', (p) => `${p.label} (${p.sublabel})`],
        ['transactions', (p) => p.total],
        ['amount_usd', (p) => p.amount],
        ['ai_reconciled', (p) => p.aiReconciled],
        ['manual', (p) => p.manualReconciled],
        ['needs_review', (p) => p.needsReview],
        ['ai_pct', (p) => pct(p.aiReconciled, p.total)],
      ]),
    ].join('\n')
  })

  const ageingTotal = sum(home.outstandingAgeing.map((b) => b.amount))

  return section(
    'SCREEN: Home (route /home)',
    'Currency: the KPI cards, ageing, customer-type, activity and reconciliation widgets are in USD ($). The 7-Day Cash Flow Forecast, Revenue and Customer Risk Matrix widgets on this screen are in INR (₹ Crore, "Cr"). The default reconciliation period shown is "This Week".',
    widget(
      'KPI cards',
      [
        `Total Outstanding: $${home.totalOutstanding} (down ${Math.abs(home.outstandingChangePct)}% vs last month; ${home.totalOpenInvoices} open invoices)`,
        `Reconciled Amount: $${totalReceivedAmount} (${home.reconciliationRate}% AI-reconciled)`,
        `Unmatched Payments: ${unmatched.count} items, $${unmatched.amount} requires review`,
        `Invoice card: ${partial.count} items, $${partial.amount} pending allocation`,
      ].join('\n'),
    ),
    widget(
      'Needs Your Attention',
      table(attentionItems, [
        ['item', (i) => i.label],
        ['description', (i) => i.sublabel],
        ['count', (i) => i.count],
        ['amount_usd', (i) => i.amount],
        ['action', (i) => i.cta],
      ]),
    ),
    widget(
      'Outstanding by Ageing (USD)',
      `total=${ageingTotal}\n` +
        table(home.outstandingAgeing, [
          ['bucket', (b) => b.label],
          ['amount_usd', (b) => b.amount],
          ['share_pct', (b) => pct(b.amount, ageingTotal)],
        ]) +
        `\nOverdue beyond 30 days = $${sum(home.outstandingAgeing.slice(1).map((b) => b.amount))} (${pct(sum(home.outstandingAgeing.slice(1).map((b) => b.amount)), ageingTotal)}%)`,
    ),
    widget(
      'Outstanding by Customer Type (USD)',
      table(home.outstandingByCustomerType, [
        ['type', (r) => r.label],
        ['outstanding_usd', (r) => r.outstanding],
        ['open_invoices', (r) => r.openInvoices],
        ['share_pct', (r) => pct(r.outstanding, home.totalOutstanding)],
        ['avg_per_invoice_usd', (r) => num(r.outstanding / r.openInvoices)],
      ]) + `\ntotal_outstanding=$${home.totalOutstanding} | total_open_invoices=${home.totalOpenInvoices}`,
    ),
    widget(
      'Recent Reconciliation Activity (today; most recent first)',
      table(home.recentReconciliationActivity, [
        ['customer', (r) => r.customer],
        ['invoice', (r) => r.invoiceRef],
        ['amount_usd', (r) => r.amount],
        ['method', (r) => r.method],
        ['status', (r) => r.status],
        ['time', (r) => r.updatedAt],
      ]),
    ),
    widget('Reconciliation chart (period selector: Today / This Week / This Month / This Year)', periods.join('\n\n')),
    widget(
      '7-Day Cash Flow Forecast (₹ Cr)',
      [
        `Headline net inflow (7d): ${cashFlowForecast.netInflow7d} (${cashFlowForecast.vsPrevious7dPct}% above the previous 7 days); average daily inflow ${cashFlowForecast.avgDailyInflow}; upcoming large inflows ${cashFlowForecast.upcomingLargeInflows}.`,
        'The daily points below are chart display values (shape only). Use the headline figures for totals and averages; do not re-sum the points.',
        table(cashFlowForecast.points, [
          ['date', (p) => `${p.date} (${p.day})`],
          ['inflow_cr', (p) => p.value],
          ['type', (p) => (p.forecast ? 'forecast' : 'actual')],
        ]),
        `Peak day on the chart: 18 May (Sun) at ₹2.48 Cr. AI insight: ${cashFlowForecast.insight.lead} ${cashFlowForecast.insight.links.join(' and ')}. ${cashFlowForecast.insight.detail}`,
      ].join('\n'),
    ),
    widget(
      'Revenue (₹ Cr, weekly; current period Apr 20 - May 18 vs previous period Mar 22 - Apr 19)',
      revenueBlock(),
    ),
    widget('Customer Risk Matrix', riskBlock()),
  )
}

function revenueBlock(): string {
  const weeks = revenueTrend.weeks
  const current = num(sum(weeks.map((w) => w.current)))
  const previous = num(sum(weeks.map((w) => w.previous)))
  return [
    `current_period_total=₹${current} Cr | previous_period_total=₹${previous} Cr | change=${pct(current - previous, previous)}% (₹${num(current - previous)} Cr)`,
    table(weeks, [
      ['week', (w) => `${w.label} (${w.range})`],
      ['current_cr', (w) => w.current],
      ['previous_cr', (w) => w.previous],
      ['change_pct', (w) => pct(w.current - w.previous, w.previous)],
    ]),
    `Dashboard note: ${revenueTrend.insight}`,
  ].join('\n')
}

function riskBlock(): string {
  const matrix = customerRiskMatrix
  const bubbles = [...matrix.chart.bubbles].sort((a, b) => b.outstandingCr - a.outstandingCr)
  const totalCr = num(sum(bubbles.map((b) => b.outstandingCr)))
  return [
    `Headline: ${matrix.criticalAccountsCount} accounts in the critical zone (zone = payment delay >= ${matrix.chart.criticalZone.xMin} days AND outstanding >= ₹${matrix.chart.criticalZone.yMin} Cr); ${matrix.totalAtRiskCr} at risk of non-payment. Top at-risk account: ${matrix.topAccount.name}, ${matrix.topAccount.outstanding}, ${matrix.topAccount.delayDays} days past due.`,
    `Portfolio shown on the matrix: ${bubbles.length} accounts, total outstanding ₹${totalCr} Cr.`,
    table(bubbles, [
      ['customer', (b) => b.name],
      ['outstanding_cr', (b) => b.outstandingCr],
      ['delay_days', (b) => b.delayDays],
      ['risk_level', (b) => b.risk],
      ['revenue_contribution_index', (b) => b.revenueContribution],
      ['share_of_outstanding_pct', (b) => pct(b.outstandingCr, totalCr)],
    ]),
    `AI insight: ${matrix.insight.lead} ${matrix.insight.links.join(' and ')}. ${matrix.insight.detail}`,
  ].join('\n')
}

/* ------------------------------------------------------------------ */
/* FinPilot                                                            */
/* ------------------------------------------------------------------ */

function buildFinPilot(): string {
  const trend = outstandingDelayTrend.points
  const first = trend[0]
  const last = trend[trend.length - 1]
  const flows = cashFlowVisualization
  const flowTotal = num(sum(flows.sources.map((s) => s.valueCr)))

  return section(
    'SCREEN: FinPilot (route /finance-navigator)',
    'Currency: INR (₹), in Crore ("Cr") and Lakh ("L"/"Lakhs") exactly as displayed. Dates: the KPI tiles and their trend run Jul 15 - Jul 22 (filter bar: Daily, Last 7 Days); the reconciliation flow uses May data (period Apr 20 - May 18).',
    'What is drawn on this screen: the eight KPI tiles (click one to see its trend line) and the "Cash Flow Visualization" (bank receipts -> reconciliation outcome). The 7-day cash flow forecast chart, revenue chart and customer risk matrix are drawn on the Home screen (see the Home section); the collections insight, outstanding-vs-delay trend and revenue root-cause analysis below are FinPilot analysis available to the assistant.',
    widget(
      'KPI tiles',
      table(finPilotStats, [
        ['tile', (s) => s.label],
        ['value', (s) => s.value],
        ['detail', (s) => s.sublabel],
        ['direction', (s) => s.tone],
      ]),
    ),
    widget(
      'KPI tile trend lines (Jul 15 - Jul 22, plotted on a 0-100 chart scale, NOT in currency; the last point is projected)',
      table(finPilotStats, [
        ['tile', (s) => s.label],
        ['trend_0_100', (s) => s.trend.map((p) => p.value).join(', ')],
      ]),
    ),
    widget(
      "Today's Collections card",
      [
        `Collected so far: ${collectionsSummary.collectedSoFar} (${collectionsSummary.percentOfExpected}% of the ${collectionsSummary.expectedEndOfDay} expected by end of day; expected is up ${collectionsSummary.vsYesterdayPct}% vs yesterday).`,
        `AI insight (${collectionsSummary.insight.confidence}% confidence): ${collectionsSummary.insight.lead} ${collectionsSummary.insight.highlight} ${collectionsSummary.insight.tail} ${collectionsSummary.insight.amount} ${collectionsSummary.insight.suffix} ${collectionsSummary.insight.detail}`,
      ].join('\n'),
    ),
    widget(
      'Outstanding Amount vs Payment Delay trend (8 weeks)',
      [
        table(trend, [
          ['week', (p) => p.label],
          ['outstanding_cr', (p) => p.outstandingCr],
          ['avg_payment_delay_days', (p) => p.delayDays],
        ]),
        `Wk 1 to Wk 8: outstanding ${first.outstandingCr} -> ${last.outstandingCr} Cr (+${pct(last.outstandingCr - first.outstandingCr, first.outstandingCr, 0)}%); payment delay ${first.delayDays} -> ${last.delayDays} days (+${pct(last.delayDays - first.delayDays, first.delayDays, 0)}%).`,
        `Dashboard insight: ${outstandingDelayTrend.insight.lead} ${outstandingDelayTrend.insight.highlight}, ${outstandingDelayTrend.insight.tail}`,
      ].join('\n'),
    ),
    widget(
      'Cash flow reconciliation (Sankey: bank receipts -> reconciliation outcome, ₹ Cr)',
      [
        `Total receipts distributed: ₹${flowTotal} Cr. ${flows.subtitle}`,
        'Sources (banks):',
        table(flows.sources, [
          ['bank', (s) => s.label],
          ['receipts_cr', (s) => s.valueCr],
          ['share_pct', (s) => pct(s.valueCr, flowTotal)],
        ]),
        'Outcomes:',
        table(flows.destinations, [
          ['outcome', (d) => d.label],
          ['value_cr', (d) => d.valueCr],
          ['share_pct', (d) => pct(d.valueCr, flowTotal)],
        ]),
        'Flows (bank -> outcome):',
        table(flows.links, [
          ['from', (l) => flows.sources.find((s) => s.id === l.source)?.label],
          ['to', (l) => flows.destinations.find((d) => d.id === l.target)?.label],
          ['value_cr', (l) => l.valueCr],
        ]),
      ].join('\n'),
    ),
    widget(
      `AI explanation - ${aiExplanation.subtitle} (current period revenue ₹10.76 Cr vs ₹13.24 Cr previous, -18.7%; weekly detail is in the Home section)`,
      [
        table(aiExplanation.causes, [
          ['root_cause', (c) => c.title],
          ['impact', (c) => c.delta],
          ['detail', (c) => c.description],
        ]),
        `AI recommendation: ${aiExplanation.recommendation}`,
      ].join('\n'),
    ),
  )
}

/* ------------------------------------------------------------------ */
/* Forecast Board                                                      */
/* ------------------------------------------------------------------ */

function buildForecastBoard(): string {
  const rows = dueNextWeekReceivables
  const totalDue = num(sum(rows.map((r) => r.value)))

  const byTier = (['most-likely', 'likely', 'not-expected'] as const).map((tier) => {
    const subset = rows.filter((r) => r.probability === tier)
    return { tier, count: subset.length, value: num(sum(subset.map((r) => r.value))) }
  })

  const byAiBucket = statusBucketOrder.map((bucket) => {
    const subset = rows.filter((r) => suggestStatusBucket(r) === bucket)
    return { bucket, count: subset.length, value: num(sum(subset.map((r) => r.value))), names: subset.map((r) => r.customer).join(', ') }
  })

  const overdueTotal = num(sum(overdueReceivables.map((r) => r.value)))

  return section(
    'SCREEN: Forecast Board (route /control-tower)',
    'Values are shown on the board with a "$" prefix (e.g. $0.62) and no stated magnitude: quote them exactly as "$0.62" and never assume thousands, lakhs or crores. Receivable cards are dragged into four buckets: Committed, Probable, Possible, Doubtful. The "AI Suggestion" switch auto-places cards using the rule below.',
    'AI placement rule: Most Likely -> Committed. Likely -> Probable if value >= 0.50, else Possible. Not Expected -> Possible if value >= 0.30, else Doubtful.',
    widget(
      'Due Next Week (receivable cards)',
      `total_value=$${totalDue} across ${rows.length} receivables\n` +
        table(rows, [
          ['id', (r) => r.id],
          ['customer', (r) => r.customer],
          ['invoice', (r) => r.invoiceRef],
          ['due', (r) => `${r.date} (${r.day})`],
          ['days_window', (r) => r.bucket],
          ['value', (r) => r.value],
          ['probability', (r) => probabilityLabel[r.probability]],
          ['ai_suggested_bucket', (r) => statusBucketLabel[suggestStatusBucket(r)]],
        ]),
    ),
    widget(
      'Totals by payment probability',
      table(byTier, [
        ['probability', (t) => probabilityLabel[t.tier]],
        ['receivables', (t) => t.count],
        ['value', (t) => t.value],
        ['share_pct', (t) => pct(t.value, totalDue)],
      ]),
    ),
    widget(
      'Totals by AI-suggested bucket (what the board shows when AI Suggestion is ON)',
      table(byAiBucket, [
        ['bucket', (b) => statusBucketLabel[b.bucket]],
        ['receivables', (b) => b.count],
        ['value', (b) => b.value],
        ['share_pct', (b) => pct(b.value, totalDue)],
        ['customers', (b) => b.names],
      ]),
    ),
    widget(
      'Overdue receivables tracked by the system (not drawn on the board)',
      `total_value=$${overdueTotal} across ${overdueReceivables.length} receivables\n` +
        table(overdueReceivables, [
          ['customer', (r) => r.customer],
          ['invoice', (r) => r.invoiceRef],
          ['age', (r) => r.bucket],
          ['was_due', (r) => `${r.date} (${r.day})`],
          ['value', (r) => r.value],
          ['probability', (r) => probabilityLabel[r.probability]],
        ]),
    ),
    widget(
      'AI activity log (today, newest first)',
      table(controlTowerLogs, [
        ['time', (l) => l.time],
        ['type', (l) => l.category],
        ['event', (l) => l.title],
        ['detail', (l) => l.description],
      ]),
    ),
  )
}

/* ------------------------------------------------------------------ */
/* Reconciliation Hub - Overview                                       */
/* ------------------------------------------------------------------ */

function buildHubOverview(): string {
  return section(
    'SCREEN: Reconciliation Hub - Overview (route /reconciliation-hub/overview)',
    'Currency: USD ($). As-of date: 07 May 2026. Only 8 of the 146 bank transactions are available in detail below; never extrapolate beyond them, and say so when asked for the full list.',
    widget(
      "Today's bank feed KPIs",
      [
        table(reconciliationStats, [
          ['kpi', (s) => s.label],
          ['count', (s) => s.value],
          ['share_of_feed', (s) => s.sublabel],
        ]),
        `Total received amount: $${totalReceivedAmount}. Reconciliation progress: ${reconciliationProgress}%. Report generated at ${todaysReconciliationGeneratedAt}.`,
      ].join('\n'),
    ),
    widget(
      "Today's reconciliation breakdown",
      table(todaysReconciliationBreakdown, [
        ['measure', (b) => b.label],
        ['count', (b) => b.value],
      ]),
    ),
    widget(
      'Needs attention',
      table(attentionItems, [
        ['item', (i) => i.label],
        ['description', (i) => i.sublabel],
        ['count', (i) => i.count],
        ['amount_usd', (i) => i.amount],
        ['action', (i) => i.cta],
      ]),
    ),
    widget(
      'Bank transactions table (8 detailed records, newest first). Tabs: All, Auto Matched, Needs Review (includes Partial Match), Unmatched',
      bankFeedItems
        .map((item) => {
          const head = [
            item.id,
            `${item.date} ${item.time}`,
            `payee="${item.payee}"`,
            `ref="${item.bankReference}"`,
            `amount_usd=${item.amount}`,
            `mapped_customer=${item.customer ?? 'none'}`,
            `invoice_ref=${item.invoiceReference ?? 'none'}`,
            `status=${item.status}`,
            `ai_confidence=${item.confidence ?? 'n/a'}${item.confidence != null ? '%' : ''}`,
          ].join(' | ')
          const invoices = (item.openInvoices ?? [])
            .map(
              (inv) =>
                `    open invoice ${inv.id}: ${inv.status}, ${inv.ageDays}d old (${bucketOfAge(inv.ageDays)}), total ${inv.total}, paid ${inv.paid}, outstanding ${num(inv.total - inv.paid)}${inv.reason ? `, reason: ${inv.reason}` : ''}`,
            )
            .join('\n')
          return invoices ? `${head}\n${invoices}` : head
        })
        .join('\n'),
    ),
    widget(
      'Reconciliation by period (same data as the Home chart)',
      (Object.keys(reconciliationBreakdownByFilter) as ReconciliationPeriodFilter[])
        .map((key) => {
          const { rangeLabel, points } = reconciliationBreakdownByFilter[key]
          const total = sum(points.map((p) => p.total))
          const ai = sum(points.map((p) => p.aiReconciled))
          const manual = sum(points.map((p) => p.manualReconciled))
          const review = sum(points.map((p) => p.needsReview))
          return `[${key}] ${rangeLabel}: transactions=${total}, amount_usd=${sum(points.map((p) => p.amount))}, ai=${ai} (${pct(ai, total)}%), manual=${manual} (${pct(manual, total)}%), needs_review=${review} (${pct(review, total)}%)`
        })
        .join('\n'),
    ),
  )
}

/* ------------------------------------------------------------------ */
/* Reconciliation Hub - Workbench                                      */
/* ------------------------------------------------------------------ */

const STOP_TOKENS = new Set(['pte', 'ltd', 'sg', 'co', 'the', 'and', 'cafe', 'holdings', 'restaurant', 'grill'])

function nameTokens(value: string): string[] {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((token) => token.length > 1 && !STOP_TOKENS.has(token))
}

/** Customers in the directory whose name contains every distinctive word of the payer name. */
function directoryMatchesForPayer(payerName: string): CustomerProfile[] {
  const payerTokens = nameTokens(payerName)
  if (payerTokens.length === 0) return []
  return customerDirectory.filter((c) => {
    const tokens = new Set(nameTokens(c.name).concat(c.name.toLowerCase().split(/\W+/)))
    return payerTokens.every((t) => tokens.has(t))
  })
}

function buildWorkbench(): string {
  const allOpenInvoices = outstandingCustomers.flatMap((c) =>
    c.invoices.map((inv) => ({ customerId: c.id, customer: c.name, id: inv.id, outstanding: num(inv.total - inv.paid) })),
  )

  const allocations = incomingPayments.map((payment) => ({ payment, lines: fifoAllocation(payment) }))

  // Invoices that several pending payments would each try to settle (each payment is allocated independently).
  const contention = new Map<string, { outstanding: number; applied: number; payments: string[] }>()
  for (const { payment, lines } of allocations) {
    for (const line of lines) {
      const key = `${payment.customer.name}::${line.invoiceId}`
      const entry = contention.get(key) ?? { outstanding: line.outstanding, applied: 0, payments: [] }
      entry.applied += line.applied
      entry.payments.push(payment.id)
      contention.set(key, entry)
    }
  }
  const contested = [...contention.entries()].filter(([, e]) => e.payments.length > 1 && e.applied > e.outstanding + 0.005)

  const paymentBlocks = allocations.map(({ payment, lines }) => {
    const { customer } = payment
    const open = customer.invoices.map((inv) => ({ inv, out: outstandingOf(inv) }))
    const totalOutstanding = num(sum(open.map((o) => o.out)))
    const applied = num(sum(lines.map((l) => l.applied)))
    const registered = customer.payers.find((p) => p.name === payment.payerName)
    const lookalikes = directoryMatchesForPayer(payment.payerName)
    const exact = open.filter((o) => Math.abs(o.out - payment.amount) < 0.005).map((o) => o.inv.id)
    const crossExact = allOpenInvoices.filter(
      (i) => Math.abs(i.outstanding - payment.amount) < 0.005 && i.customer !== customer.name,
    )
    const refNumbers = payment.bankRef.match(/\d{4,}/g) ?? []
    const refHits = refNumbers.map((digits) => ({
      digits,
      invoice: open.find((o) => o.inv.id.replace(/\D/g, '') === digits)?.inv.id,
    }))

    const flags: string[] = []
    if (registered) flags.push(`payer is a registered payer of ${customer.name} (${registered.priority} priority, ${registered.role})`)
    else flags.push(`payer "${payment.payerName}" is NOT a registered payer of ${customer.name}`)
    for (const match of lookalikes) {
      if (match.name !== customer.name) flags.push(`payer name resembles another customer: ${match.name} (${match.code}, id ${match.id}), but the payment is mapped to ${customer.name}`)
    }
    if (exact.length) flags.push(`amount exactly equals the outstanding balance of ${exact.join(', ')}`)
    if (exact.length && lines.length && !exact.every((id) => lines.some((l) => l.invoiceId === id && l.clears))) {
      flags.push(`FIFO allocation does not target the exact-amount invoice (${exact.join(', ')}): it applies to the oldest invoice first`)
    }
    for (const other of crossExact) {
      flags.push(`the same amount also equals open invoice ${other.id} of ${other.customer} (outstanding ${other.outstanding})`)
    }
    for (const hit of refHits) {
      flags.push(hit.invoice ? `bank reference cites ${hit.digits}, which matches open invoice ${hit.invoice}` : `bank reference cites ${hit.digits}, which matches no open invoice of ${customer.name}`)
    }
    if (payment.amount > totalOutstanding + 0.005) flags.push(`payment exceeds total outstanding by ${num(payment.amount - totalOutstanding)} (over-payment)`)
    if (applied < payment.amount - 0.005) flags.push(`only ${applied} of ${payment.amount} can be allocated`)
    for (const [key, entry] of contested) {
      if (key.startsWith(`${customer.name}::`) && entry.payments.includes(payment.id)) {
        flags.push(`invoice ${key.split('::')[1]} is also targeted by ${entry.payments.filter((id) => id !== payment.id).join(', ')} (combined ${num(entry.applied)} vs outstanding ${entry.outstanding})`)
      }
    }

    return [
      `${payment.id} | payer="${payment.payerName}" -> customer="${customer.name}" (${customer.type}, credit limit ${customer.creditLimitLabel}) | amount_sgd=${payment.amount} | ref="${payment.bankRef}" | ${payment.method} via ${payment.bank} | ${payment.date}`,
      `    customer open invoices (oldest first): ${open.map((o) => `${o.inv.id} ${o.inv.status}, ${o.inv.ageDays}d, outstanding ${num(o.out)}`).join('; ')}; total outstanding ${totalOutstanding}`,
      `    AI (FIFO) allocation: ${lines.length ? lines.map((l) => `${l.invoiceId}: apply ${num(l.applied)} (${l.clears ? 'clears' : `${num(l.remainingAfter)} remaining`})`).join('; ') : 'none'} -> allocated ${applied} of ${payment.amount} (${pct(applied, payment.amount, 0)}%)`,
      `    registered payers: ${customer.payers.map((p) => `${p.name} [${p.priority}]`).join('; ')}`,
      `    flags: ${flags.join(' | ')}`,
    ].join('\n')
  })

  const byBank = ['DBS', 'OCBC'].map((bank) => {
    const subset = incomingPayments.filter((p) => p.bank === bank)
    return { bank, count: subset.length, amount: num(sum(subset.map((p) => p.amount))) }
  })

  return section(
    'SCREEN: Reconciliation Hub - Workbench (route /reconciliation-hub/workbench)',
    `Currency: SGD. ${incomingPayments.length} incoming payments are waiting, pulled from DBS and OCBC email statements at ${statementsPulledAt}. The page header also shows "${unmatchedCount} unmatched" as a separate count.`,
    'Allocation modes: "AI Allocated" ticks invoices oldest-first (FIFO) until the payment is covered and applies money in that order; "Manual" lets the user tick invoices. Actions per payment: Flag as issue, Confirm & post. Matching priority: the engine looks for High-priority payer names first, then Medium, then Low; amount, date and bank reference are tiebreakers. Filter options: ' +
      'Matching Multiple Invoices, Partial Payment Matches, Advance Payments, Short Payment, Over Payment, Duplicate Payment Detection, Manual Review Suggested, and a minimum AI-confidence threshold.',
    widget('Incoming payments - totals', `total_waiting_sgd=${num(sum(incomingPayments.map((p) => p.amount)))} across ${incomingPayments.length} payments\n` + table(byBank, [['bank', (b) => b.bank], ['payments', (b) => b.count], ['amount_sgd', (b) => b.amount]])),
    widget(
      'Incoming payments with pre-computed allocation and checks (in list order; the first is selected by default)',
      paymentBlocks.join('\n'),
    ),
  )
}

/* ------------------------------------------------------------------ */
/* Customers                                                           */
/* ------------------------------------------------------------------ */

function buildCustomers(): string {
  const dir = customerDirectory
  const tierOf = (c: CustomerProfile) => customerHealthTier(c.healthScore)
  const totalOutstanding = sum(dir.map((c) => c.outstanding))
  const totalOverdue = sum(dir.map((c) => c.overdueAmount))
  const totalUpcoming = sum(dir.map((c) => c.upcomingAmount))

  const group = <K extends string>(keyOf: (c: CustomerProfile) => K) => {
    const keys = [...new Set(dir.map(keyOf))]
    return keys.map((key) => {
      const subset = dir.filter((c) => keyOf(c) === key)
      return {
        key,
        customers: subset.length,
        outstanding: sum(subset.map((c) => c.outstanding)),
        overdue: sum(subset.map((c) => c.overdueAmount)),
        upcoming: sum(subset.map((c) => c.upcomingAmount)),
        avgHealth: num(sum(subset.map((c) => c.healthScore)) / subset.length, 1),
        critical: subset.filter((c) => tierOf(c) === 'critical').map((c) => c.name),
      }
    })
  }

  const groupCols = (label: string) =>
    [
      [label, (g: ReturnType<typeof group>[number]) => g.key],
      ['customers', (g: ReturnType<typeof group>[number]) => g.customers],
      ['outstanding_sgd', (g: ReturnType<typeof group>[number]) => g.outstanding],
      ['overdue_sgd', (g: ReturnType<typeof group>[number]) => g.overdue],
      ['overdue_pct_of_outstanding', (g: ReturnType<typeof group>[number]) => pct(g.overdue, g.outstanding)],
      ['upcoming_sgd', (g: ReturnType<typeof group>[number]) => g.upcoming],
      ['avg_health_score', (g: ReturnType<typeof group>[number]) => g.avgHealth],
      ['critical_customers', (g: ReturnType<typeof group>[number]) => g.critical.join(', ')],
    ] as const

  const ranked = [...dir].sort((a, b) => a.healthScore - b.healthScore)

  return section(
    'SCREEN: Customers (route /customer-intelligence/customers; detail at /customer-intelligence/overview/<id>)',
    `Currency: SGD (all customers, including Malaysian ones). Health tiers used on screen: Healthy = score 60-100, Watch = 21-59, Critical = 0-20. Shown on screen as "Profile score". Tier counts: ${(['healthy', 'watch', 'critical'] as const).map((t) => `${t}=${dir.filter((c) => tierOf(c) === t).length}`).join(', ')}.`,
    `Portfolio totals: ${dir.length} customers | outstanding SGD ${totalOutstanding} | overdue SGD ${totalOverdue} (${pct(totalOverdue, totalOutstanding)}% of outstanding) | upcoming SGD ${totalUpcoming} | lifetime value SGD ${sum(dir.map((c) => c.lifetimeValue))} | average health score ${num(sum(dir.map((c) => c.healthScore)) / dir.length, 1)}.`,
    widget(
      'Customer directory (sorted from lowest to highest health)',
      table(ranked, [
        ['id', (c) => c.id],
        ['code', (c) => c.code],
        ['name', (c) => c.name],
        ['type', (c) => c.type],
        ['segment', (c) => c.segment],
        ['city', (c) => c.city],
        ['health_score', (c) => c.healthScore],
        ['tier', (c) => tierOf(c)],
        ['outstanding_sgd', (c) => c.outstanding],
        ['open_invoices', (c) => c.openInvoices],
        ['overdue_sgd', (c) => c.overdueAmount],
        ['upcoming_sgd', (c) => c.upcomingAmount],
        ['upcoming_due', (c) => c.upcomingDueDate],
        ['last_payment', (c) => c.lastPaymentDate],
        ['customer_since', (c) => c.customerSince],
        ['lifetime_value_sgd', (c) => c.lifetimeValue],
        ['ageing_0_30', (c) => c.ageing['0-30']],
        ['ageing_31_60', (c) => c.ageing['31-60']],
        ['ageing_61_90', (c) => c.ageing['61-90']],
        ['ageing_90_plus', (c) => c.ageing['90+']],
        ['account_manager', (c) => c.accountManager],
        ['contact', (c) => `${c.contactName} (${c.contactRole}) ${c.email} ${c.phone}`],
      ]),
    ),
    widget('Rollup by account type', table(group((c) => c.type), groupCols('type'))),
    widget('Rollup by segment', table(group((c) => c.segment), groupCols('segment'))),
    widget('Rollup by account manager', table(group((c) => c.accountManager), groupCols('account_manager'))),
    widget('Rollup by city', table(group((c) => c.city), groupCols('city'))),
    widget('Rollup by health tier', table(group((c) => tierOf(c)), groupCols('tier'))),
  )
}

/* ------------------------------------------------------------------ */
/* Payments (Customer Outstanding)                                     */
/* ------------------------------------------------------------------ */

function buildPayments(): string {
  const buckets = ['0-30', '31-60', '61-90', '90+'] as const
  const invoices = outstandingCustomers.flatMap((c) =>
    c.invoices.map((inv) => ({
      customer: c,
      inv,
      outstanding: num(inv.total - inv.paid),
      bucket: bucketOfAge(inv.ageDays),
    })),
  )
  const grand = num(sum(invoices.map((i) => i.outstanding)))
  const bucketTotals = buckets.map((bucket) => {
    const subset = invoices.filter((i) => i.bucket === bucket)
    return { bucket, invoices: subset.length, amount: num(sum(subset.map((i) => i.outstanding))) }
  })

  const perCustomer = outstandingCustomers
    .map((c) => {
      const rows = invoices.filter((i) => i.customer.id === c.id)
      const total = num(sum(rows.map((r) => r.outstanding)))
      const by = (b: string) => num(sum(rows.filter((r) => r.bucket === b).map((r) => r.outstanding)))
      return {
        c,
        total,
        b030: by('0-30'),
        b3160: by('31-60'),
        b6190: by('61-90'),
        b90: by('90+'),
        oldest: Math.max(...c.invoices.map((i) => i.ageDays)),
        overdue31: num(total - by('0-30')),
      }
    })
    .sort((a, b) => b.total - a.total)

  const byType = (['Restaurant', 'Retail'] as const).map((type) => {
    const rows = invoices.filter((i) => i.customer.type === type)
    const total = num(sum(rows.map((r) => r.outstanding)))
    return { type, customers: new Set(rows.map((r) => r.customer.id)).size, invoices: rows.length, total, share: pct(total, grand), over30: num(sum(rows.filter((r) => r.bucket !== '0-30').map((r) => r.outstanding))) }
  })

  return section(
    'SCREEN: Payments - Customer Outstanding (route /customer-intelligence/payments)',
    `Currency: SGD. As of ${outstandingAsOf}. Total outstanding SGD ${grand} across ${outstandingCustomers.length} customers and ${invoices.length} open invoices. Ageing buckets are by invoice age in days: 0-30 "Current", 31-60 "Mild", 61-90 "Overdue", 90+ "Critical". Row actions: Chase via WhatsApp / email; page actions: Expand all, Export, Send reminders.`,
    widget('Ageing bucket cards', table(bucketTotals, [['bucket', (b) => b.bucket], ['open_invoices', (b) => b.invoices], ['amount_sgd', (b) => b.amount], ['share_pct', (b) => pct(b.amount, grand)]])),
    widget(
      'Customer outstanding (sorted by outstanding, largest first)',
      table(perCustomer, [
        ['id', (r) => r.c.id],
        ['code', (r) => r.c.code],
        ['customer', (r) => r.c.name],
        ['type', (r) => r.c.type],
        ['open_invoices', (r) => r.c.invoices.length],
        ['0-30', (r) => r.b030],
        ['31-60', (r) => r.b3160],
        ['61-90', (r) => r.b6190],
        ['90+', (r) => r.b90],
        ['outstanding_sgd', (r) => r.total],
        ['older_than_30d_sgd', (r) => r.overdue31],
        ['oldest_invoice_days', (r) => r.oldest],
      ]),
    ),
    widget('By type', table(byType, [['type', (t) => t.type], ['customers', (t) => t.customers], ['open_invoices', (t) => t.invoices], ['outstanding_sgd', (t) => t.total], ['share_pct', (t) => t.share], ['older_than_30d_sgd', (t) => t.over30]])),
    widget(
      'All open invoices (oldest first)',
      table(
        [...invoices].sort((a, b) => b.inv.ageDays - a.inv.ageDays),
        [
          ['invoice', (r) => r.inv.id],
          ['customer', (r) => r.customer.name],
          ['issued', (r) => r.inv.date],
          ['age_days', (r) => r.inv.ageDays],
          ['bucket', (r) => r.bucket],
          ['status', (r) => r.inv.status],
          ['total_sgd', (r) => r.inv.total],
          ['paid_sgd', (r) => r.inv.paid],
          ['outstanding_sgd', (r) => r.outstanding],
          ['reason', (r) => r.inv.reason],
        ],
      ),
    ),
  )
}

/* ------------------------------------------------------------------ */
/* Customer 360 detail panels, legacy overview, navigation             */
/* ------------------------------------------------------------------ */

function buildCustomer360(): string {
  const p = customer360
  return section(
    'SCREEN: Customer 360 detail panels (route /customer-intelligence/overview/<customer id>)',
    "On a customer's detail page the header (name, code, city, account manager, health score, outstanding, overdue, upcoming) comes from the customer directory above and belongs to the selected customer. The detailed panels below it (financial health, risk, relationship, payment behaviour, history) show the sample profile of ABC Industries Pvt. Ltd. (INR). If asked about those panels for another customer, say the panels currently show the ABC Industries profile.",
    widget('Profile', JSON.stringify(p.customerOverviewProfile)),
    widget('Headline stats', JSON.stringify(p.customerOverviewStats)),
    widget('Financial health', JSON.stringify(p.financialHealth)),
    widget('Risk assessment', JSON.stringify(p.riskAssessment)),
    widget('Business relationship', JSON.stringify(p.businessRelationship)),
    widget(
      'Payment behaviour (last 12 months: Jun 24 - May 25)',
      `${JSON.stringify(p.paymentBehaviorStats)}\n` +
        Object.entries(p.paymentBehaviorHeatMap)
          .map(([bucket, values]) => `${bucket}: ${values.join(', ')}`)
          .join('\n'),
    ),
    widget('Revenue trend', `YoY growth ${p.revenueTrend.yoyGrowth}%; current year ${p.revenueTrend.currentYearTotal}; previous year ${p.revenueTrend.previousYearTotal}; quarters: ${p.revenueTrend.quarters.map((q) => `${q.label} ${q.value} (${q.deltaLabel})`).join('; ')}`),
    widget('Payment history', table(p.paymentHistory, [['date', (r) => r.date], ['invoice', (r) => r.invoiceNo], ['amount', (r) => r.amount], ['method', (r) => r.method], ['status', (r) => r.status]])),
    widget('Invoice disputes', table(p.invoiceDisputes, [['invoice', (r) => r.invoiceNo], ['amount', (r) => r.amount], ['reason', (r) => r.reason], ['raised', (r) => r.raisedOn], ['status', (r) => r.status]])),
    widget('Recommended actions', p.recommendedActions.map((a) => `${a.title}: ${a.subtitle}`).join('\n')),
    widget('AI executive summary', p.aiExecutiveSummary.paragraphs.join('\n')),
  )
}

function buildLegacyOverview(): string {
  return section(
    'SCREEN: Overview / Transactions / Exceptions / Reports (routes /overview, /transactions, /exceptions, /reports)',
    'Currency: USD. Dates: Jul 2026.',
    widget('Transactions', table(transactions, [['id', (t) => t.id], ['date', (t) => t.date], ['description', (t) => t.description], ['source', (t) => t.source], ['amount', (t) => t.amount], ['status', (t) => t.status]])),
    widget('Exceptions', table(exceptions, [['id', (e) => e.id], ['reference', (e) => e.reference], ['severity', (e) => e.severity], ['owner', (e) => e.owner], ['age', (e) => e.age], ['note', (e) => e.note]])),
    widget('Reconciliation runs', table(reconciliationRuns, [['id', (r) => r.id], ['name', (r) => r.name], ['period', (r) => r.period], ['matched', (r) => r.matched], ['unmatched', (r) => r.unmatched], ['status', (r) => r.status]])),
    widget('Reports', table(reports, [['id', (r) => r.id], ['name', (r) => r.name], ['period', (r) => r.period], ['generated', (r) => r.generatedOn], ['status', (r) => r.status]])),
    widget('Weekly matched vs unmatched trend', table(weeklyTrend, [['day', (d) => d.label], ['matched', (d) => d.matched], ['unmatched', (d) => d.unmatched]])),
  )
}

function buildNavigation(): string {
  return section(
    'PRODUCT MAP',
    [
      '/home - Home: receivables, reconciliation and cash-flow dashboard',
      '/finance-navigator - FinPilot: AI collections, cash-flow and revenue intelligence',
      '/control-tower - Forecast Board: bucket next week\'s receivables by confidence',
      '/reconciliation-hub/overview - Reconciliation Hub Overview: bank feed and match status',
      '/reconciliation-hub/workbench - Reconciliation Workbench: allocate incoming payments to invoices',
      '/customer-intelligence/customers - Customers: directory with health tiers',
      '/customer-intelligence/payments - Payments: outstanding by customer and ageing bucket',
      '/customer-intelligence/overview/<id> - Customer 360 for one customer',
      'Pages not yet built (placeholders): Invoices, Prediction, Invoice Intelligence, Payee Mapping, Bank Statements, Intelli Trend, Experiment, Data, Users.',
    ].join('\n'),
  )
}

/* ------------------------------------------------------------------ */
/* public API                                                          */
/* ------------------------------------------------------------------ */

let cached: string | null = null

/** The full workspace snapshot. Cheap to build and cached: the underlying mock data is static. */
export function buildKnowledge(): string {
  if (cached) return cached
  cached = [
    'Workspace: WeLe Reflex. Sections are grouped by screen; every figure is tagged with the widget it appears in. Customer ids (e.g. golden-wok) are used in links.',
    buildHome(),
    buildFinPilot(),
    buildForecastBoard(),
    buildHubOverview(),
    buildWorkbench(),
    buildCustomers(),
    buildPayments(),
    buildCustomer360(),
    buildLegacyOverview(),
    buildNavigation(),
  ].join('\n\n')
  return cached
}

/** A single customer's record, used when the user is on that customer's detail page. */
export function describeCustomer(customerId: string): string | null {
  const c = customerDirectory.find((x) => x.id === customerId)
  if (!c) return null
  const invoices = outstandingCustomers.find((x) => x.id === customerId)?.invoices ?? []
  return [
    `Selected customer: ${c.name} (${c.code}, id ${c.id}); ${c.type}, ${c.segment}, ${c.city}; health score ${c.healthScore} (${customerHealthTier(c.healthScore)}); account manager ${c.accountManager}; outstanding SGD ${c.outstanding}; overdue SGD ${c.overdueAmount}; upcoming SGD ${c.upcomingAmount} due ${c.upcomingDueDate}; last payment ${c.lastPaymentDate}.`,
    invoices.length ? `Open invoices: ${invoices.map((i) => `${i.id} (${i.ageDays}d, outstanding ${num(i.total - i.paid)}${i.reason ? `, ${i.reason}` : ''})`).join('; ')}.` : '',
  ]
    .filter(Boolean)
    .join('\n')
}
