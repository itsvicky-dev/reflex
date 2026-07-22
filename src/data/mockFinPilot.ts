export type StatTrendPoint = {
  date: string
  value: number
  projected?: boolean
}

export type FinPilotStat = {
  id: string
  label: string
  value: string
  sublabel: string
  tone: 'up' | 'down' | 'flat'
  trend: StatTrendPoint[]
}

const trendDates = ['Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19', 'Jul 20', 'Jul 21', 'Jul 22']

function makeTrend(values: number[]): StatTrendPoint[] {
  return values.map((value, index) => ({
    date: trendDates[index],
    value,
    projected: index === values.length - 1,
  }))
}

export const finPilotStats: FinPilotStat[] = [
  {
    id: 'collected',
    label: "Today's Collections",
    value: '₹4.82 Cr',
    sublabel: '78% of expected',
    tone: 'up',
    trend: makeTrend([3, 4, 5, 6, 9, 22, 83, 58]),
  },
  {
    id: 'expected',
    label: 'Expected by End of Day',
    value: '₹6.15 Cr',
    sublabel: '↑ 18% vs yesterday',
    tone: 'up',
    trend: makeTrend([10, 14, 18, 24, 30, 42, 60, 74]),
  },
  {
    id: 'inflow',
    label: 'Net Cash Inflow (7d)',
    value: '₹8.73 Cr',
    sublabel: '↑ 21% vs previous 7 days',
    tone: 'up',
    trend: makeTrend([15, 20, 28, 34, 40, 55, 68, 80]),
  },
  {
    id: 'avg-daily',
    label: 'Average Daily Inflow',
    value: '₹1.25 Cr',
    sublabel: 'Best day · ₹2.48 Cr',
    tone: 'flat',
    trend: makeTrend([40, 42, 39, 41, 43, 40, 42, 41]),
  },
  {
    id: 'upcoming-inflows',
    label: 'Upcoming Large Inflows',
    value: '₹4.35 Cr',
    sublabel: 'Next 7 days',
    tone: 'flat',
    trend: makeTrend([30, 34, 32, 35, 33, 36, 34, 37]),
  },
  {
    id: 'revenue-period',
    label: 'Revenue (Current Period)',
    value: '₹10.76 Cr',
    sublabel: '↓ 18.7% vs previous period',
    tone: 'down',
    trend: makeTrend([80, 74, 68, 60, 54, 47, 40, 34]),
  },
  {
    id: 'overdue',
    label: 'Overdue Collections',
    value: '₹1.18 Cr',
    sublabel: '↓ 9.4% vs last week',
    tone: 'down',
    trend: makeTrend([55, 50, 46, 42, 39, 35, 31, 28]),
  },
  {
    id: 'forecast-accuracy',
    label: 'Forecast Accuracy',
    value: '94%',
    sublabel: '↑ 3 pts vs last month',
    tone: 'up',
    trend: makeTrend([70, 72, 75, 78, 80, 84, 88, 91]),
  },
]

export const collectionsSummary = {
  collectedSoFar: '₹4.82 Cr',
  expectedEndOfDay: '₹6.15 Cr',
  vsYesterdayPct: 18,
  percentOfExpected: 78,
  insight: {
    lead: 'Collections are ahead of schedule.',
    highlight: 'ABC Industries',
    tail: 'is expected to clear',
    amount: '₹72 Lakhs',
    suffix: 'before 4 PM.',
    confidence: 94,
  },
}

export type CashFlowPoint = {
  date: string
  day: string
  value: number
  forecast?: boolean
}

export const cashFlowForecast = {
  netInflow7d: '₹8.73 Cr',
  vsPrevious7dPct: 21,
  avgDailyInflow: '₹1.25 Cr',
  bestDay: { label: 'Tue, 20 May', value: '₹2.48 Cr' },
  points: [
    { date: '14 May', day: 'Wed', value: 1.05 },
    { date: '15 May', day: 'Thu', value: 1.18 },
    { date: '16 May', day: 'Fri', value: 1.32 },
    { date: '17 May', day: 'Sat', value: 1.64 },
    { date: '18 May', day: 'Sun', value: 2.48, forecast: true },
    { date: '19 May', day: 'Mon', value: 1.42, forecast: true },
    { date: '20 May', day: 'Tue', value: 1.64, forecast: true },
  ] satisfies CashFlowPoint[],
  upcomingLargeInflows: '₹4.35 Cr',
  insight: {
    lead: 'Cash inflow is expected to peak on 18 May due to large payments from',
    links: ['ABC Industries', 'XYZ Corp'],
  },
}

export type RevenueWeek = {
  label: string
  range: string
  current: number
  previous: number
}

export const revenueTrend = {
  currentLabel: 'Current Period (Apr 20 – May 18)',
  previousLabel: 'Previous Period (Mar 22 – Apr 19)',
  unit: 'Amount (₹)',
  yMax: 4,
  weeks: [
    { label: 'Week 1', range: 'Apr 20 – Apr 26', current: 2.88, previous: 3.42 },
    { label: 'Week 2', range: 'Apr 27 – May 03', current: 2.63, previous: 3.21 },
    { label: 'Week 3', range: 'May 04 – May 10', current: 2.51, previous: 3.39 },
    { label: 'Week 4', range: 'May 11 – May 18', current: 2.74, previous: 3.22 },
  ] satisfies RevenueWeek[],
  insight: 'Revenue has been consistently lower across all weeks in the current period.',
}

