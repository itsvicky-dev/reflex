import {
  BarChart3,
  Bell,
  Bot,
  Compass,
  FlaskConical,
  HelpCircle,
  History,
  LayoutGrid,
  type LucideIcon,
  Megaphone,
  Rocket,
  Search,
  Settings as SettingsIcon,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Star,
  UserPlus,
  Users,
  Zap,
  Home as HomeIcon,
} from 'lucide-react'

export type NavLink = { kind: 'link'; to: string; label: string; icon: LucideIcon; badge?: string }
export type NavGroup = { kind: 'group'; id: string; label: string; icon: LucideIcon; defaultOpen?: boolean; children: NavLink[] }
export type NavAction = { kind: 'action'; id: string; label: string; icon: LucideIcon }
export type NavEntry = NavLink | NavGroup | NavAction

export const topNav: NavLink[] = [
  { kind: 'link', to: '/search', label: 'Search', icon: Search },
  { kind: 'link', to: '/onboarding', label: 'Onboarding', icon: Rocket },
  { kind: 'link', to: '/home', label: 'Home', icon: HomeIcon },
  { kind: 'link', to: '/agents', label: 'Agents', icon: Bot, badge: 'Beta' },
  { kind: 'link', to: '/content', label: 'All Content', icon: LayoutGrid },
  { kind: 'link', to: '/live-events', label: 'Live Events', icon: Zap },
]

export const quickAccess: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'recent', label: 'Recent', icon: History },
  { id: 'favorites', label: 'Favorites', icon: Star },
  { id: 'shared', label: 'Shared', icon: Share2 },
]

export const productsNav: NavEntry[] = [
  {
    kind: 'group',
    id: 'product-analytics',
    label: 'Product Analytics',
    icon: BarChart3,
    defaultOpen: true,
    children: [
      { kind: 'link', to: '/overview', label: 'Product Overview', icon: BarChart3 },
      { kind: 'link', to: '/product-analytics/onboarding', label: 'Onboarding', icon: Rocket },
      { kind: 'link', to: '/product-analytics/feature-engagement', label: 'Feature Engagement', icon: Zap },
      { kind: 'link', to: '/product-analytics/retention', label: 'Retention', icon: History },
    ],
  },
  {
    kind: 'group',
    id: 'marketing-analytics',
    label: 'Marketing Analytics',
    icon: Megaphone,
    children: [
      { kind: 'link', to: '/marketing-analytics/overview', label: 'Overview', icon: Megaphone },
      { kind: 'link', to: '/marketing-analytics/campaigns', label: 'Campaigns', icon: Zap },
    ],
  },
  {
    kind: 'group',
    id: 'users',
    label: 'Users',
    icon: Users,
    children: [
      { kind: 'link', to: '/users/overview', label: 'Overview', icon: Users },
      { kind: 'link', to: '/users/profiles', label: 'Profiles', icon: Users },
    ],
  },
  {
    kind: 'group',
    id: 'experience-analytics',
    label: 'Experience Analytics',
    icon: Compass,
    children: [{ kind: 'link', to: '/experience-analytics/overview', label: 'Overview', icon: Compass }],
  },
  { kind: 'action', id: 'ai-feedback', label: 'AI Feedback', icon: Sparkles },
  {
    kind: 'group',
    id: 'experiment',
    label: 'Experiment',
    icon: FlaskConical,
    children: [{ kind: 'link', to: '/experiment/overview', label: 'Overview', icon: FlaskConical }],
  },
]

export const bottomUtility: { id: string; label: string; icon: LucideIcon; to?: string }[] = [
  { id: 'settings', label: 'Settings', icon: SettingsIcon, to: '/settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'help', label: 'Help', icon: HelpCircle },
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
