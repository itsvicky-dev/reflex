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