export type RiskLevel = 'low' | 'medium' | 'high'

export type RiskBubble = {
  id: string
  name: string
  delayDays: number
  outstandingCr: number
  revenueContribution: number
  risk: RiskLevel
}

export type RiskMatrixChartData = {
  kind: 'scatter'
  title: string
  subtitle: string
  xAxisLabel: string
  yAxisLabel: string
  xMax: number
  yMax: number
  xTicks: number[]
  yTicks: number[]
  criticalZone: { xMin: number; yMin: number; label: string; sublabel: string }
  bubbles: RiskBubble[]
}

export const customerRiskMatrix = {
  criticalAccountsCount: 3,
  totalAtRiskCr: '₹15.8 Cr',
  topAccount: { name: 'ABC Industries', outstanding: '₹9.2 Cr', delayDays: 95 },
  insight: {
    lead: 'Immediate collections escalation is recommended for',
    links: ['ABC Industries', 'Global Steel Ltd'],
  },
  chart: {
    kind: 'scatter',
    title: 'Customer Risk Matrix',
    subtitle: 'Outstanding amount vs. payment delay across active customer accounts.',
    xAxisLabel: 'Payment Delay (Days)',
    yAxisLabel: 'Outstanding Amount (₹)',
    xMax: 120,
    yMax: 10,
    xTicks: [0, 30, 60, 90, 120],
    yTicks: [0, 2, 4, 6, 8, 10],
    criticalZone: { xMin: 75, yMin: 5.5, label: 'Critical zone', sublabel: 'High delay + high amount' },
    bubbles: [
      { id: 'abc-industries', name: 'ABC Industries', delayDays: 95, outstandingCr: 9.2, revenueContribution: 100, risk: 'high' },
      { id: 'global-steel', name: 'Global Steel Ltd', delayDays: 90, outstandingCr: 6.6, revenueContribution: 55, risk: 'high' },
      { id: 'nova-tech', name: 'Nova Tech Pvt. Ltd.', delayDays: 45, outstandingCr: 7.0, revenueContribution: 50, risk: 'medium' },
      { id: 'xyz-motors', name: 'XYZ Motors', delayDays: 35, outstandingCr: 4.2, revenueContribution: 40, risk: 'medium' },
      { id: 'prime-logistics', name: 'Prime Logistics', delayDays: 63, outstandingCr: 3.6, revenueContribution: 38, risk: 'medium' },
      { id: 'delta-energy', name: 'Delta Energy', delayDays: 88, outstandingCr: 2.5, revenueContribution: 35, risk: 'medium' },
      { id: 'bright-retail', name: 'Bright Retail', delayDays: 8, outstandingCr: 1.2, revenueContribution: 22, risk: 'low' },
      { id: 'eco-packaging', name: 'Eco Packaging', delayDays: 25, outstandingCr: 0.8, revenueContribution: 18, risk: 'low' },
      { id: 'greenfield-foods', name: 'GreenField Foods', delayDays: 40, outstandingCr: 1.0, revenueContribution: 20, risk: 'low' },
      { id: 'swift-electronics', name: 'Swift Electronics', delayDays: 78, outstandingCr: 0.5, revenueContribution: 16, risk: 'low' },
    ] satisfies RiskBubble[],
  } satisfies RiskMatrixChartData,
}

export type RootCause = {
  id: string
  icon: 'users' | 'cart' | 'clock' | 'tag'
  iconTone: 'rose' | 'amber' | 'emerald'
  badgeTone: 'danger' | 'warning'
  title: string
  description: string
  delta: string
}

export const aiExplanation = {
  subtitle: 'Root causes behind the revenue drop',
  causes: [
    {
      id: 'top-customers',
      icon: 'users',
      iconTone: 'rose',
      badgeTone: 'danger',
      title: 'Decline in Top 5 Customer Revenue',
      description: 'Revenue from top 5 customers dropped by ₹1.32 Cr (-24.6%) primarily due to reduced orders from ABC Corp. and Global Tech.',
      delta: '-24.6%',
    },
    {
      id: 'order-volume',
      icon: 'cart',
      iconTone: 'amber',
      badgeTone: 'danger',
      title: 'Lower Order Volume',
      description: 'Total order volume decreased by 13.8% compared to the previous period.',
      delta: '-13.8%',
    },
    {
      id: 'sales-cycle',
      icon: 'clock',
      iconTone: 'amber',
      badgeTone: 'warning',
      title: 'Longer Sales Cycle',
      description: 'Average sales cycle increased from 24 days to 31 days, impacting conversions.',
      delta: '+7 Days',
    },
    {
      id: 'product-mix',
      icon: 'tag',
      iconTone: 'emerald',
      badgeTone: 'danger',
      title: 'Product Mix Shift',
      description: 'Higher contribution from lower-margin products reduced overall revenue.',
      delta: '-6.2%',
    },
  ] satisfies RootCause[],
  recommendation: 'Focus on reviving top customer engagement and shortening sales cycle to recover lost revenue.',
}
