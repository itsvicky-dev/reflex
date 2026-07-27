import { clsx } from 'clsx'
import {
  ChevronRight,
  CreditCard,
  FileWarning,
  Grid3x3,
  Handshake,
  HeartPulse,
  History,
  LayoutDashboard,
  ListChecks,
  MessageCircle,
  Percent,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, type BadgeTone } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { customerDirectory, customerHealthTier, type CustomerHealthTier } from '../data/mockCustomerDirectory'
import {
  aiExecutiveSummary,
  businessRelationship,
  customerOverviewProfile,
  customerOverviewStats,
  financialHealth,
  invoiceDisputes,
  paymentBehaviorHeatMap,
  paymentBehaviorMonths,
  paymentBehaviorStats,
  paymentHistory,
  recommendedActions,
  revenueTrend,
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
  const gradientId = `overview-spark-${colorVar.replace(/[^a-z0-9]/gi, '')}-${height}`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="h-11 w-full" style={{ height }}>
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

const REVENUE_CHART_WIDTH = 640
const REVENUE_CHART_HEIGHT = 200
const REVENUE_CHART_PAD = { top: 16, right: 12, bottom: 24, left: 40 }

function RevenueTrendChart({ months, points }: { months: string[]; points: number[] }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const plotW = REVENUE_CHART_WIDTH - REVENUE_CHART_PAD.left - REVENUE_CHART_PAD.right
  const plotH = REVENUE_CHART_HEIGHT - REVENUE_CHART_PAD.top - REVENUE_CHART_PAD.bottom
  const n = points.length

  const dataMin = Math.min(...points)
  const dataMax = Math.max(...points)
  const niceMin = Math.floor(dataMin / 10) * 10
  const niceMax = Math.ceil(dataMax / 10) * 10
  const step = (niceMax - niceMin) / 4 || 10
  const yTicks = [0, 1, 2, 3, 4].map((i) => niceMin + step * i)

  const xAt = (i: number) => REVENUE_CHART_PAD.left + (i / (n - 1)) * plotW
  const yAt = (v: number) => REVENUE_CHART_PAD.top + plotH - ((v - niceMin) / (niceMax - niceMin || 1)) * plotH

  const linePath = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(v)}`).join(' ')
  const baseline = REVENUE_CHART_PAD.top + plotH
  const areaPath = `${linePath} L${xAt(n - 1)},${baseline} L${xAt(0)},${baseline} Z`

  const xTickIndexes = Array.from(new Set([0, 3, 6, 9, n - 1])).filter((i) => i < n)

  function handlePointerMove(event: React.PointerEvent<SVGRectElement>) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const localX = ((event.clientX - rect.left) / rect.width) * REVENUE_CHART_WIDTH
    const ratio = (localX - REVENUE_CHART_PAD.left) / plotW
    const index = Math.round(ratio * (n - 1))
    setHoverIndex(Math.min(n - 1, Math.max(0, index)))
  }

  const hovered = hoverIndex !== null ? { i: hoverIndex, month: months[hoverIndex], value: points[hoverIndex] } : null
  const lastIndex = n - 1

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${REVENUE_CHART_WIDTH} ${REVENUE_CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-[170px] w-full"
      >
        <defs>
          <linearGradient id="revenue-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-good)" stopOpacity={0.16} />
            <stop offset="100%" stopColor="var(--color-chart-good)" stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={REVENUE_CHART_PAD.left}
              x2={REVENUE_CHART_WIDTH - REVENUE_CHART_PAD.right}
              y1={yAt(tick)}
              y2={yAt(tick)}
              stroke="var(--color-chart-grid)"
              strokeWidth={1}
            />
            <text x={REVENUE_CHART_PAD.left - 8} y={yAt(tick) + 3} textAnchor="end" fontSize={9} fill="var(--color-ink-muted)">
              ₹{tick}L
            </text>
          </g>
        ))}

        {xTickIndexes.map((i) => (
          <text key={i} x={xAt(i)} y={REVENUE_CHART_HEIGHT - 6} textAnchor="middle" fontSize={9} fill="var(--color-ink-muted)">
            {months[i]}
          </text>
        ))}

        <path d={areaPath} fill="url(#revenue-trend-fill)" />
        <path d={linePath} fill="none" stroke="var(--color-chart-good)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        <circle cx={xAt(lastIndex)} cy={yAt(points[lastIndex])} r={5} fill="var(--color-chart-good)" stroke="var(--color-surface)" strokeWidth={2} />
        <text x={xAt(lastIndex) - 8} y={yAt(points[lastIndex]) - 10} textAnchor="end" fontSize={10} fontWeight={600} fill="var(--color-heading)">
          ₹{points[lastIndex]}L
        </text>

        {hovered && hovered.i !== lastIndex && (
          <>
            <line
              x1={xAt(hovered.i)}
              x2={xAt(hovered.i)}
              y1={REVENUE_CHART_PAD.top}
              y2={baseline}
              stroke="var(--color-chart-baseline)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            <circle cx={xAt(hovered.i)} cy={yAt(hovered.value)} r={5} fill="var(--color-chart-good)" stroke="var(--color-surface)" strokeWidth={2} />
          </>
        )}

        <rect
          x={REVENUE_CHART_PAD.left}
          y={0}
          width={plotW}
          height={REVENUE_CHART_HEIGHT}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={() => setHoverIndex(null)}
        />
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 min-w-[100px] -translate-x-1/2 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[11px] shadow-md"
          style={{
            left: `${(xAt(hovered.i) / REVENUE_CHART_WIDTH) * 100}%`,
            top: `${Math.max(0, (yAt(hovered.value) / REVENUE_CHART_HEIGHT) * 100 - 22)}%`,
          }}
        >
          <p className="text-ink-muted">{hovered.month}</p>
          <p className="font-semibold text-heading">₹{hovered.value}L</p>
        </div>
      )}
    </div>
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

const paymentStatusTone: Record<string, BadgeTone> = {
  Cleared: 'success',
  Pending: 'warning',
  Failed: 'danger',
}

const disputeStatusTone: Record<string, BadgeTone> = {
  Open: 'danger',
  'Under Review': 'warning',
  Resolved: 'success',
}

const tierLabel: Record<CustomerHealthTier, string> = {
  healthy: 'Healthy',
  watch: 'Watch',
  critical: 'Critical',
}

const tierBadgeTone: Record<CustomerHealthTier, BadgeTone> = {
  healthy: 'success',
  watch: 'warning',
  critical: 'danger',
}

const tierStripGradient: Record<CustomerHealthTier, string> = {
  healthy: 'from-emerald-500/10 via-emerald-500/0 to-transparent',
  watch: 'from-amber-500/10 via-amber-500/0 to-transparent',
  critical: 'from-rose-500/10 via-rose-500/0 to-transparent',
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

const sgd = (value: number) => `SGD ${value.toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

function StripStat({ label, value, tone }: { label: string; value: string; tone?: 'danger' }) {
  return (
    <div>
      <p className="text-[11px] text-ink-muted">{label}</p>
      <p className={clsx('mt-0.5 text-sm font-semibold tabular-nums', tone === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-heading')}>{value}</p>
    </div>
  )
}

const sections = [
  { id: 'summary', label: 'Summary', icon: LayoutDashboard },
  { id: 'recommended-actions', label: 'Recommended Actions', icon: ListChecks },
  { id: 'ai-summary', label: 'AI Executive Summary', icon: Sparkles },
  { id: 'financial-health', label: 'Financial Health', icon: HeartPulse },
  { id: 'risk-assessment', label: 'Risk Assessment', icon: ShieldCheck },
  { id: 'business-relationship', label: 'Business Relationship', icon: Handshake },
  { id: 'revenue-trend', label: 'Revenue Trend', icon: TrendingUp },
  { id: 'payment-history', label: 'Payment History', icon: History },
  { id: 'payment-behavior', label: 'Payment Behavior', icon: Grid3x3 },
  { id: 'invoice-disputes', label: 'Invoice Disputes', icon: FileWarning },
] as const

type SectionId = (typeof sections)[number]['id']

function SectionNav({ activeId, onNavigate }: { activeId: SectionId; onNavigate: (id: SectionId) => void }) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 @4xl:flex-col @4xl:overflow-visible @4xl:pb-0">
      {sections.map((section) => {
        const Icon = section.icon
        const active = activeId === section.id
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => onNavigate(section.id)}
            className={clsx(
              'flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-xs font-medium transition @4xl:w-full',
              active ? 'bg-accent/10 text-accent' : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {section.label}
          </button>
        )
      })}
    </nav>
  )
}

export function CustomerOverviewPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const customer = useMemo(() => customerDirectory.find((c) => c.id === customerId), [customerId])
  const tier: CustomerHealthTier = customer ? customerHealthTier(customer.healthScore) : 'healthy'

  const displayName = customer?.name ?? customerOverviewProfile.name
  const badgeLabel = customer ? `${customer.segment} · ${customer.type}` : customerOverviewProfile.badge
  const accountManagerName = customer?.accountManager ?? customerOverviewProfile.accountManager
  const industry = customer?.type ?? customerOverviewProfile.industry
  const businessUnit = customer ? `${customer.segment} Accounts` : customerOverviewProfile.businessUnit
  const relationshipSince = customer?.customerSince ?? customerOverviewProfile.relationshipSince
  const customerIdLabel = customer?.code ?? customerOverviewProfile.customerId
  const healthScore = customer?.healthScore ?? financialHealth.score
  const outstandingDisplay = customer ? sgd(customer.outstanding) : customerOverviewStats.outstandingBalance
  const overdueDisplay = customer ? (customer.overdueAmount > 0 ? sgd(customer.overdueAmount) : '—') : '—'
  const upcomingDisplay = customer ? (customer.upcomingAmount > 0 ? sgd(customer.upcomingAmount) : '—') : customerOverviewStats.availableCredit

  const profileCardRef = useRef<HTMLDivElement>(null)
  const [profileCardHeight, setProfileCardHeight] = useState(0)

  useEffect(() => {
    const el = profileCardRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => setProfileCardHeight(entries[0].contentRect.height))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const [activeSection, setActiveSection] = useState<SectionId>('summary')

  useEffect(() => {
    setActiveSection('summary')
    document.querySelector('main')?.scrollTo({ top: 0 })
  }, [customerId])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting)
        if (visible.length === 0) return
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b))
        setActiveSection(topMost.target.id as SectionId)
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    )
    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function goToSection(id: SectionId) {
    setActiveSection(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="@container space-y-4">
      {/* <div className="flex flex-col gap-1 @lg:flex-row @lg:items-center @lg:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-heading">Customer 360</h1>
          <p className="mt-0.5 text-xs text-ink-muted">
            <Link to="/customer-intelligence/customers" className="hover:text-ink hover:underline">
              Customers
            </Link>{' '}
            / {displayName}
          </p>
        </div>
        <Button variant="white" size="sm">
          Actions
        </Button>
      </div> */}

      {/* Masks the scroll container's own top padding so content scrolling underneath the sticky card below can't peek through that gap. */}
      <div className="sticky -top-6 -mx-6 -mt-6 h-6 bg-app-bg" aria-hidden />

      <Card
        ref={profileCardRef}
        className={clsx('sticky top-0 z-20 min-w-0 overflow-hidden bg-gradient-to-br p-5 shadow-md', tierStripGradient[tier])}
      >
        <div className="relative flex flex-col gap-4 @2xl:flex-row @2xl:items-center @2xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-base font-bold text-white">
              {initials(displayName)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-heading">{displayName}</h2>
                <Badge tone="neutral">{badgeLabel}</Badge>
                <Badge tone={tierBadgeTone[tier]}>{tierLabel[tier]}</Badge>
              </div>
              <p className="mt-1 truncate text-xs text-ink-muted">
                {customerIdLabel}
                {customer && ` · ${customer.city}`} · Managed by {accountManagerName}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 @lg:grid-cols-4 @2xl:shrink-0">
            <StripStat label="Health Score" value={`${healthScore}%`} />
            <StripStat label="Outstanding" value={outstandingDisplay} />
            <StripStat label="Overdue" value={overdueDisplay} tone={overdueDisplay !== '—' ? 'danger' : undefined} />
            <StripStat label="Upcoming" value={upcomingDisplay} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 @4xl:grid-cols-[220px_minmax(0,1fr)] @4xl:items-start">
        <div
          className="min-w-0 p-2 @4xl:sticky"
          style={{ top: profileCardHeight ? profileCardHeight + 44 : 136 }}
        >
          <SectionNav activeId={activeSection} onNavigate={goToSection} />
        </div>

        <div className="min-w-0 space-y-4">
          <Card id="summary" className="min-w-0 scroll-mt-6 p-5">
            <SectionHeading title="Summary" />
            <div className="mt-4 grid grid-cols-1 gap-6 @3xl:grid-cols-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs @lg:grid-cols-3 @3xl:grid-cols-2">
                <div>
                  <p className="text-ink-muted">Industry</p>
                  <p className="mt-0.5 font-medium text-heading">{industry}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Business Unit</p>
                  <p className="mt-0.5 font-medium text-heading">{businessUnit}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Account Manager</p>
                  <p className="mt-0.5 font-medium text-heading">{accountManagerName}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Customer ID</p>
                  <p className="mt-0.5 font-medium text-heading">{customerIdLabel}</p>
                </div>
                <div>
                  <p className="text-ink-muted">Relationship Since</p>
                  <p className="mt-0.5 font-medium text-heading">{relationshipSince}</p>
                </div>
                <div>
                  <p className="text-ink-muted">GSTIN</p>
                  <p className="mt-0.5 font-medium text-heading">{customerOverviewProfile.gstin}</p>
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
                  <p className="mt-0.5 text-base font-semibold text-heading">{outstandingDisplay}</p>
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

          <Card id="recommended-actions" className="min-w-0 scroll-mt-6 p-5">
            <SectionHeading title="Recommended Actions" />
            <div className="mt-3 grid grid-cols-1 gap-2 @lg:grid-cols-2">
              {recommendedActions.map((action) => {
                const Icon = actionIcon[action.icon]
                return (
                  <button
                    key={action.id}
                    type="button"
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left transition hover:bg-surface-hover"
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
                )
              })}
            </div>
          </Card>

          <Card id="ai-summary" className="min-w-0 scroll-mt-6 p-5">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-heading">
              <Sparkles className="h-4 w-4 text-accent" /> AI Executive Summary
            </p>
            <div className="my-3 space-y-3 text-sm leading-relaxed text-ink">
              {aiExecutiveSummary.paragraphs.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-1.5 border-t border-border pt-3 text-[11px] text-ink-muted">
              <Sparkles className="h-3 w-3" /> {aiExecutiveSummary.generatedBy}
              <span className="text-ink-muted/70">· {aiExecutiveSummary.generatedAt}</span>
            </p>
          </Card>

          <Card id="financial-health" className="min-w-0 scroll-mt-6 p-5">
            <SectionHeading title="Financial Health" />
            <div className="mt-4 grid grid-cols-1 gap-6 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="flex items-center gap-4">
                <RadialGauge value={financialHealth.score} colorClass="text-emerald-500">
                  <span className="text-xl font-semibold text-heading">{financialHealth.score}</span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{financialHealth.status}</span>
                </RadialGauge>
                <div className="min-w-0 flex-1 space-y-3">
                  <MetricBar label="Credit Utilization" value={financialHealth.creditUtilization} colorClass="bg-amber-400" />
                  <MetricBar label="Collection Efficiency" value={financialHealth.collectionEfficiency} colorClass="bg-emerald-500" />
                </div>
              </div>

              <div className="divide-y divide-border border-t border-border @3xl:border-l @3xl:border-t-0 @3xl:pl-6">
                <InfoRow label="DSO (Days Sales Outstanding)" value={`${financialHealth.dsoDays} Days`} />
                <InfoRow label="Payment Discipline" value={financialHealth.paymentDiscipline} />
                <div className="flex items-center justify-between gap-3 py-2 text-xs">
                  <span className="text-ink-muted">Revenue Trend (YoY)</span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3" /> {financialHealth.revenueTrendYoY}%
                  </span>
                </div>
                <InfoRow label="Cash Contribution" value={financialHealth.cashContribution} />
                <InfoRow label="Profitability Indicator" value={financialHealth.profitabilityIndicator} />
              </div>
            </div>
          </Card>

          <Card id="risk-assessment" className="min-w-0 scroll-mt-6 p-5">
            <div className="flex items-center justify-between gap-2">
              <SectionHeading title="Risk Assessment" />
              <Badge tone="success">{riskAssessment.riskLevel}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4">
              <RadialGauge value={riskAssessment.aiRiskScore} colorClass="text-emerald-500">
                <span className="text-xl font-semibold text-heading">{riskAssessment.aiRiskScore}</span>
                <span className="text-[10px] text-ink-muted">/100</span>
                <span className="mt-0.5 text-[10px] text-ink-muted">AI Risk Score</span>
              </RadialGauge>
              <div className="flex min-w-[200px] flex-1 flex-wrap gap-x-8 gap-y-4">
                <StatTile label="Credit Score" value={`${riskAssessment.creditScore}`} value2="/ 900" />
                <StatTile label="Risk Trend (6M)" value={riskAssessment.riskTrend6M} />
                <StatTile label="Days Past Due" value={`${riskAssessment.daysPastDue}`} value2="Days" />
                <StatTile label="Next Review" value={riskAssessment.nextReviewDate} />
              </div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-x-6 divide-y divide-border border-t border-border @lg:grid-cols-3 @lg:divide-y-0">
              <InfoRow label="Default Probability" value={riskAssessment.defaultProbability} />
              <InfoRow label="Late Payment Trend (3M)" value={riskAssessment.latePaymentTrend3M} />
              <InfoRow label="Credit Exposure" value={riskAssessment.creditExposure} />
              <InfoRow
                label="Dispute History"
                value={riskAssessment.disputeHistoryAmount}
                sublabel={`(${riskAssessment.disputeHistoryOpenCount} Open)`}
              />
              <InfoRow label="External Market Risk" value={riskAssessment.externalMarketRisk} />
              <InfoRow label="Portfolio Concentration" value={riskAssessment.portfolioConcentration} />
              <InfoRow label="Guarantor Coverage" value={riskAssessment.guarantorCoverage} />
              <InfoRow label="Customer Since" value={relationshipSince} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="text-xs text-ink-muted">Key Risk Factors</span>
              {riskAssessment.keyRiskFactors.map((factor) => (
                <Badge key={factor} tone="warning">
                  {factor}
                </Badge>
              ))}
            </div>
          </Card>

          <Card id="business-relationship" className="min-w-0 scroll-mt-6 p-5">
            <SectionHeading title="Business Relationship" />
            <div className="mt-4 grid grid-cols-1 gap-x-6 @2xl:grid-cols-2">
              <div className="flex items-center justify-between gap-3 border-b border-border py-2.5 text-xs @2xl:col-span-2">
                <span className="flex items-center gap-2 text-ink-muted">
                  <Handshake className="h-3.5 w-3.5" /> Total Business Value
                </span>
                <span className="font-semibold text-heading">{businessRelationship.totalBusinessValue}</span>
              </div>
              <div className="divide-y divide-border @2xl:border-r @2xl:border-border @2xl:pr-6">
                <InfoRow label="Total Invoices Raised" value={businessRelationship.totalInvoicesRaised} />
                <InfoRow label="Total Collections" value={businessRelationship.totalCollections} />
                <InfoRow label="Active Contracts" value={businessRelationship.activeContracts} />
              </div>
              <div className="divide-y divide-border @2xl:pl-6">
                <InfoRow label="Products / Services" value={businessRelationship.productsServices} />
                <InfoRow label="Avg. Monthly Billing" value={businessRelationship.avgMonthlyBilling} />
                <InfoRow label="Customer Lifetime Value" value={businessRelationship.customerLifetimeValue} />
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full justify-between">
              View Relationship Details <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Card>

          <Card id="revenue-trend" className="min-w-0 scroll-mt-6 p-5">
            <div className="flex items-center justify-between gap-2">
              <SectionHeading title="Revenue Trend" />
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" /> {revenueTrend.yoyGrowth}% YoY
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-6 @3xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] @3xl:items-start">
              <div>
                <RevenueTrendChart months={revenueTrend.months} points={revenueTrend.points} />
                <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4">
                  <StatTile label="Current Year" value={revenueTrend.currentYearTotal} />
                  <StatTile label="Previous Year" value={revenueTrend.previousYearTotal} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border p-3">
                {revenueTrend.quarters.map((q) => (
                  <StatTile key={q.label} label={q.label} value={q.value} deltaLabel={q.deltaLabel} />
                ))}
              </div>
            </div>
          </Card>

          <Card id="payment-history" className="min-w-0 scroll-mt-6 p-5">
            <SectionHeading title="Payment History" />
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                    <th className="py-2 pr-3">Date</th>
                    <th className="py-2 pr-3">Invoice No.</th>
                    <th className="py-2 pr-3">Amount</th>
                    <th className="py-2 pr-3">Method</th>
                    <th className="py-2 pr-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paymentHistory.map((payment) => (
                    <tr key={payment.id}>
                      <td className="py-2.5 pr-3 text-ink-muted">{payment.date}</td>
                      <td className="py-2.5 pr-3 font-medium text-heading">{payment.invoiceNo}</td>
                      <td className="py-2.5 pr-3 font-semibold tabular-nums text-heading">{payment.amount}</td>
                      <td className="py-2.5 pr-3 text-ink-muted">{payment.method}</td>
                      <td className="py-2.5 pr-3 text-right">
                        <Badge tone={paymentStatusTone[payment.status]}>{payment.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card id="payment-behavior" className="min-w-0 scroll-mt-6 p-5">
            <SectionHeading title="Payment Behavior" />
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

          <Card id="invoice-disputes" className="min-w-0 scroll-mt-6 p-5">
            <div className="flex items-center justify-between gap-2">
              <SectionHeading title="Invoice Disputes" />
              <span className="text-xs text-ink-muted">
                {riskAssessment.disputeHistoryOpenCount} Open · {riskAssessment.disputeHistoryAmount} Total
              </span>
            </div>
            {invoiceDisputes.length === 0 ? (
              <p className="mt-4 py-6 text-center text-sm text-ink-muted">No invoice disputes on record.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] font-medium uppercase tracking-wide text-ink-muted">
                      <th className="py-2 pr-3">Invoice No.</th>
                      <th className="py-2 pr-3">Amount</th>
                      <th className="py-2 pr-3">Reason</th>
                      <th className="py-2 pr-3">Raised On</th>
                      <th className="py-2 pr-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {invoiceDisputes.map((dispute) => (
                      <tr key={dispute.id}>
                        <td className="py-2.5 pr-3 font-medium text-heading">{dispute.invoiceNo}</td>
                        <td className="py-2.5 pr-3 font-semibold tabular-nums text-heading">{dispute.amount}</td>
                        <td className="py-2.5 pr-3 text-ink-muted">{dispute.reason}</td>
                        <td className="py-2.5 pr-3 text-ink-muted">{dispute.raisedOn}</td>
                        <td className="py-2.5 pr-3 text-right">
                          <Badge tone={disputeStatusTone[dispute.status]}>{dispute.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  )
}
