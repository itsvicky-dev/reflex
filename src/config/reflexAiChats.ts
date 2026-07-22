export type WowLineSeries = {
  id: string
  label: string
  colorVar: string
  values: number[]
}

export type WowLineChart = {
  kind: 'line'
  title: string
  subtitle: string
  xLabels: string[]
  yMax: number
  yTicks: number[]
  series: WowLineSeries[]
  baselineLabel: string
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

export type RiskMatrixChart = {
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

export type ReflexChart = WowLineChart | RiskMatrixChart

export type ReflexBullet = {
  lead: string
  text: string
}

export type ReflexChatResponse = {
  narration: string
  bullets: ReflexBullet[]
  closing: string
  toolCallLabel: string
  toolCallTag: string
  chart: ReflexChart
}

export type ReflexChat = {
  id: string
  contextLabel: string
  prompt: string
  response: ReflexChatResponse
}

export const reflexAiChats: Record<string, ReflexChat> = {
  'summarize-trends': {
    id: 'summarize-trends',
    contextLabel: 'Skill Bridge Enrollment Funnel',
    prompt: 'Summarize current trends in this dashboard',
    response: {
      narration:
        "Here's what the data shows for the past week (Jul 14-20, 2026). The platform appears to have just launched — the prior week (Jul 7-13) shows zero activity across all metrics, making this week's numbers your baseline rather than a change.",
      bullets: [
        {
          lead: 'Enrollment funnel looks healthy early on:',
          text: '24 course detail views led to 14 enrollment submissions — a ~58% conversion from detail view to enrollment, which is strong for a new platform.',
        },
        {
          lead: 'Masterclass interest is high:',
          text: '19 Masterclass card clicks vs. only 2 Course Card clicks suggests users are gravitating toward the Masterclass content over standard courses.',
        },
        {
          lead: 'Sessions (49) vs. active events (921):',
          text: 'means users are averaging ~19 events per session — indicating engaged, exploratory behavior.',
        },
      ],
      closing:
        "Since this is your first week of data, next week's comparison will be the real signal to watch. Want me to set up a week-over-week tracking chart you can revisit?",
      toolCallLabel: 'Getting dashboard data',
      toolCallTag: 'o985r1t0',
      chart: {
        kind: 'line',
        title: 'WeLe IntelliTech - WoW Event Totals (Jul 7-20, 2026)',
        subtitle: 'Week-over-week total event counts for key engagement events: Jul 14-20 vs Jul 7-13.',
        xLabels: ['Jul 14', 'Jul 15', 'Jul 16', 'Jul 17', 'Jul 18', 'Jul 19', 'Jul 20'],
        yMax: 1000,
        yTicks: [0, 250, 500, 750, 1000],
        baselineLabel: 'Prior week (Jul 7-13): no activity',
        series: [
          { id: 'events', label: 'Active events', colorVar: 'var(--color-chart-series-1)', values: [80, 190, 340, 480, 620, 780, 921] },
          { id: 'sessions', label: 'Sessions', colorVar: 'var(--color-chart-series-2)', values: [4, 9, 15, 21, 28, 38, 49] },
          {
            id: 'course-views',
            label: 'Course detail views',
            colorVar: 'var(--color-chart-series-3)',
            values: [2, 5, 9, 13, 17, 21, 24],
          },
          {
            id: 'masterclass-clicks',
            label: 'Masterclass clicks',
            colorVar: 'var(--color-chart-series-4)',
            values: [1, 3, 6, 9, 12, 16, 19],
          },
        ],
      },
    },
  },
  'customer-risk-matrix': {
    id: 'customer-risk-matrix',
    contextLabel: 'Accounts Receivable Aging',
    prompt: 'Which customers are at risk of non-payment right now?',
    response: {
      narration:
        "Here's how your active customer accounts break down by payment risk, plotting payment delay against outstanding amount:",
      bullets: [
        {
          lead: '3 accounts sit in the critical zone:',
          text: 'high payment delay combined with a high outstanding amount — these need attention first.',
        },
        {
          lead: 'ABC Industries is your largest exposure:',
          text: '₹9.2Cr outstanding at 95 days overdue — this account alone justifies immediate collections escalation.',
        },
        {
          lead: 'Global Steel Ltd is trending the same way:',
          text: '₹6.6Cr outstanding at 90 days, already flagged high risk and close behind ABC Industries.',
        },
        {
          lead: 'Medium-risk accounts are building up:',
          text: 'Nova Tech, XYZ Motors, Prime Logistics, and Delta Energy together hold ~₹17.3Cr outstanding — proactive follow-up could stop them sliding into the critical zone.',
        },
        {
          lead: 'Low-risk accounts stay current:',
          text: 'Bright Retail, Eco Packaging, GreenField Foods, and Swift Electronics show minimal delay and pose little collection risk.',
        },
      ],
      closing: 'Want me to draft a prioritized collections outreach plan starting with the critical-zone accounts?',
      toolCallLabel: 'Getting dashboard data',
      toolCallTag: 'a231k9c2',
      chart: {
        kind: 'scatter',
        title: 'Customer Risk Matrix',
        subtitle: 'Outstanding amount vs. payment delay across active customer accounts. Bubble size represents revenue contribution.',
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
        ],
      },
    },
  },
}
