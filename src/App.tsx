import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { CurrencySymbolSync } from './components/currency/CurrencySymbolSync'
import { ThemeProvider } from './components/theme/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <CurrencySymbolSync />
    </ThemeProvider>
  )
}

export default App
