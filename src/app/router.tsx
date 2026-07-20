import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AllContentPage } from '../pages/AllContentPage'
import { ExceptionsPage } from '../pages/ExceptionsPage'
import { OverviewPage } from '../pages/OverviewPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ReconciliationPage } from '../pages/ReconciliationPage'
import { ReportsPage } from '../pages/ReportsPage'
import { SettingsPage } from '../pages/SettingsPage'
import { TransactionsPage } from '../pages/TransactionsPage'

const placeholderRoutes: Array<{ path: string; title: string }> = [
  { path: 'search', title: 'Search' },
  { path: 'onboarding', title: 'Onboarding' },
  { path: 'home', title: 'Home' },
  { path: 'agents', title: 'Agents' },
  { path: 'live-events', title: 'Live Events' },
  { path: 'product-analytics/onboarding', title: 'Onboarding' },
  { path: 'product-analytics/feature-engagement', title: 'Feature Engagement' },
  { path: 'product-analytics/retention', title: 'Retention' },
  { path: 'marketing-analytics/overview', title: 'Marketing Analytics' },
  { path: 'marketing-analytics/campaigns', title: 'Campaigns' },
  { path: 'users/overview', title: 'Users' },
  { path: 'users/profiles', title: 'Profiles' },
  { path: 'experience-analytics/overview', title: 'Experience Analytics' },
  { path: 'experiment/overview', title: 'Experiment' },
]

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: 'overview', element: <OverviewPage /> },
      { path: 'content', element: <AllContentPage /> },
      { path: 'reconciliation', element: <ReconciliationPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'exceptions', element: <ExceptionsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      ...placeholderRoutes.map((route) => ({
        path: route.path,
        element: <PlaceholderPage title={route.title} />,
      })),
      { path: '*', element: <Navigate to="/overview" replace /> },
    ],
  },
])
