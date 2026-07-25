import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AiChatProvider } from '../context/AiChatContext'
import { LayoutProvider } from '../context/LayoutContext'
import { AllContentPage } from '../pages/AllContentPage'
import { ControlTowerPage } from '../pages/ControlTowerPage'
import { CustomerOverviewPage } from '../pages/CustomerOverviewPage'
import { CustomerPaymentsPage } from '../pages/CustomerPaymentsPage'
import { CustomersPage } from '../pages/CustomersPage'
import { ErrorPage } from '../pages/ErrorPage'
import { ExceptionsPage } from '../pages/ExceptionsPage'
import { FinPilotPage } from '../pages/FinPilotPage'
import { HomePage } from '../pages/HomePage'
import { OverviewPage } from '../pages/OverviewPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'
import { ReconciliationHubOverviewPage } from '../pages/ReconciliationHubOverviewPage'
import { ReconciliationPage } from '../pages/ReconciliationPage'
import { ReflexAiPage } from '../pages/ReflexAiPage'
import { ReportsPage } from '../pages/ReportsPage'
import { SettingsPage } from '../pages/SettingsPage'
import { TransactionsPage } from '../pages/TransactionsPage'
import { WorkbenchPage } from '../pages/WorkbenchPage'

const placeholderRoutes: Array<{ path: string; title: string }> = [
  { path: 'search', title: 'Search' },
  { path: 'one-view', title: 'One View' },
  { path: 'customer-intelligence/invoices', title: 'Invoices' },
  { path: 'customer-intelligence/prediction', title: 'Prediction' },
  { path: 'invoice-intelligence/overview', title: 'Invoice Intelligence' },
  { path: 'invoice-intelligence/all-invoices', title: 'All Invoices' },
  { path: 'invoice-intelligence/priority-queue', title: 'Priority Queue' },
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
    element: (
      <LayoutProvider>
        <AiChatProvider>
          <AppLayout />
        </AiChatProvider>
      </LayoutProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: 'overview', element: <OverviewPage /> },
      { path: 'home', element: <HomePage /> },
      { path: 'content', element: <AllContentPage /> },
      { path: 'reconciliation', element: <ReconciliationPage /> },
      { path: 'reconciliation-hub/overview', element: <ReconciliationHubOverviewPage /> },
      { path: 'reconciliation-hub/workbench', element: <WorkbenchPage /> },
      { path: 'customer-intelligence/overview', element: <CustomerOverviewPage /> },
      { path: 'customer-intelligence/overview/:customerId', element: <CustomerOverviewPage /> },
      { path: 'customer-intelligence/customers', element: <CustomersPage /> },
      { path: 'customer-intelligence/payments', element: <CustomerPaymentsPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'exceptions', element: <ExceptionsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'reflex-ai', element: <ReflexAiPage />, handle: { hideTopbar: true } },
      { path: 'finance-navigator', element: <FinPilotPage /> },
      { path: 'control-tower', element: <ControlTowerPage /> },
      ...placeholderRoutes.map((route) => ({
        path: route.path,
        element: <PlaceholderPage title={route.title} />,
      })),
      { path: '*', element: <ErrorPage notFound /> },
    ],
  },
])
