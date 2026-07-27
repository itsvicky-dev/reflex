import { clsx } from 'clsx'
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  ChevronDown,
  Clock,
  Coins,
  Filter,
  Info,
  LineChart as LineChartIcon,
  Maximize2,
  MoreVertical,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import finPilotIcon from '../assets/icons/fin-pilot.svg'
import { CashFlowSankeyChart } from '../components/ai/charts/CashFlowSankeyChart'
import { RiskMatrixChart } from '../components/ai/charts/RiskMatrixChart'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import {
  aiExplanation,
  cashFlowForecast,
  cashFlowVisualization,
  collectionsSummary,
  customerRiskMatrix,
  finPilotStats,
  outstandingDelayTrend,
  revenueTrend,
  type CashFlowPoint,
  type FinPilotStat,
  type OutstandingDelayPoint,
  type RevenueWeek,
  type RootCause,
  type StatTrendPoint,
} from '../data/mockFinPilot'

function CardHeader({
  icon,
  eyebrow,
  title,
  tone,
}: {
  icon: React.ReactNode
  eyebrow?: string
  title: string
  tone: 'accent' | 'success'
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div
          className={clsx(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
            tone === 'accent' ? 'bg-accent/10 text-accent' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 leading-tight">
          {eyebrow && (
            <p
              className={clsx(
                'truncate text-xs font-medium',
                tone === 'accent' ? 'text-accent' : 'text-emerald-600 dark:text-emerald-400',
              )}
            >
              {eyebrow}
            </p>
          )}
          <p className="truncate text-base font-semibold text-heading">{title}</p>
        </div>
      </div>
      {/* <div className="flex shrink-0 items-center gap-1.5">
        <Badge tone="success">LIVE</Badge>
        <IconButton aria-label="More options" className="h-8 w-8">
          <MoreVertical className="h-3.5 w-3.5" />
        </IconButton>
      </div> */}
    </div>
  )
}

function DashProgress({ value }: { value: number }) {
  const segments = 7
  const filled = Math.round((value / 100) * segments)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: segments }).map((_, index) => (
        <span
          key={index}
          className={clsx('h-1.5 w-4 rounded-full', index < filled ? 'bg-emerald-500' : 'bg-emerald-500/20')}
        />
      ))}
    </div>
  )
}

function CollectionsCard() {
  const { collectedSoFar, expectedEndOfDay, vsYesterdayPct, percentOfExpected, insight } = collectionsSummary

  return (
    <Card className="flex min-w-0 flex-col justify-between gap-4 p-5">
      <CardHeader icon={<img src={finPilotIcon} alt="" className="h-4 w-4" />} title="Fin Pilot" tone="accent" />

      <div>
        <p className="flex items-center gap-1.5 text-sm text-ink-muted">
          Today&apos;s Collections
          <Info className="h-3.5 w-3.5" />
        </p>

        <div className="mt-3 flex flex-col gap-3 @sm:flex-row @sm:items-start @sm:justify-between">
          <div>
            <p className="text-4xl font-semibold tracking-tight text-heading">{collectedSoFar}</p>
            <p className="mt-1 text-xs text-ink-muted">Collected So Far</p>
          </div>

          <div className="w-full shrink-0 rounded-xl bg-surface-hover p-4 @sm:w-56">
            <Calendar className="h-4 w-4 text-accent" />
            <p className="mt-2 text-xs text-ink-muted">Expected by End of Day</p>
            <p className="text-xl font-semibold text-heading">{expectedEndOfDay}</p>
            <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">↑ {vsYesterdayPct}% vs Yesterday</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 shrink-0">
          <p className="text-xl font-semibold text-accent">{percentOfExpected}%</p>
          <p className="text-[11px] leading-tight text-ink-muted">of Expected</p>
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-hover">
            <div className="h-full rounded-full bg-accent" style={{ width: `${percentOfExpected}%` }} />
          </div>
          <div className="relative mt-1.5 h-4 text-[10px] text-ink-muted">
            <span className="absolute left-0">0%</span>
            <span className="absolute -translate-x-1/2" style={{ left: `${percentOfExpected}%` }}>
              {percentOfExpected}%
            </span>
            <span className="absolute right-0">100%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 @sm:flex-row @sm:items-center @sm:justify-between">
        <div className="flex min-w-0 items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm leading-relaxed text-ink-muted">
            <span className="font-medium text-emerald-700 dark:text-emerald-400">AI Insight — </span>
            {insight.lead} <span className="font-semibold text-heading">{insight.highlight}</span> {insight.tail}{' '}
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">{insight.amount}</span> {insight.suffix}{' '}
            {insight.detail}
          </p>
        </div>
        <div className="shrink-0 pl-6 @sm:pl-0 @sm:text-right">
          <p className="text-xs text-ink-muted">Confidence</p>
          <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{insight.confidence}%</p>
          <DashProgress value={insight.confidence} />
        </div>
      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-1.5 border-t border-border pt-3 text-sm font-medium text-accent hover:underline"
      >
        View Collection Forecast <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </Card>
  )
}

