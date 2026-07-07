import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Projections } from '@/pages/Projections'
import { Transactions } from '@/pages/Transactions'
import { Categories } from '@/pages/Categories'
import { Goals } from '@/pages/Goals'
import { Budget } from '@/pages/Budget'
import { Debts } from '@/pages/Debts'
import { Subscriptions } from '@/pages/Subscriptions'
import { Settings } from '@/pages/Settings'
import { Wallets } from '@/pages/Wallets'
import { Investments } from '@/pages/Investments'
import { FinanceProvider } from '@/store/FinanceContext'
import { Preloader } from '@/components/layout/Preloader'

import { Toaster } from 'sonner'

function App() {
  return (
    <FinanceProvider>
      <Preloader>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projections" element={<Projections />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/investments" element={<Investments />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/debts" element={<Debts />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/settings" element={<Settings />} />
              {/* Add more routes here as we build them */}
              <Route path="*" element={<div className="p-8">Page not found</div>} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right" richColors theme="system" />
      </Preloader>
    </FinanceProvider>
  )
}

export default App
