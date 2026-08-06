import { useMemo, useState } from "react"
import { Wallet as WalletIcon, TrendingUp, TrendingDown, PiggyBank } from "lucide-react"
import { useTranslation } from "react-i18next"

import { useFinance } from "@/store/FinanceContext"
import { formatCurrency, cn } from "@/lib/utils"
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
      {/* Mobile-Native Wallet Carousel */}
      <div className="relative mb-6 print:hidden -mx-4 sm:mx-0 px-4 sm:px-0">
        <div className="flex overflow-x-auto gap-3 sm:gap-4 snap-x snap-mandatory scrollbar-hide pb-4 items-center">
          
          {/* All Wallets Card */}
          <div 
            onClick={() => setSelectedWalletId("all")}
            className={cn(
              "snap-center shrink-0 w-[260px] sm:w-[300px] h-[150px] sm:h-[170px] rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group",
              selectedWalletId === "all" ? "ring-2 ring-primary/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-100" : "scale-95 opacity-60 hover:opacity-100 shadow-md grayscale-[50%]"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10 flex flex-col h-full justify-between text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-medium text-white/60 uppercase tracking-widest mb-1">{t('dashboard.allWallets')}</p>
                  <div className="w-8 h-6 bg-white/20 rounded-md backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <div className="w-4 h-3 rounded-sm bg-gradient-to-r from-yellow-200 to-yellow-500 opacity-80" />
                  </div>
                </div>
                <div className="p-2 bg-white/10 rounded-full backdrop-blur-md">
                  <WalletIcon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {formatCurrency(balance, currency)}
                </p>
                <p className="text-xs text-white/50 mt-1 font-mono tracking-widest">
                  **** **** **** TOTAL
                </p>
              </div>
            </div>
          </div>

          {/* Individual Wallet Cards */}
          {wallets.map((w, idx) => {
            // Assign some preset gradient colors based on index to make them look distinct
            const gradients = [
              "from-blue-600 to-indigo-900",
              "from-emerald-500 to-teal-900",
              "from-rose-500 to-red-900",
              "from-amber-500 to-orange-900",
              "from-violet-600 to-purple-900"
            ]
            const bgGradient = gradients[idx % gradients.length]
            
            return (
              <div 
                key={w.id}
                onClick={() => setSelectedWalletId(w.id)}
                className={cn(
                  "snap-center shrink-0 w-[260px] sm:w-[300px] h-[150px] sm:h-[170px] rounded-2xl p-5 cursor-pointer transition-all duration-300 relative overflow-hidden group",
                  selectedWalletId === w.id ? "ring-2 ring-primary/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-100" : "scale-95 opacity-60 hover:opacity-100 shadow-md grayscale-[30%]"
                )}
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br", bgGradient)} />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3" />
                
                <div className="relative z-10 flex flex-col h-full justify-between text-white drop-shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-white/80 uppercase tracking-widest mb-1 truncate max-w-[140px]">{w.name}</p>
                      <div className="w-8 h-6 bg-white/20 rounded-md backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-inner">
                        <div className="w-4 h-3 rounded-sm bg-gradient-to-r from-yellow-200 to-yellow-500 opacity-90" />
                      </div>
                    </div>
                    <div className="p-2 bg-black/20 rounded-full backdrop-blur-md border border-white/10">
                      <WalletIcon className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">
                      {formatCurrency(w.balance, w.currency || currency)}
                    </p>
                    <p className="text-xs text-white/70 mt-1 font-mono tracking-widest flex items-center justify-between">
                      <span>**** **** **** {w.id.substring(w.id.length - 4).toUpperCase()}</span>
                      <span className="opacity-80">{w.currency || currency}</span>
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
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