function CashFlowChart({ points }: { points: CashFlowPoint[] }) {
  const width = 560
  const height = 180
  const pad = { top: 26, right: 12, bottom: 22, left: 12 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const max = Math.max(...points.map((p) => p.value)) * 1.2
  const n = points.length

  const xAt = (index: number) => pad.left + (index / (n - 1)) * plotW
  const yAt = (value: number) => pad.top + plotH - (value / max) * plotH

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(p.value)}`).join(' ')
  const areaPath = `${linePath} L${xAt(n - 1)},${pad.top + plotH} L${xAt(0)},${pad.top + plotH} Z`

  const forecastStart = points.findIndex((p) => p.forecast)
  const peakIndex = points.reduce((best, p, i) => (p.value > points[best].value ? i : best), 0)

  return (
    <div>
      {forecastStart !== -1 && (
        <div
          className="mb-1 flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
          style={{
            marginLeft: `${(xAt(forecastStart) / width) * 100}%`,
            marginRight: `${((width - xAt(n - 1)) / width) * 100}%`,
          }}
        >
          <span className="h-px flex-1 bg-emerald-500/40" />
          Forecast
          <span className="h-px flex-1 bg-emerald-500/40" />
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <defs>
          <linearGradient id="finpilot-cashflow-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity={0} />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#finpilot-cashflow-fill)" />
        <path d={linePath} fill="none" stroke="rgb(16 185 129)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {points.map((p, i) => {
          const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'
          return (
            <g key={p.date}>
              <circle cx={xAt(i)} cy={yAt(p.value)} r={i === peakIndex ? 4 : 3} fill="rgb(16 185 129)" />
              <text
                x={xAt(i)}
                y={yAt(p.value) - 10}
                textAnchor={anchor}
                fontSize={10}
                fontWeight={i === peakIndex ? 700 : 500}
                fill={i === peakIndex ? 'rgb(5 150 105)' : 'var(--color-heading)'}
              >
                ₹{p.value.toFixed(2)} Cr
              </text>
              <text x={xAt(i)} y={height - 8} textAnchor={anchor} fontSize={9} fill="var(--color-ink-muted)">
                {p.date}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="mt-0.5 flex justify-between text-[9px] text-ink-muted">
        {points.map((p) => (
          <span key={p.date} className={clsx(p.forecast && p.value === points[peakIndex].value && 'font-medium text-emerald-600 dark:text-emerald-400')}>
            {p.day}
          </span>
        ))}
      </div>
    </div>
  )
}

function CashFlowCard() {
  const { netInflow7d, vsPrevious7dPct, avgDailyInflow, bestDay, points, upcomingLargeInflows, insight } = cashFlowForecast

  return (
    <div className='space-y-4'>
      <CardHeader icon={<TrendingUp className="h-4 w-4" />} eyebrow="Fin Pilot" title="Predict Cash Flow" tone="success" />
      <Card className="flex min-w-0 flex-col gap-4 p-5">

        <div className="grid grid-cols-1 gap-5 @4xl:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0">
            <p className="mb-1 text-sm font-medium text-heading">7-Day Cash Flow Forecast</p>
            <CashFlowChart points={points} />
          </div>

          <div className="flex min-w-0 flex-col gap-4 @4xl:border-l @4xl:border-border @4xl:pl-5">
            <div>
              <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                Net Cash Inflow (Next 7 Days)
                <Info className="h-3.5 w-3.5" />
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-heading">{netInflow7d}</p>
              <p className="mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">↑ {vsPrevious7dPct}% vs Previous 7 Days</p>
            </div>

            <div className="grid grid-cols-3 gap-3 rounded-lg border border-border p-3">
              <div>
                <p className="text-[11px] text-ink-muted">Avg Daily Inflow</p>
                <p className="mt-0.5 text-sm font-semibold text-heading">{avgDailyInflow}</p>
              </div>
              <div>
                <p className="text-[11px] text-ink-muted">Best Day</p>
                <p className="mt-0.5 text-sm font-semibold text-heading">{bestDay.value}</p>
                <p className="text-[10px] text-ink-muted">{bestDay.label}</p>
              </div>
              <div>
                <p className="text-[11px] text-ink-muted">Large Inflows (7d)</p>
                <p className="mt-0.5 text-sm font-semibold text-heading">{upcomingLargeInflows}</p>
              </div>
            </div>

            <div className="flex min-w-0 items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p className="text-xs leading-relaxed text-ink-muted">
                <span className="font-medium text-accent">AI Insight — </span>
                {insight.lead}{' '}
                {insight.links.map((link, index) => (
                  <span key={link}>
                    <span className="font-medium text-accent">{link}</span>
                    {index < insight.links.length - 1 ? ' and ' : '.'}
                  </span>
                ))}{' '}
                {insight.detail}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-3 @sm:flex-row @sm:items-center @sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Target className="h-3.5 w-3.5" />
            Plan ahead and manage liquidity confidently.
          </p>
          <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            View Cash Flow Details <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </Card>
    </div>
  )
}

const revenueChartIcon: Record<RootCause['icon'], LucideIcon> = {
  users: Users,
  cart: ShoppingCart,
  clock: Clock,
  tag: Tag,
}

const iconToneClasses: Record<RootCause['iconTone'], string> = {
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
}

const badgeToneClasses: Record<RootCause['badgeTone'], string> = {
  danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
}

function RevenueTrendChart({ weeks, yMax }: { weeks: RevenueWeek[]; yMax: number }) {
  const width = 620
  const height = 240
  const pad = { top: 16, right: 8, bottom: 8, left: 30 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const n = weeks.length
  const groupW = plotW / n
  const barW = groupW * 0.26
  const gap = groupW * 0.06

  const yAt = (value: number) => pad.top + plotH - (value / yMax) * plotH
  const yTicks = Array.from({ length: yMax + 1 }, (_, i) => i)

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={yAt(tick)} y2={yAt(tick)} stroke="var(--color-border)" strokeWidth={1} />
            <text x={pad.left - 8} y={yAt(tick) + 3} textAnchor="end" fontSize={10} fill="var(--color-ink-muted)">
              {tick === 0 ? '0' : `${tick} Cr`}
            </text>
          </g>
        ))}

        {weeks.map((week, i) => {
          const groupX = pad.left + i * groupW
          const bar1X = groupX + groupW * 0.16
          const bar2X = bar1X + barW + gap
          const baseY = yAt(0)
          const curY = yAt(week.current)
          const prevY = yAt(week.previous)
          return (
            <g key={week.label}>
              <rect x={bar1X} y={curY} width={barW} height={baseY - curY} rx={3} fill="var(--color-accent)" />
              <text x={bar1X + barW / 2} y={curY - 8} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-heading)">
                ₹{week.current.toFixed(2)} Cr
              </text>
              <rect x={bar2X} y={prevY} width={barW} height={baseY - prevY} rx={3} fill="var(--color-border)" />
              <text x={bar2X + barW / 2} y={prevY - 8} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-heading)">
                ₹{week.previous.toFixed(2)} Cr
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex">
        {weeks.map((week) => (
          <div key={week.label} className="flex-1 text-center text-xs">
            <p className="font-medium text-heading">{week.label}</p>
            <p className="text-[11px] text-ink-muted">{week.range}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RevenueTrendCard() {
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  return (
    <Card className="bg-white rounded-md min-w-0 p-4">
      <div className="grid grid-cols-1 @4xl:grid-cols-2">
        <div className="min-w-0 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-1.5 text-base font-semibold text-heading">
              Revenue Trend
              <Info className="h-3.5 w-3.5 text-ink-muted" />
            </p>
          </div>

          <div className="mt-3 flex items-center gap-4 border-b border-border text-sm">
            <button
              type="button"
              onClick={() => setPeriod('week')}
              className={clsx('border-b-2 pb-2 font-medium transition', period === 'week' ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink')}
            >
              Week Wise
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={clsx('border-b-2 pb-2 font-medium transition', period === 'month' ? 'border-accent text-accent' : 'border-transparent text-ink-muted hover:text-ink')}
            >
              Month Wise
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2 @sm:flex-row @sm:items-center @sm:justify-between">
            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-accent" />
                {revenueTrend.currentLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full border-2 border-border" />
                {revenueTrend.previousLabel}
              </span>
            </div>
            <button type="button" className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink">
              {revenueTrend.unit}
              <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
            </button>
          </div>

          <div className="mt-4">
            <RevenueTrendChart weeks={revenueTrend.weeks} yMax={revenueTrend.yMax} />
          </div>

          {/* <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent/5 p-3 text-sm text-ink">
          <Sparkles className="h-4 w-4 shrink-0 text-accent" />
          {revenueTrend.insight}
        </div> */}
        </div>

        <div className="min-w-0 p-5">
          <p className="flex items-center gap-1.5 text-base font-semibold text-heading">
            AI Explanation
            <Sparkles className="h-4 w-4 text-accent" />
          </p>
          <p className="mt-1 text-sm text-ink-muted">{aiExplanation.subtitle}</p>

          <ul className="mt-4 space-y-4">
            {aiExplanation.causes.map((cause) => {
              const Icon = revenueChartIcon[cause.icon]
              return (
                <li key={cause.id} className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', iconToneClasses[cause.iconTone])}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-heading">{cause.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{cause.description}</p>
                    </div>
                  </div>
                  <span className={clsx('shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold', badgeToneClasses[cause.badgeTone])}>
                    {cause.delta}
                  </span>
                </li>
              )
            })}
          </ul>

        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 rounded-xl bg-accent/5 p-4 @lg:flex-row @lg:items-center @lg:justify-between">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-accent">
            <Sparkles className="h-3.5 w-3.5" />
            AI Recommendation
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink">{aiExplanation.recommendation}</p>
        </div>
        <button
          type="button"
          className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-content"
        >
          View Action Plan <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </Card>
  )
}

function RiskMatrixCard() {
  const { criticalAccountsCount, totalAtRiskCr, topAccount, insight, chart } = customerRiskMatrix

  return (
    <div className="space-y-4">
      <CardHeader icon={<AlertTriangle className="h-4 w-4" />} eyebrow="Fin Pilot" title="Customer Risk Matrix" tone="accent" />
      <Card className="flex min-w-0 flex-col gap-4 p-5">
        <div className="grid grid-cols-1 gap-5 @4xl:grid-cols-[1.3fr_1fr]">
          <div className="min-w-0">
            <p className="mb-1 text-sm font-medium text-heading">Outstanding Amount vs. Payment Delay</p>
            <RiskMatrixChart chart={chart} />
          </div>

          <div className="flex min-w-0 flex-col gap-4 @4xl:border-l @4xl:border-border @4xl:pl-5">
            <div>
              <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                Accounts in Critical Zone
                <Info className="h-3.5 w-3.5" />
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-heading">{criticalAccountsCount}</p>
              <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{totalAtRiskCr} at risk of non-payment</p>
            </div>

            <div className="rounded-lg border border-border p-3 text-xs">
              <p className="text-ink-muted">Top At-Risk Account</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-semibold text-heading">{topAccount.name}</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">{topAccount.outstanding}</span>
              </div>
              <p className="mt-0.5 text-ink-muted">{topAccount.delayDays} days past due</p>
            </div>

            <div className="flex min-w-0 items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <p className="text-xs leading-relaxed text-ink-muted">
                <span className="font-medium text-accent">AI Insight — </span>
                {insight.lead}{' '}
                {insight.links.map((link, index) => (
                  <span key={link}>
                    <span className="font-medium text-accent">{link}</span>
                    {index < insight.links.length - 1 ? ' and ' : '.'}
                  </span>
                ))}{' '}
                {insight.detail}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-3 @sm:flex-row @sm:items-center @sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <Target className="h-3.5 w-3.5" />
            Prioritize outreach for accounts sliding toward the critical zone.
          </p>
          <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-accent hover:underline">
            View Collections Plan <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </Card>
    </div>
  )
}

function CashFlowMiniCard() {
  return (
    <div className="space-y-4">
      <CardHeader icon={<TrendingUp className="h-4 w-4" />} eyebrow="Fin Pilot" title="Cash Flow Forecast" tone="success" />
      <Card className="min-w-0 p-5">
        <p className="mb-1 text-sm font-medium text-heading">7-Day Cash Flow Forecast</p>
        <CashFlowChart points={cashFlowForecast.points} />
      </Card>
    </div>
  )
}

function RevenueMiniCard() {
  return (
    <div className="space-y-4">
      <CardHeader icon={<LineChartIcon className="h-4 w-4" />} eyebrow="Fin Pilot" title="Revenue" tone="accent" />
      <Card className="min-w-0 p-5">
        <p className="mb-1 text-sm font-medium text-heading">Revenue Trend</p>
        <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {revenueTrend.currentLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border-2 border-border" />
            {revenueTrend.previousLabel}
          </span>
        </div>
        <RevenueTrendChart weeks={revenueTrend.weeks} yMax={revenueTrend.yMax} />
      </Card>
    </div>
  )
}

const trendSeriesColor = {
  outstanding: 'var(--color-chart-series-1)',
  delay: 'var(--color-chart-series-2)',
}

function OutstandingDelayTrendChart({ points }: { points: OutstandingDelayPoint[] }) {
  const width = 1200
  const height = 220
  const pad = { top: 16, right: 16, bottom: 22, left: 12 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const n = points.length
  const colW = plotW / n

  const outstandingBase = points[0].outstandingCr
  const delayBase = points[0].delayDays
  const outstandingIndex = points.map((p) => (p.outstandingCr / outstandingBase) * 100)
  const delayIndex = points.map((p) => (p.delayDays / delayBase) * 100)
  const max = Math.max(...outstandingIndex, ...delayIndex) * 1.1

  const xAt = (index: number) => pad.left + (index / (n - 1)) * plotW
  const yAt = (value: number) => pad.top + plotH - (value / max) * plotH
  const pathFor = (values: number[]) => values.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(v)}`).join(' ')

  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-4 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: trendSeriesColor.outstanding }} />
          {outstandingDelayTrend.outstandingSeriesLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: trendSeriesColor.delay }} />
          {outstandingDelayTrend.delaySeriesLabel}
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" onMouseLeave={() => setHoverIndex(null)}>
        <path d={pathFor(outstandingIndex)} fill="none" stroke={trendSeriesColor.outstanding} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={pathFor(delayIndex)} fill="none" stroke={trendSeriesColor.delay} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {hoverIndex !== null && (
          <line x1={xAt(hoverIndex)} x2={xAt(hoverIndex)} y1={pad.top} y2={pad.top + plotH} stroke="var(--color-chart-baseline)" strokeWidth={1} strokeDasharray="3 3" />
        )}

        {points.map((p, i) => (
          <g key={p.label}>
            <circle cx={xAt(i)} cy={yAt(outstandingIndex[i])} r={3} fill={trendSeriesColor.outstanding} />
            <circle cx={xAt(i)} cy={yAt(delayIndex[i])} r={3} fill={trendSeriesColor.delay} />
            <text x={xAt(i)} y={height - 6} textAnchor="middle" fontSize={9} fill="var(--color-ink-muted)">
              {p.label}
            </text>
            <rect
              x={xAt(i) - colW / 2}
              y={pad.top}
              width={colW}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
          </g>
        ))}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 min-w-[150px] -translate-x-1/2 rounded-lg border border-border bg-surface px-2.5 py-2 text-[11px] shadow-md"
          style={{ left: `${(xAt(hoverIndex!) / width) * 100}%`, top: 0 }}
        >
          <p className="mb-1 font-medium text-heading">{hovered.label}</p>
          <div className="space-y-0.5 text-ink-muted">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: trendSeriesColor.outstanding }} />
                Outstanding
              </span>
              <span className="font-medium text-heading">₹{hovered.outstandingCr.toFixed(1)} Cr</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: trendSeriesColor.delay }} />
                Delay
              </span>
              <span className="font-medium text-heading">{hovered.delayDays} days</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function OutstandingDelayTrendCard() {
  const { points, insight } = outstandingDelayTrend

  return (
    <div className="space-y-4">
      <CardHeader icon={<AlertTriangle className="h-4 w-4" />} eyebrow="Fin Pilot" title="Outstanding vs. Payment Delay Trend" tone="accent" />
      <Card className="flex min-w-0 flex-col gap-4 p-5">
        <div className="min-w-0">
          <p className="mb-1 text-sm font-medium text-heading">Outstanding Amount vs. Payment Delay Trend</p>
          <p className="mb-3 text-xs text-ink-muted">{outstandingDelayTrend.subtitle}</p>
          <OutstandingDelayTrendChart points={points} />
        </div>

        <div className="flex min-w-0 items-start gap-2 border-t border-border pt-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="text-xs leading-relaxed text-ink-muted">
            <span className="font-medium text-accent">AI Insight — </span>
            {insight.lead} <span className="font-semibold text-heading">{insight.highlight}</span>, {insight.tail}
          </p>
        </div>
      </Card>
    </div>
  )
}

