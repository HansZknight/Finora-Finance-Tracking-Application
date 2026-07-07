import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Plus, TrendingUp, TrendingDown, RefreshCcw, Landmark, Bitcoin, CircleDollarSign, PieChart as PieChartIcon } from "lucide-react"

import { useFinance } from "@/store/FinanceContext"
import type { Investment } from "@/types"
import { formatCurrency } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvestmentModal } from "@/features/investments/components/InvestmentModal"
import { UpdatePriceModal } from "@/features/investments/components/UpdatePriceModal"

const getTypeIcon = (type: Investment["type"]) => {
  switch (type) {
    case "stock": return <TrendingUp className="h-5 w-5" />
    case "crypto": return <Bitcoin className="h-5 w-5" />
    case "gold": return <CircleDollarSign className="h-5 w-5 text-yellow-500" />
    case "mutual_fund": return <PieChartIcon className="h-5 w-5" />
    default: return <Landmark className="h-5 w-5" />
  }
}

export function Investments() {
  const { investments, currency } = useFinance()
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false)
  const [isUpdatePriceOpen, setIsUpdatePriceOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null)

  // Calculate totals
  const { totalInvested, totalCurrentValue, totalProfit, totalRoi } = useMemo(() => {
    let invested = 0
    let current = 0
    
    investments.forEach(inv => {
      invested += (inv.averageBuyPrice * inv.quantity)
      current += (inv.currentPrice * inv.quantity)
    })

    const profit = current - invested
    const roi = invested > 0 ? (profit / invested) * 100 : 0

    return {
      totalInvested: invested,
      totalCurrentValue: current,
      totalProfit: profit,
      totalRoi: roi
    }
  }, [investments])

  const handleAdd = () => {
    setSelectedInvestment(null)
    setIsInvestModalOpen(true)
  }

  const handleEdit = (inv: Investment) => {
    setSelectedInvestment(inv)
    setIsInvestModalOpen(true)
  }

  const handleUpdatePrice = (e: React.MouseEvent, inv: Investment) => {
    e.stopPropagation()
    setSelectedInvestment(inv)
    setIsUpdatePriceOpen(true)
  }

  const isProfitGlobally = totalProfit >= 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-background to-background p-8 border border-indigo-500/10 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent pb-2">
              Investment Portfolio
            </h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-xl">
              Track your assets and visualize your wealth growth over time.
            </p>
          </div>
          <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25 transition-all duration-300">
            <Plus className="mr-2 h-4 w-4" /> Add Asset
          </Button>
        </div>
        
        {/* Glow Effects */}
        <div className="absolute right-0 top-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-card/40 backdrop-blur-xl border border-white/5 shadow-lg relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested (Capital)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {formatCurrency(totalInvested, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border border-white/5 shadow-lg relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold tracking-tight ${totalCurrentValue > totalInvested ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" : totalCurrentValue < totalInvested ? "text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]" : ""}`}>
              {formatCurrency(totalCurrentValue, currency)}
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-card/40 backdrop-blur-xl shadow-lg relative overflow-hidden border-2 ${isProfitGlobally ? "border-emerald-500/20" : "border-destructive/20"}`}>
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-20 ${isProfitGlobally ? "bg-emerald-500" : "bg-destructive"}`} />
          <CardHeader className="pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit / Loss</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 flex items-end justify-between">
            <div className={`text-3xl font-bold tracking-tight ${isProfitGlobally ? "text-emerald-500" : "text-destructive"}`}>
              {isProfitGlobally ? "+" : ""}{formatCurrency(totalProfit, currency)}
            </div>
            <div className={`flex items-center text-sm font-bold px-2 py-1 rounded-full ${isProfitGlobally ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
              {isProfitGlobally ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {totalRoi > 0 ? "+" : ""}{totalRoi.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {investments.map((inv, index) => {
            const invested = inv.averageBuyPrice * inv.quantity
            const current = inv.currentPrice * inv.quantity
            const profit = current - invested
            const roi = invested > 0 ? (profit / invested) * 100 : 0
            const isProfit = profit >= 0
            const displayColor = inv.color || "#10b981"

            return (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card 
                  className="flex flex-col h-full group overflow-hidden bg-card/40 backdrop-blur-xl shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative border-white/5 cursor-pointer"
                  onClick={() => handleEdit(inv)}
                >
                  <div className="h-1.5 w-full transition-colors duration-500" style={{ backgroundColor: isProfit ? displayColor : '#ef4444' }} />
                  
                  <div 
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-10 group-hover:opacity-20 transition-opacity duration-700"
                    style={{ backgroundColor: isProfit ? displayColor : '#ef4444' }}
                  />

                  <CardHeader className="pb-2 relative z-10 flex flex-row items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {inv.symbol}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 truncate max-w-[150px]">{inv.name}</p>
                    </div>
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ring-1 ring-white/10"
                      style={{ backgroundColor: displayColor }}
                    >
                      {getTypeIcon(inv.type)}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2 pb-6 flex-1 flex flex-col justify-end relative z-10 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Quantity</p>
                        <p className="font-semibold">{inv.quantity}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Avg Buy</p>
                        <p className="font-semibold">{formatCurrency(inv.averageBuyPrice, currency)}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <div className="flex justify-between items-end mb-1">
                        <p className="text-muted-foreground text-xs font-medium">Current Value</p>
                        <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${isProfit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                          {isProfit ? '+' : ''}{roi.toFixed(2)}%
                        </div>
                      </div>
                      <p className={`text-2xl font-bold tracking-tight ${isProfit ? "text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]" : "text-destructive"}`}>
                        {formatCurrency(current, currency)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <p className="text-[10px] text-muted-foreground">
                        Updated {formatDistanceToNow(parseISO(inv.lastUpdated))} ago
                      </p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-2 text-xs bg-primary/5 hover:bg-primary/10 text-primary"
                        onClick={(e) => handleUpdatePrice(e, inv)}
                      >
                        <RefreshCcw className="w-3 h-3 mr-1" /> Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {investments.length === 0 && (
        <div className="py-12 text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-10 h-10 text-primary opacity-50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Investments Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Start tracking your stocks, crypto, or gold to see your wealth grow over time.
          </p>
          <Button onClick={handleAdd}>Add First Asset</Button>
        </div>
      )}

      <InvestmentModal 
        isOpen={isInvestModalOpen} 
        onClose={() => setIsInvestModalOpen(false)} 
        investmentToEdit={selectedInvestment} 
      />
      <UpdatePriceModal
        isOpen={isUpdatePriceOpen}
        onClose={() => setIsUpdatePriceOpen(false)}
        investment={selectedInvestment}
      />
    </div>
  )
}
