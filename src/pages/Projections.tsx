import { useMemo, useState } from "react"
import { useFinance } from "@/store/FinanceContext"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown, Info, Wallet, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Projections() {
  const { transactions, debts, currency, isPro } = useFinance()

  const [expenseModifier, setExpenseModifier] = useState(0) // percentage
  const [incomeModifier, setIncomeModifier] = useState(0) // percentage

  const { chartData, insights, finalBalance, startingBalance, baseMonthlyIncome, baseMonthlyExpense } = useMemo(() => {
    const now = new Date()
    
    // Calculate Starting Balance (All history)
    const startingBalance = transactions.reduce((acc, t) => {
      return acc + (t.type === 'income' ? t.amount : -t.amount)
    }, 0)

    // Calculate Monthly Recurring
    const recurringIncome = transactions
      .filter(t => t.isRecurring && t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)

    const recurringExpense = transactions
      .filter(t => t.isRecurring && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    // Calculate Historical Variable Averages (last 3 months)
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    const recentVariableTransactions = transactions.filter(t => 
      !t.isRecurring && new Date(t.date) >= threeMonthsAgo
    )
    
    const totalRecentVarIncome = recentVariableTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0)
    
    const totalRecentVarExpense = recentVariableTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0)

    const avgVariableIncome = totalRecentVarIncome / 3
    const avgVariableExpense = totalRecentVarExpense / 3

    // Base Monthly flows (Recurring + Average Variable)
    const baseMonthlyIncome = recurringIncome + avgVariableIncome
    const baseMonthlyExpense = recurringExpense + avgVariableExpense

    // Apply What-If Modifiers to TOTAL projected flows
    const simulatedMonthlyIncome = baseMonthlyIncome * (1 + (incomeModifier / 100))
    const simulatedMonthlyExpense = baseMonthlyExpense * (1 - (expenseModifier / 100))

    const monthlyNetFlow = simulatedMonthlyIncome - simulatedMonthlyExpense

    let currentBalance = startingBalance
    let optBalance = startingBalance
    let pessBalance = startingBalance
    const data = []

    // Push current month as baseline
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' })
    data.push({
      month: 'Now',
      realistic: currentBalance,
      optimistic: optBalance,
      pessimistic: pessBalance,
    })

    // Project 6 months into the future
    for (let i = 1; i <= 6; i++) {
      const projectionDate = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const monthStr = monthFormatter.format(projectionDate)
      
      let thisMonthExpense = simulatedMonthlyExpense
      let optExpense = simulatedMonthlyExpense * 0.9 // 10% less than simulated
      let pessExpense = simulatedMonthlyExpense * 1.15 // 15% more than simulated
      
      // Assume unpaid debts due in this month are paid in full
      const debtsDue = debts.filter(d => {
        if (!d.dueDate) return false
        const due = new Date(d.dueDate)
        return due.getFullYear() === projectionDate.getFullYear() && due.getMonth() === projectionDate.getMonth()
      })
      
      const debtPayments = debtsDue.reduce((acc, d) => acc + (d.totalAmount - d.paidAmount), 0)
      thisMonthExpense += debtPayments
      optExpense += debtPayments
      pessExpense += debtPayments

      const thisMonthIncome = simulatedMonthlyIncome

      currentBalance = currentBalance + thisMonthIncome - thisMonthExpense
      optBalance = optBalance + thisMonthIncome - optExpense
      pessBalance = pessBalance + thisMonthIncome - pessExpense

      data.push({
        month: monthStr,
        realistic: currentBalance,
        optimistic: optBalance,
        pessimistic: pessBalance,
        debtSpike: debtPayments > 0,
      })
    }

    const finalBalance = currentBalance

    // Generate insights
    const insights = []
    if (avgVariableExpense > 0) {
      insights.push(`We analyzed your past 3 months and found an average variable expense of ${formatCurrency(avgVariableExpense, currency)}/mo.`)
    }
    
    if (monthlyNetFlow > 0) {
      insights.push(`With your current simulation, you have a positive monthly net flow of ${formatCurrency(monthlyNetFlow, currency)}.`)
    } else if (monthlyNetFlow < 0) {
      insights.push(`Warning: Your projected expenses exceed your income by ${formatCurrency(Math.abs(monthlyNetFlow), currency)}.`)
    }

    if (debts.length > 0) {
      insights.push(`Debt payments are automatically deducted in their due month for this projection.`)
    }

    return { chartData: data, insights, finalBalance, startingBalance, baseMonthlyIncome, baseMonthlyExpense }
  }, [transactions, debts, currency, expenseModifier, incomeModifier])

  const trendColor = finalBalance >= startingBalance ? "text-emerald-500" : "text-destructive"
  const gradientColor = finalBalance >= startingBalance ? "#10b981" : "#ef4444"

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background/90 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl min-w-[200px]">
          <p className="text-sm font-medium mb-2 border-b pb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400">Optimistic</span>
              <span className="font-bold">{formatCurrency(data.optimistic, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-primary font-medium">Realistic</span>
              <span className="font-bold">{formatCurrency(data.realistic, currency)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-destructive/80">Pessimistic</span>
              <span className="font-bold">{formatCurrency(data.pessimistic, currency)}</span>
            </div>
          </div>
          {data.debtSpike && (
            <p className="text-xs text-orange-500 mt-2 flex items-center gap-1 pt-1 border-t border-border/50">
              <Info className="w-3 h-3" /> Debt payment due
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      {!isPro && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl">
          <div className="text-center p-8 bg-card border rounded-2xl shadow-2xl max-w-sm mx-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Pro Feature</h2>
            <p className="text-muted-foreground mb-6">Upgrade to PRO to unlock powerful AI cashflow projections and financial forecasting tools.</p>
            <Button className="w-full">Upgrade to Pro</Button>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">Cashflow Projections</h1>
        <p className="text-muted-foreground mt-1">Predict your financial future based on current recurring habits.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Chart Card */}
        <Card className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          <CardHeader>
            <CardTitle>6-Month Forecast</CardTitle>
            <CardDescription>Estimated balance assuming you don't change your spending habits.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRealistic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={gradientColor} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={gradientColor} stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorOptimistic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPessimistic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                      return value
                    }}
                    className="text-muted-foreground text-xs"
                    width={50}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Render from back to front: Optimistic (highest), Realistic, Pessimistic (lowest) */}
                  <Area 
                    type="monotone" 
                    dataKey="optimistic" 
                    stroke="#10b981" 
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    fillOpacity={1} 
                    fill="url(#colorOptimistic)" 
                    activeDot={false}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="realistic" 
                    stroke={gradientColor} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRealistic)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: gradientColor }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pessimistic" 
                    stroke="#ef4444" 
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    fillOpacity={1} 
                    fill="url(#colorPessimistic)" 
                    activeDot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* What-If Sliders */}
            <div className="mt-8 pt-6 border-t border-border/50">
              <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                What-If Simulator
              </h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Expense Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Reduce Expenses by</span>
                    <span className="font-bold text-emerald-500">{expenseModifier}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    step="1"
                    value={expenseModifier}
                    onChange={(e) => setExpenseModifier(parseInt(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    Saves ~{formatCurrency(baseMonthlyExpense * (expenseModifier / 100), currency)}/mo
                  </p>
                </div>

                {/* Income Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Boost Income by</span>
                    <span className="font-bold text-indigo-400">{incomeModifier}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    step="1"
                    value={incomeModifier}
                    onChange={(e) => setIncomeModifier(parseInt(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    Adds ~{formatCurrency(baseMonthlyIncome * (incomeModifier / 100), currency)}/mo
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Column */}
        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Projected Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{formatCurrency(finalBalance, currency)}</div>
                  <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${trendColor}`}>
                    {finalBalance >= startingBalance ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {finalBalance >= startingBalance ? 'Growing' : 'Declining'}
                  </div>
                </div>
                <div className={`p-4 rounded-full ${finalBalance >= startingBalance ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 text-sm">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground leading-relaxed">{insight}</p>
                </div>
              ))}
              {insights.length === 0 && (
                <p className="text-sm text-muted-foreground">Add recurring income and expenses to see your projection insights.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