function CashFlowVisualizationCard() {
  const { subtitle, color, legend, sources, destinations, links } = cashFlowVisualization

  return (
    <div className="space-y-4">
      <CardHeader icon={<TrendingUp className="h-4 w-4" />} eyebrow="Fin Pilot" title="Cash Flow Visualization" tone="success" />
      <Card className="min-w-0 p-5">
        <div className="flex flex-col gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-heading">Bank Receipts → Reconciliation Outcome</p>
            <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button type="button" variant="outline" size="sm">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Button>
            <IconButton aria-label="More options" className="h-8 w-8">
              <MoreVertical className="h-3.5 w-3.5" />
            </IconButton>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-ink-muted">
          {legend.map((item) => (
            <span key={item.id} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color, opacity: item.opacity }} />
              {item.label}
            </span>
          ))}
        </div>

        <div className="mt-4">
          <CashFlowSankeyChart color={color} sources={sources} destinations={destinations} links={links} />
        </div>
      </Card>
    </div>
  )
}

function StatsFilterBar() {
  return (
    <div className='bg-white p-3 rounded-md '>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <Button type="button" variant="accent-outline" size="xs">
            <Filter className="h-3.5 w-3.5" />
            Add Filter
          </Button>
          <Button type="button" variant="accent-outline" size="xs">
            <Users className="h-3.5 w-3.5" />
            Add Segment
          </Button>
          <span className="flex items-center gap-1.5 text-ink-muted">
            Data from &lt;1 min ago
            <RefreshCw className="h-3.5 w-3.5" />
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink">
            Daily
            <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink">
            <Calendar className="h-3.5 w-3.5 text-ink-muted" />
            Last 7 Days
            <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
          </button>
        </div>
      </div>
    </div>
  )
}

