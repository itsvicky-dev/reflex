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
  { path: 'home', title: 'Home' },
  { path: 'finance-navigator', title: 'Finance Navigator' },
  { path: 'control-tower', title: 'Control Tower' },
  { path: 'one-view', title: 'One View' },
  { path: 'customer-intelligence/invoices', title: 'Invoices' },
  { path: 'customer-intelligence/payments', title: 'Payments' },
  { path: 'customer-intelligence/prediction', title: 'Prediction' },
  { path: 'invoice-intelligence/overview', title: 'Invoice Intelligence' },
  { path: 'invoice-intelligence/all-invoices', title: 'All Invoices' },
  { path: 'invoice-intelligence/priority-queue', title: 'Priority Queue' },
  { path: 'reconciliation-hub/overview', title: 'Reconciliation Hub' },
  { path: 'reconciliation-hub/workbench', title: 'Workbench' },
  { path: 'reconciliation-hub/payee-mapping', title: 'Payee Mapping' },
  { path: 'reconciliation-hub/bank-statements', title: 'Bank Statements' },
  { path: 'intellitrend/behavioral-timeline', title: 'Behavioral Timeline' },
  { path: 'intellitrend/behavioral-intelligence', title: 'Behavioral Intelligence' },
  { path: 'experiment/overview', title: 'Experiment' },
  { path: 'experiment/experiments', title: 'Experiments' },
  { path: 'experiment/flags', title: 'Flags' },
  { path: 'data', title: 'Data' },
  { path: 'data/users', title: 'Users' },
  { path: 'data/audit-log', title: 'Audit Log' },
  { path: 'notifications', title: 'Notifications' },
  { path: 'help', title: 'Help & Support' },
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
