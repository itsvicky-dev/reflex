import {
  Activity,
  Bell,
  Bot,
  Brain,
  CreditCard,
  Database,
  FileSearch,
  FileText,
  Flag,
  FlaskConical,
  HelpCircle,
  History,
  Landmark,
  LineChart,
  ListOrdered,
  type LucideIcon,
  Route,
  Scale,
  Search,
  Settings as SettingsIcon,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  UserPlus,
  Users,
  Wrench,
  Home as HomeIcon,
  TowerControl,
} from 'lucide-react'
import type { ElementType } from 'react'
import controlTowerIcon from '../assets/icons/control-tower.png'
import finPilotIcon from '../assets/icons/fin-pilot.svg'

export type IconComponent = ElementType<{ className?: string; strokeWidth?: number }>

function imageIcon(src: string): IconComponent {
  return function ImageIcon({ className }: { className?: string }) {
    return <img src={src} alt="" className={className} />
  }
}

function svgIcon(svg: string): IconComponent {
  return function SvgIcon({ className }: { className?: string }) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: svg }} />
  }
}

export type NavLayoutConfig = { sidebarCollapsed?: boolean; aiPanelOpen?: boolean }
export type NavLink = { kind: 'link'; to: string; label: string; icon: IconComponent; badge?: string; layout?: NavLayoutConfig }
export type NavGroup = { kind: 'group'; id: string; label: string; icon: IconComponent; defaultOpen?: boolean; children: NavLink[] }
export type NavAction = { kind: 'action'; id: string; label: string; icon: IconComponent }
export type NavEntry = NavLink | NavGroup | NavAction

export const topNav: NavLink[] = [
  { kind: 'link', to: '/search', label: 'Search', icon: Search },
  { kind: 'link', to: '/home', label: 'Home', icon: HomeIcon },
  { kind: 'link', to: '/reflex-ai', label: 'Reflex AI', icon: Sparkles },
  { kind: 'link', to: '/finance-navigator', label: 'FinPilot', icon: imageIcon(finPilotIcon) },
  { kind: 'link', to: '/control-tower', label: 'Control Tower', icon: TowerControl },
]

export const quickAccess: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'recents', label: 'Recents', icon: History },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'agents', label: 'Agents', icon: Bot },
]

export const productsNav: NavEntry[] = [
  {
    kind: 'group',
    id: 'reconciliation-hub',
    label: 'Reconciliation Hub',
    icon: Scale,
    defaultOpen: true,
    children: [
      { kind: 'link', to: '/reconciliation-hub/overview', label: 'Overview', icon: LineChart },
      { kind: 'link', to: '/reconciliation-hub/workbench', label: 'Workbench', icon: Wrench },
      { kind: 'link', to: '/reconciliation-hub/payee-mapping', label: 'Payee Mapping', icon: Route },
      { kind: 'link', to: '/reconciliation-hub/bank-statements', label: 'Bank Statements', icon: Landmark },
    ],
  },
  {
    kind: 'group',
    id: 'customer-intelligence',
    label: 'Customer Intelligence',
    icon: Users,
    children: [
      { kind: 'link', to: '/customer-intelligence/invoices', label: 'Invoices', icon: FileText },
      { kind: 'link', to: '/customer-intelligence/payments', label: 'Payments', icon: CreditCard },
      { kind: 'link', to: '/customer-intelligence/prediction', label: 'Prediction', icon: TrendingUp },
    ],
  },
  {
    kind: 'group',
    id: 'invoice-intelligence',
    label: 'Invoice Intelligence',
    icon: FileSearch,
    children: [
      { kind: 'link', to: '/invoice-intelligence/overview', label: 'Overview', icon: LineChart },
      { kind: 'link', to: '/invoice-intelligence/all-invoices', label: 'All Invoices', icon: FileText },
      { kind: 'link', to: '/invoice-intelligence/priority-queue', label: 'Priority Queue', icon: ListOrdered },
    ],
  },
  {
    kind: 'group',
    id: 'intellitrend',
    label: 'Intelli Trend',
    icon: LineChart,
    children: [
      { kind: 'link', to: '/intellitrend/behavioral-timeline', label: 'Behavioral Timeline', icon: Activity },
      { kind: 'link', to: '/intellitrend/behavioral-intelligence', label: 'Behavioral Intelligence', icon: Brain },
    ],
  },
  {
    kind: 'group',
    id: 'experiment',
    label: 'Experiment',
    icon: FlaskConical,
    children: [
      { kind: 'link', to: '/experiment/overview', label: 'Overview', icon: LineChart },
      { kind: 'link', to: '/experiment/experiments', label: 'Experiments', icon: FlaskConical },
      { kind: 'link', to: '/experiment/flags', label: 'Flags', icon: Flag },
    ],
  },
  {
    kind: 'link',
    label: 'Data',
    icon: Database,
    to: '/data',
  },
  {
    kind: 'link',
    label: 'Users',
    icon: Users,
    to: '/users',
  },
  // {
  //   kind: 'link',
  //   label: 'Audit Log',
  //   icon: ScrollText,
  //   to: '/audit-log',
  // },
  // {
  //   kind: 'link',
  //   label: 'Settings',
  //   icon: SettingsIcon,
  //   to: '/settings',
  // },
  // {
  //   kind: 'link',
  //   label: 'Notifications',
  //   icon: Bell,
  //   to: '/notifications',
  // },
  // {
  //   kind: 'link',
  //   label: 'Help & Support',
  //   icon: HelpCircle,
  //   to: '/help',
  // },
]

export const bottomUtility: { id: string; label: string; icon: LucideIcon; to?: string }[] = [
  { id: 'settings', label: 'Settings', icon: SettingsIcon, to: '/settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'help', label: 'Help & Support', icon: HelpCircle },
  { id: 'invite', label: 'Invite teammates', icon: UserPlus },
  { id: 'customize', label: 'Customize', icon: SlidersHorizontal },
]

function collect(entries: NavEntry[], out: NavLink[]) {
  for (const entry of entries) {
    if (entry.kind === 'link') out.push(entry)
    if (entry.kind === 'group') out.push(...entry.children)
  }
}

export const allNavLinks: NavLink[] = (() => {
  const out: NavLink[] = []
  collect(topNav, out)
  collect(productsNav, out)
  for (const item of bottomUtility) {
    if (item.to) out.push({ kind: 'link', to: item.to, label: item.label, icon: item.icon })
  }
  return out
})()