function StatTrendChart({ points }: { points: StatTrendPoint[] }) {
  const width = 1500
  const height = 260
  const pad = { top: 16, right: 12, bottom: 22, left: 34 }
  const plotW = width - pad.left - pad.right
  const plotH = height - pad.top - pad.bottom
  const n = points.length
  const yTicks = [0, 25, 50, 75, 100]

  const xAt = (index: number) => pad.left + (index / (n - 1)) * plotW
  const yAt = (value: number) => pad.top + plotH - (Math.min(value, 100) / 100) * plotH

  const projectedStart = points.findIndex((p) => p.projected)
  const solidPoints = projectedStart === -1 ? points : points.slice(0, projectedStart + 1)
  const dottedPoints = projectedStart === -1 ? [] : points.slice(projectedStart)

  const pathFor = (pts: StatTrendPoint[], offset: number) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${xAt(i + offset)},${yAt(p.value)}`).join(' ')

  const solidPath = pathFor(solidPoints, 0)
  const dottedPath = dottedPoints.length ? pathFor(dottedPoints, projectedStart) : ''

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={yAt(tick)} y2={yAt(tick)} stroke="var(--color-border)" strokeWidth={1} strokeDasharray="3 3" />
            <text x={pad.left - 8} y={yAt(tick) + 3} textAnchor="end" fontSize={10} fill="var(--color-ink-muted)">
              {tick}
            </text>
          </g>
        ))}

        <path d={solidPath} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {dottedPath && (
          <path d={dottedPath} fill="none" stroke="var(--color-accent)" strokeWidth={2} strokeDasharray="2 4" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {points.map((p, i) => (
          <circle key={p.date} cx={xAt(i)} cy={yAt(p.value)} r={2.5} fill="var(--color-accent)" />
        ))}

        {points.map((p, i) => {
          const anchor = i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'
          return (
            <text key={p.date} x={xAt(i)} y={height - 6} textAnchor={anchor} fontSize={9} fill="var(--color-ink-muted)">
              {p.date}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

function StatTrendPanel({ stat }: { stat: FinPilotStat }) {
  return (
    <div className="">
      <div className="flex items-center justify-end gap-2">
        <button type="button" className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-ink">
          <LineChartIcon className="h-3.5 w-3.5 text-ink-muted" />
          Line Chart
          <ChevronDown className="h-3.5 w-3.5 text-ink-muted" />
        </button>
        <IconButton aria-label="Expand chart" className="h-8 w-8">
          <Maximize2 className="h-3.5 w-3.5" />
        </IconButton>
      </div>
      <StatTrendChart points={stat.trend} />
      <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
        <span className="h-2 w-2 rounded-full bg-accent" />
        {stat.label}
      </div>
    </div>
  )
}

export function FinPilotPage() {
  const [selectedStatId, setSelectedStatId] = useState(finPilotStats[0].id)
  const selectedStat = finPilotStats.find((stat) => stat.id === selectedStatId) ?? finPilotStats[0]

  return (
    <section className="@container space-y-4">
      <StatsFilterBar />
      <div className="space-y-3 rounded-xl bg-surface p-4 border border-border">
        <div className="scrollbar-hide flex gap-3 overflow-x-auto">
          {finPilotStats.map((stat) => {
            const selected = stat.id === selectedStatId
            return (
              <button
                key={stat.id}
                type="button"
                onClick={() => setSelectedStatId(stat.id)}
                className={clsx(
                  'min-w-[200px] flex-1 shrink-0 basis-[200px] rounded-lg border px-3 py-2 text-left transition',
                  selected ? 'border-accent bg-accent/5' : 'border-border hover:bg-surface-hover',
                )}
              >
                <span className="truncate text-sm text-ink-muted">{stat.label}</span>
                <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="whitespace-nowrap text-2xl font-normal text-heading">{stat.value}</p>
                  {stat.tone !== 'flat' ? (
                    <span
                      className={clsx(
                        'flex items-center gap-0.5 whitespace-nowrap text-xs font-semibold',
                        stat.tone === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                      )}
                    >
                      <span aria-hidden className="text-[9px]">{stat.tone === 'up' ? '▲' : '▼'}</span>
                      {stat.sublabel}
                    </span>
                  ) : (
                    <span className="whitespace-nowrap text-xs text-ink-muted">{stat.sublabel}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <StatTrendPanel stat={selectedStat} />
      </div>

      {/* <CashFlowCard />
      <RevenueTrendCard />

      <div className="">
        <RiskMatrixCard />
      </div> */}

      <CashFlowVisualizationCard />
    </section>
  )
}
