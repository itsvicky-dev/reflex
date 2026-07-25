import { clsx } from 'clsx'
import {
  ChevronDown,
  ChevronRight,
  CreditCard,
  Handshake,
  MessageCircle,
  Percent,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import {
  aiExecutiveSummary,
  businessRelationship,
  customerOverviewProfile,
  customerOverviewStats,
  financialHealth,
  paymentBehaviorHeatMap,
  paymentBehaviorMonths,
  paymentBehaviorStats,
  recommendedActions,
  riskAssessment,
  type PaymentBehaviorBucket,
  type RecommendedAction,
} from '../data/mockCustomerOverview'

function SectionHeading({ title }: { title: string }) {
  return <h3 className="text-sm font-semibold text-heading">{title}</h3>
}

function Sparkline({ points, colorVar, height = 44 }: { points: number[]; colorVar: string; height?: number }) {
  const width = 180
  const pad = 4
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const n = points.length

  const xAt = (i: number) => pad + (i / (n - 1)) * (width - pad * 2)
  const yAt = (v: number) => pad + (1 - (v - min) / range) * (height - pad * 2)

  const linePath = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(v)}`).join(' ')
  const areaPath = `${linePath} L${xAt(n - 1)},${height} L${xAt(0)},${height} Z`
  const gradientId = `overview-spark-${colorVar.replace(/[^a-z0-9]/gi, '')}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-11 w-full">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colorVar} stopOpacity={0.25} />
          <stop offset="100%" stopColor={colorVar} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={colorVar} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function RadialGauge({
  value,
  size = 128,
  strokeWidth = 10,
  colorClass,
  children,
}: {
  value: number
  size?: number
  strokeWidth?: number
  colorClass: string
  children: React.ReactNode
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value / 100)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ width: size, height: size }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-surface-hover" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={clsx('transition-[stroke-dashoffset] duration-500 ease-out', colorClass)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

function MetricBar({ label, value, colorClass }: { label: string; value: number; colorClass: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-ink-muted">{label}</span>
        <span className="font-semibold tabular-nums text-heading">{value}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
        <div className={clsx('h-full rounded-full', colorClass)} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function InfoRow({ label, value, sublabel }: { label: string; value: React.ReactNode; sublabel?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-xs">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-semibold text-heading">
        {value}
        {sublabel && <span className="ml-1 font-normal text-ink-muted">{sublabel}</span>}
      </span>
    </div>
  )
}

function StatTile({ label, value, value2, deltaLabel, deltaDown }: { label: string; value: string; value2?: string; deltaLabel?: string; deltaDown?: boolean }) {
  return (
    <div>
      <p className="text-[11px] text-ink-muted">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-heading">
        {value}
        {value2 && <span className="ml-1 text-xs font-normal text-ink-muted">{value2}</span>}
      </p>
      {deltaLabel && (
        <p className={clsx('mt-0.5 flex items-center gap-1 text-[11px] font-medium', deltaDown ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')}>
          <span aria-hidden>{deltaDown ? '↓' : '↗'}</span>
          {deltaLabel}
        </p>
      )}
    </div>
  )
}

const heatMapBuckets: PaymentBehaviorBucket[] = ['On-time', '1-15 Days Late', '16-30 Days Late', '30+ Days Late', 'No Payment']

function heatCellClass(bucket: PaymentBehaviorBucket, value: number) {
  if (value === 0) return 'bg-surface-hover text-ink-muted'
  switch (bucket) {
    case 'On-time':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
    case '1-15 Days Late':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'
    case '16-30 Days Late':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300'
    case '30+ Days Late':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300'
    case 'No Payment':
      return 'bg-surface-hover text-ink-muted'
  }
}

const actionIcon: Record<RecommendedAction['icon'], React.ElementType> = {
  credit: CreditCard,
  monitor: ShieldCheck,
  'follow-up': MessageCircle,
  discount: Percent,
}

export function CustomerOverviewPage() {
  return (
    <section className="@container space-y-4">
      <div className="flex flex-col gap-1 @lg:flex-row @lg:items-center @lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading">Customer 360</h1>
          <p className="mt-0.5 text-xs text-ink-muted">Customers / {customerOverviewProfile.name}</p>
        </div>
        <Button variant="white" size="sm">
          Actions <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Card className="min-w-0 p-5">
        <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white">
              AI
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-heading">{customerOverviewProfile.name}</h2>
                <Badge tone="success">{customerOverviewProfile.badge}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs @lg:grid-cols-3">
                <div>
                  <p className="text-ink-muted">Industry</p>
                  <p className="mt-0.5 font-medium text-heading">{customerOverviewProfile.industry}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Business Unit</p>
                  <p className="mt-0.5 font-medium text-heading">{customerOverviewProfile.businessUnit}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Account Manager</p>
                  <p className="mt-0.5 font-medium text-heading">{customerOverviewProfile.accountManager}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Customer ID</p>
                  <p className="mt-0.5 font-medium text-heading">{customerOverviewProfile.customerId}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Relationship Since</p>
                  <p className="mt-0.5 font-medium text-heading">{customerOverviewProfile.relationshipSince}</p>
                </div>
                <div>
                  <p className="text-ink-muted">GSTIN</p>
                  <p className="mt-0.5 font-medium text-heading">{customerOverviewProfile.gstin}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 border-t border-border pt-4 @3xl:border-l @3xl:border-t-0 @3xl:pl-6 @3xl:pt-0">
            <div>
              <p className="text-xs text-ink-muted">Annual Revenue Contribution</p>
              <p className="mt-0.5 text-base font-semibold text-heading">{customerOverviewStats.annualRevenueContribution}</p>
              <p className="mt-0.5 text-[11px] text-ink-muted">{customerOverviewStats.annualRevenueContributionSublabel}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Current Credit Limit</p>
              <p className="mt-0.5 text-base font-semibold text-heading">{customerOverviewStats.currentCreditLimit}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Outstanding Balance</p>
              <p className="mt-0.5 text-base font-semibold text-heading">{customerOverviewStats.outstandingBalance}</p>
            </div>
            <div>
              <p className="text-xs text-ink-muted">Available Credit</p>
              <p className="mt-0.5 text-base font-semibold text-heading">{customerOverviewStats.availableCredit}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-ink-muted">Last Payment Received</p>
              <p className="mt-0.5 text-base font-semibold text-heading">
                {customerOverviewStats.lastPaymentReceived}
                <span className="ml-1.5 text-[11px] font-normal text-ink-muted">{customerOverviewStats.lastPaymentReceivedDate}</span>
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-3">
        <Card className="min-w-0 p-5">
          <SectionHeading title="Financial Health" />
          <div className="mt-4 flex items-center gap-4">
            <RadialGauge value={financialHealth.score} colorClass="text-emerald-500">
              <span className="text-xl font-semibold text-heading">{financialHealth.score}</span>
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{financialHealth.status}</span>
            </RadialGauge>
            <div className="min-w-0 flex-1 space-y-3">
              <MetricBar label="Credit Utilization" value={financialHealth.creditUtilization} colorClass="bg-amber-400" />
              <MetricBar label="Collection Efficiency" value={financialHealth.collectionEfficiency} colorClass="bg-emerald-500" />
            </div>
          </div>

          <div className="mt-3 divide-y divide-border border-t border-border">
            <InfoRow label="DSO (Days Sales Outstanding)" value={`${financialHealth.dsoDays} Days`} />
            <InfoRow label="Payment Discipline" value={financialHealth.paymentDiscipline} />
            <div className="flex items-center justify-between gap-3 py-2 text-xs">
              <span className="text-ink-muted">Revenue Trend (YoY)</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3 w-3" /> {financialHealth.revenueTrendYoY}%
              </span>
            </div>
            <div className="py-2">
              <Sparkline points={financialHealth.revenueTrendPoints} colorVar="rgb(16 185 129)" />
            </div>
            <InfoRow label="Cash Contribution" value={financialHealth.cashContribution} />
            <InfoRow label="Profitability Indicator" value={financialHealth.profitabilityIndicator} />
          </div>
        </Card>

        <Card className="min-w-0 p-5">
          <div className="flex items-center justify-between gap-2">
            <SectionHeading title="Risk Assessment" />
            <Badge tone="success">{riskAssessment.riskLevel}</Badge>
          </div>
          <div className="mt-5 flex justify-center">
            <RadialGauge value={riskAssessment.aiRiskScore} colorClass="text-emerald-500">
              <span className="text-xl font-semibold text-heading">{riskAssessment.aiRiskScore}</span>
              <span className="text-[10px] text-ink-muted">/100</span>
              <span className="mt-0.5 text-[10px] text-ink-muted">AI Risk Score</span>
            </RadialGauge>
          </div>
          <div className="mt-3 divide-y divide-border border-t border-border">
            <InfoRow label="Default Probability" value={riskAssessment.defaultProbability} />
            <InfoRow label="Late Payment Trend (3M)" value={riskAssessment.latePaymentTrend3M} />
            <InfoRow label="Credit Exposure" value={riskAssessment.creditExposure} />
            <InfoRow
              label="Dispute History"
              value={riskAssessment.disputeHistoryAmount}
              sublabel={`(${riskAssessment.disputeHistoryOpenCount} Open)`}
            />
            <InfoRow label="External Market Risk" value={riskAssessment.externalMarketRisk} />
          </div>
        </Card>

        <Card className="flex min-w-0 flex-col p-5">
          <SectionHeading title="Business Relationship" />
          <div className="mt-3 flex-1 divide-y divide-border border-t border-border">
            <div className="flex items-center justify-between gap-3 py-2.5 text-xs">
              <span className="flex items-center gap-2 text-ink-muted">
                <Handshake className="h-3.5 w-3.5" /> Total Business Value
              </span>
              <span className="font-semibold text-heading">{businessRelationship.totalBusinessValue}</span>
            </div>
            <InfoRow label="Total Invoices Raised" value={businessRelationship.totalInvoicesRaised} />
            <InfoRow label="Total Collections" value={businessRelationship.totalCollections} />
            <InfoRow label="Active Contracts" value={businessRelationship.activeContracts} />
            <InfoRow label="Products / Services" value={businessRelationship.productsServices} />
            <InfoRow label="Avg. Monthly Billing" value={businessRelationship.avgMonthlyBilling} />
            <InfoRow label="Customer Lifetime Value" value={businessRelationship.customerLifetimeValue} />
          </div>
          <Button variant="outline" size="sm" className="mt-4 w-full justify-between">
            View Relationship Details <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Card>
      </div>

      <Card className="min-w-0 p-5">
        <SectionHeading title="Payment Behavior Overview" />
        <div className="mt-4 grid grid-cols-1 gap-6 @4xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div className="overflow-x-auto">
            <p className="mb-2 text-xs text-ink-muted">Payment Behavior Heat Map (Last 12 Months)</p>
            <table className="w-full min-w-[560px] border-separate border-spacing-1 text-center text-[11px]">
              <thead>
                <tr>
                  <th className="w-28 text-left text-[10px] font-medium uppercase tracking-wide text-ink-muted" />
                  {paymentBehaviorMonths.map((month) => (
                    <th key={month} className="px-1 py-1 text-[10px] font-medium text-ink-muted">
                      {month}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatMapBuckets.map((bucket) => (
                  <tr key={bucket}>
                    <td className="whitespace-nowrap px-1 py-1 text-left text-[11px] text-ink-muted">{bucket}</td>
                    {paymentBehaviorHeatMap[bucket].map((value, i) => (
                      <td key={`${bucket}-${paymentBehaviorMonths[i]}`} className="px-0 py-0">
                        <div className={clsx('flex h-7 w-full items-center justify-center rounded font-semibold tabular-nums', heatCellClass(bucket, value))}>
                          {value}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-3">
              <StatTile
                label="On-time Payments"
                value={`${paymentBehaviorStats.onTimePayments}%`}
                deltaLabel={paymentBehaviorStats.onTimePaymentsDelta}
              />
              <StatTile label="Avg. Delay (Days)" value={`${paymentBehaviorStats.avgDelayDays}`} deltaLabel={paymentBehaviorStats.avgDelayDaysDelta} deltaDown />
              <StatTile label="Max Delay (Days)" value={`${paymentBehaviorStats.maxDelayDays}`} deltaLabel={paymentBehaviorStats.maxDelayDaysDelta} deltaDown />
              <StatTile label="Total Payments" value={`${paymentBehaviorStats.totalPayments}`} value2={paymentBehaviorStats.totalPaymentsSublabel} />
            </div>
            <div>
              <p className="text-xs text-ink-muted">Payment Trend</p>
              <Sparkline points={paymentBehaviorStats.paymentTrendPoints} colorVar="rgb(16 185 129)" />
              <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{paymentBehaviorStats.paymentTrendLabel}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-2">
        <Card className="min-w-0 p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-heading">
            <Sparkles className="h-4 w-4 text-accent" /> AI Executive Summary
          </p>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink">
            {aiExecutiveSummary.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-ink-muted">
            <Sparkles className="h-3 w-3" /> {aiExecutiveSummary.generatedBy}
            <span className="text-ink-muted/70">· {aiExecutiveSummary.generatedAt}</span>
          </p>
        </Card>

        <Card className="min-w-0 p-5">
          <p className="text-sm font-semibold text-heading">Recommended Actions</p>
          <ul className="mt-3 divide-y divide-border">
            {recommendedActions.map((action) => {
              const Icon = actionIcon[action.icon]
              return (
                <li key={action.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 py-2.5 text-left transition hover:bg-surface-hover"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-heading">{action.title}</p>
                        <p className="truncate text-xs text-ink-muted">{action.subtitle}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-ink-muted" />
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>
    </section>
  )
}
