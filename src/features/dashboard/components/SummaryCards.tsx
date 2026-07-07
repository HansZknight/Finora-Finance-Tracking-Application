import { useMemo, useState } from "react"
import { Wallet as WalletIcon, TrendingUp, TrendingDown, PiggyBank, Filter } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useFinance } from "@/store/FinanceContext"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NumberTicker } from "@/components/ui/number-ticker"

export function SummaryCards() {
  const { t } = useTranslation()
  const { transactions, wallets, currency, investments, convertCurrency } = useFinance()
  const [selectedWalletId, setSelectedWalletId] = useState<string | "all">("all")

  const displayCurrency = useMemo(() => {
    if (selectedWalletId === "all") return currency
    const w = wallets.find(w => w.id === selectedWalletId)
    return w?.currency || currency
  }, [selectedWalletId, wallets, currency])

  const { totalIncome, totalExpense, balance, savingsRate } = useMemo(() => {
    let income = 0
    let expense = 0
    
    // For net worth calculation
    let currentBalance = 0

    if (selectedWalletId === "all") {
      // Calculate total starting balances
      const initialNetWorth = wallets.reduce((acc, w) => {
        const walletCurrency = w.currency || currency
        return acc + convertCurrency(w.balance, walletCurrency, currency)
      }, 0)
      
      // Calculate investments current value
      const investmentsValue = (investments || []).reduce((acc, inv) => acc + (inv.currentPrice * inv.quantity), 0)
      
      transactions.forEach((t) => {
        const w = wallets.find(w => w.id === t.walletId)
        const txCurrency = w?.currency || currency
        const convertedAmount = convertCurrency(t.amount, txCurrency, currency)

        if (t.type === "income") income += convertedAmount
        else if (t.type === "expense") expense += convertedAmount
        // Transfers don't change net worth
      })

      currentBalance = initialNetWorth + investmentsValue + income - expense
    } else {
      const wallet = wallets.find(w => w.id === selectedWalletId)
      if (wallet) {
        currentBalance = wallet.balance
        
        transactions.forEach((t) => {
          if (t.walletId === selectedWalletId) {
            if (t.type === "income") {
              income += t.amount
              currentBalance += t.amount
            } else if (t.type === "expense") {
              expense += t.amount
              currentBalance -= t.amount
            } else if (t.type === "transfer") {
              expense += t.amount // Treat transfer out as expense for this specific wallet view
              currentBalance -= t.amount
            }
          }
          if (t.toWalletId === selectedWalletId && t.type === "transfer") {
            income += t.amount // Treat transfer in as income for this specific wallet view
            currentBalance += t.amount
          }
        })
      }
    }

    const savings = income > 0 ? ((income - expense) / income) * 100 : 0

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: currentBalance,
      savingsRate: savings,
    }
  }, [transactions, wallets, selectedWalletId, investments, currency, convertCurrency])

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4 relative print:hidden">
        <select 
          className="w-full sm:w-[250px] appearance-none bg-card/60 backdrop-blur-md border border-primary/20 shadow-sm rounded-md px-3 py-2 pl-9 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground cursor-pointer transition-colors hover:bg-card/80"
          value={selectedWalletId} 
          onChange={(e) => setSelectedWalletId(e.target.value)}
        >
          <option value="all">{t('dashboard.allWallets')}</option>
          {wallets.map(w => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
          </svg>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/40 backdrop-blur-xl border-primary/10 shadow-lg relative overflow-hidden transition-all duration-500 hover:shadow-primary/20 hover:-translate-y-1 hover:bg-card/60 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary/70 transition-colors">
              {selectedWalletId === "all" ? t('dashboard.totalNetWorth') : t('dashboard.walletBalance')}
            </CardTitle>
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full ring-1 ring-primary/20 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <WalletIcon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
              <NumberTicker value={balance} formatString={(val) => formatCurrency(val, displayCurrency)} />
            </div>
            <p className="text-sm mt-1 text-muted-foreground">
              {t('dashboard.currentAvailableFunds')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-xl border-emerald-500/10 shadow-lg relative overflow-hidden transition-all duration-500 hover:shadow-emerald-500/20 hover:-translate-y-1 hover:bg-card/60 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-emerald-500/70 transition-colors">{t('dashboard.totalIncome')}</CardTitle>
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-full ring-1 ring-emerald-500/20 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold tracking-tight text-emerald-500 drop-shadow-sm">
              <NumberTicker value={totalIncome} formatString={(val) => formatCurrency(val, displayCurrency)} />
            </div>
            <p className="text-sm mt-1 text-muted-foreground">
              {t('dashboard.lifetimeEarnings')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-xl border-destructive/10 shadow-lg relative overflow-hidden transition-all duration-500 hover:shadow-destructive/20 hover:-translate-y-1 hover:bg-card/60 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-destructive/20 transition-all duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-destructive/70 transition-colors">{t('dashboard.totalExpenses')}</CardTitle>
            <div className="p-2 bg-gradient-to-br from-destructive/20 to-destructive/5 rounded-full ring-1 ring-destructive/20 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold tracking-tight text-destructive drop-shadow-sm">
              <NumberTicker value={totalExpense} formatString={(val) => formatCurrency(val, displayCurrency)} />
            </div>
            <p className="text-sm mt-1 text-muted-foreground">
              {t('dashboard.lifetimeSpending')}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-xl border-accent/10 shadow-lg relative overflow-hidden transition-all duration-500 hover:shadow-accent/20 hover:-translate-y-1 hover:bg-card/60 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/20 transition-all duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-accent/70 transition-colors">{t('dashboard.savingsRate')}</CardTitle>
            <div className="p-2 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full ring-1 ring-accent/20 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <PiggyBank className="h-4 w-4 text-accent-foreground" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm">
              <NumberTicker value={savingsRate} formatString={(v) => `${v.toFixed(1)}%`} />
            </div>
            <p className="text-sm mt-1 text-muted-foreground">
              {t('dashboard.ofTotalIncomeSaved')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
