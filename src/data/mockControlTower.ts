import {
  AlertTriangle,
  Banknote,
  Bot,
  FileText,
  Globe2,
  Landmark,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { BadgeTone } from '../components/ui/Badge'

export type LogCategory =
  | 'insight'
  | 'reconciliation'
  | 'risk'
  | 'cashflow'
  | 'invoices'
  | 'market'
  | 'agent'
  | 'collections'
  | 'alert'
  | 'recommendation'

export type ControlTowerTab = {
  value: 'all' | LogCategory
  label: string
  icon: LucideIcon
}

export const controlTowerTabs: ControlTowerTab[] = [
  { value: 'all', label: 'AI Activities', icon: Sparkles },
  { value: 'insight', label: 'AI Insights', icon: Bot },
  { value: 'collections', label: 'Collections', icon: Banknote },
  { value: 'invoices', label: 'Invoices', icon: FileText },
  { value: 'reconciliation', label: 'Reconciliation', icon: Landmark },
  { value: 'risk', label: 'Customer Risk', icon: Users },
  { value: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
  { value: 'market', label: 'Market Intelligence', icon: Globe2 },
  { value: 'agent', label: 'AI Agents', icon: Bot },
  { value: 'alert', label: 'Alerts', icon: AlertTriangle },
  { value: 'recommendation', label: 'Recommendations', icon: Target },
]

export const categoryIcon: Record<LogCategory, LucideIcon> = {
  insight: Sparkles,
  reconciliation: Landmark,
  risk: Users,
  cashflow: TrendingUp,
  invoices: FileText,
  market: Globe2,
  agent: Bot,
  collections: Banknote,
  alert: AlertTriangle,
  recommendation: Target,
}

export const categoryLabel: Record<LogCategory, string> = {
  insight: 'Insight',
  reconciliation: 'Reconciliation',
  risk: 'High Risk',
  cashflow: 'Cash Flow',
  invoices: 'Invoices',
  market: 'Market Intel',
  agent: 'AI Agent',
  collections: 'Collections',
  alert: 'Alert',
  recommendation: 'Recommendation',
}

export type ControlTowerLog = {
  id: string
  time: string
  category: LogCategory
  title: string
  description: string
}

export type ProbabilityTier = 'most-likely' | 'likely' | 'not-expected'

export const probabilityLabel: Record<ProbabilityTier, string> = {
  'most-likely': 'Most Likely',
  likely: 'Likely',
  'not-expected': 'Not Expected',
}

export const probabilityDotClass: Record<ProbabilityTier, string> = {
  'most-likely': 'bg-emerald-500',
  likely: 'bg-amber-500',
  'not-expected': 'bg-rose-500',
}

export const probabilityTone: Record<ProbabilityTier, BadgeTone> = {
  'most-likely': 'success',
  likely: 'warning',
  'not-expected': 'danger',
}

export type ReceivableRow = {
  id: string
  customer: string
  invoiceRef: string
  bucket: string
  date: string
  day: string
  value: number
  probability: ProbabilityTier
}

export const dueNextWeekReceivables: ReceivableRow[] = [
  { id: 'due-1', customer: 'ABC Industries', invoiceRef: 'INV-10234', bucket: '0-3 days', date: '24 Jul', day: 'Fri', value: 0.62, probability: 'most-likely' },
  { id: 'due-2', customer: 'XYZ Corp', invoiceRef: 'INV-10241', bucket: '0-3 days', date: '24 Jul', day: 'Fri', value: 0.38, probability: 'most-likely' },
  { id: 'due-3', customer: 'Reliance Traders', invoiceRef: 'INV-10256', bucket: '4-7 days', date: '25 Jul', day: 'Sat', value: 0.45, probability: 'likely' },
  { id: 'due-4', customer: 'Sterling Textiles', invoiceRef: 'INV-10262', bucket: '4-7 days', date: '26 Jul', day: 'Sun', value: 0.71, probability: 'most-likely' },
  { id: 'due-5', customer: 'Om Enterprises', invoiceRef: 'INV-10270', bucket: '4-7 days', date: '27 Jul', day: 'Mon', value: 0.29, probability: 'not-expected' },
  { id: 'due-6', customer: 'Kumar & Sons', invoiceRef: 'INV-10281', bucket: '4-7 days', date: '28 Jul', day: 'Tue', value: 0.54, probability: 'likely' },
  { id: 'due-7', customer: 'Vertex Logistics', invoiceRef: 'INV-10288', bucket: '4-7 days', date: '29 Jul', day: 'Wed', value: 0.82, probability: 'most-likely' },
  { id: 'due-8', customer: 'Bharat Steel Co.', invoiceRef: 'INV-10295', bucket: '4-7 days', date: '30 Jul', day: 'Thu', value: 0.36, probability: 'likely' },
]

export const overdueReceivables: ReceivableRow[] = [
  { id: 'od-1', customer: 'Nova Chemicals', invoiceRef: 'INV-09871', bucket: '1-15 days', date: '15 Jul', day: 'Wed', value: 0.48, probability: 'likely' },
  { id: 'od-2', customer: 'Krishna Motors', invoiceRef: 'INV-09880', bucket: '1-15 days', date: '17 Jul', day: 'Fri', value: 0.33, probability: 'most-likely' },
  { id: 'od-3', customer: 'ABC Industries', invoiceRef: 'INV-09802', bucket: '16-30 days', date: '05 Jul', day: 'Sun', value: 0.91, probability: 'not-expected' },
  { id: 'od-4', customer: 'Global Freight', invoiceRef: 'INV-09795', bucket: '16-30 days', date: '02 Jul', day: 'Thu', value: 0.27, probability: 'likely' },
  { id: 'od-5', customer: 'Sunrise Apparel', invoiceRef: 'INV-09710', bucket: '31-45 days', date: '18 Jun', day: 'Thu', value: 0.58, probability: 'not-expected' },
  { id: 'od-6', customer: 'Metro Pharma', invoiceRef: 'INV-09688', bucket: '31-45 days', date: '12 Jun', day: 'Fri', value: 0.4, probability: 'likely' },
  { id: 'od-7', customer: 'Orion Plastics', invoiceRef: 'INV-09602', bucket: '46-60 days', date: '28 May', day: 'Thu', value: 0.22, probability: 'not-expected' },
]

export const controlTowerLogs: ControlTowerLog[] = [
  {
    id: 'log-1',
    time: '09:32 AM',
    category: 'insight',
    title: 'FinPilot Prediction Updated',
    description: 'Predicted collections for today increased by ₹2.80 Cr based on confirmed customer payments.',
  },
  {
    id: 'log-2',
    time: '09:31 AM',
    category: 'reconciliation',
    title: 'Reconciliation Completed',
    description: 'AI reconciled 146 bank transactions across 4 accounts with 98.6% accuracy.',
  },
  {
    id: 'log-3',
    time: '09:28 AM',
    category: 'risk',
    title: 'Customer Risk Changed',
    description: 'ABC Industries moved from Amber to Red. Risk score increased from 62 to 87.',
  },
  {
    id: 'log-4',
    time: '09:25 AM',
    category: 'cashflow',
    title: 'Cash Flow Forecast Updated',
    description: 'Cash flow forecast reduced by ₹42 Lakhs for this week due to delayed customer payments.',
  },
  {
    id: 'log-5',
    time: '09:22 AM',
    category: 'invoices',
    title: 'Invoices Entered Priority Queue',
    description: '18 invoices worth ₹1.62 Cr entered Priority Queue due to aging and payment risk.',
  },
  {
    id: 'log-6',
    time: '09:18 AM',
    category: 'market',
    title: 'Market Intelligence Alert',
    description: 'Steel industry slowdown detected in key regions. Impacting 6 of your active customers.',
  },
  {
    id: 'log-7',
    time: '09:15 AM',
    category: 'agent',
    title: 'AI Agent Execution',
    description: 'Collection Agent completed follow-ups for 62 customers. 12 commitments received.',
  },
  {
    id: 'log-8',
    time: '09:05 AM',
    category: 'collections',
    title: 'Collections Milestone Reached',
    description: "Today's collections crossed ₹4.82 Cr, 12% higher than yesterday.",
  },
  {
    id: 'log-9',
    time: '08:58 AM',
    category: 'alert',
    title: 'Critical Alert Raised',
    description: '7 transactions flagged for manual review due to mismatched reference IDs.',
  },
  {
    id: 'log-10',
    time: '08:45 AM',
    category: 'recommendation',
    title: 'AI Recommendation Generated',
    description: 'Prioritize outreach to 5 high-probability invoices expected to convert this week.',
  },
]
