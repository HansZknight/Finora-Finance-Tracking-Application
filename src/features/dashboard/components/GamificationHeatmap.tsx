import { useMemo } from "react"
import { useFinance } from "@/store/FinanceContext"
import { Flame, Trophy, TrendingUp, Star } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function GamificationHeatmap() {
  const { transactions, budgets } = useFinance()

  const heatmapData = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // We want 365 days ago to today
    const days = []
    let currentStreak = 0
    let maxStreak = 0
    let totalGreenDays = 0
    let totalExp = 0

    // Find earliest transaction date to prevent awarding points before user started using the app
    let earliestDate = new Date(today)
    if (transactions.length > 0) {
      const dates = transactions.map(t => new Date(t.date).getTime())
      earliestDate = new Date(Math.min(...dates))
      earliestDate.setHours(0, 0, 0, 0)
    }

    // Estimate daily budget based on sum of all budgets
    const totalMonthlyBudget = budgets.reduce((acc, curr) => acc + curr.amount, 0) || 5000000 // default 5m
    const dailyBudget = totalMonthlyBudget / 30

    // Build a map of daily expenses
    const dailyExpenses = new Map<string, number>()
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const d = new Date(t.date).toISOString().split('T')[0]
        dailyExpenses.set(d, (dailyExpenses.get(d) || 0) + t.amount)
      }
    })

    // Generate last 364 days + today
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      
      const expense = dailyExpenses.get(dateStr) || 0
      
      let status = "empty" // no expense
      if (expense > 0) {
        if (expense <= dailyBudget) {
          status = "green"
          currentStreak++
          totalGreenDays++
          totalExp += 10
        } else {
          status = "red"
          currentStreak = 0
          totalExp += 2
        }
      } else {
        // if no expense, it's considered good! (green) unless it's in the future OR before they started using the app
        if (d <= today && d >= earliestDate && transactions.length > 0) {
          status = "green" // no spend day = very good
          currentStreak++
          totalGreenDays++
          totalExp += 15 // bonus for 0 spend
        } else {
          status = "empty"
          // We don't break the streak here if it's before they started
        }
      }
      
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak
      }

      days.push({
        date: dateStr,
        expense,
        status
      })
    }

    // Calculate Level
    const level = Math.floor(totalExp / 100) + 1
    const currentLevelExp = totalExp % 100
    
    let rank = "Novice Saver"
    if (level > 5) rank = "Budget Master"
    if (level > 10) rank = "Financial Guru"
    if (level > 20) rank = "Wealth Architect"

    return {
      days,
      currentStreak,
      maxStreak,
      totalGreenDays,
      level,
      currentLevelExp,
      rank,
      totalExp
    }
  }, [transactions, budgets])

  return (
    <Card className="border-emerald-500/20 shadow-lg relative overflow-hidden bg-gradient-to-br from-card to-emerald-500/5 mb-6">
      <div className="hidden sm:block absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <CardHeader className="pb-4 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-500" />
            Financial Consistency
          </CardTitle>
          <CardDescription>Build good financial habits by keeping your daily spending in the green.</CardDescription>
        </div>

        <div className="flex items-center gap-4 bg-background/50 p-2 pr-4 rounded-xl border backdrop-blur-sm shadow-inner">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-400 to-sky-400 flex items-center justify-center border-2 border-background shadow-md">
              <Star className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-background border rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-bold">
              {heatmapData.level}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{heatmapData.rank}</p>
            <div className="w-32 h-2 bg-muted rounded-full mt-1 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${heatmapData.currentLevelExp}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 text-right">{heatmapData.currentLevelExp} / 100 EXP</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-end justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">365-Day Activity</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-muted" />
                <div className="w-3 h-3 rounded-sm bg-destructive/60" />
                <div className="w-3 h-3 rounded-sm bg-emerald-500/40" />
                <div className="w-3 h-3 rounded-sm bg-emerald-500/80" />
                <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                <span>More</span>
              </div>
            </div>
            
            {/* Heatmap Grid (Scrollable on mobile) */}
            <div className="w-full overflow-x-auto pb-2">
              <div 
                className="grid gap-[3px]" 
                style={{ 
                  gridTemplateColumns: 'repeat(52, minmax(0, 1fr))',
                  gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
                  minWidth: '700px'
                }}
              >
                {heatmapData.days.map((day, idx) => {
                  let bgColor = 'bg-muted/50'
                  if (day.status === 'red') bgColor = 'bg-destructive/60'
                  if (day.status === 'green') {
                    if (day.expense === 0) bgColor = 'bg-emerald-500' // super green for 0 spend
                    else bgColor = 'bg-emerald-500/60'
                  }
                  
                  return (
                    <div 
                      key={idx} 
                      className={`w-3 h-3 rounded-sm ${bgColor} hover:ring-2 hover:ring-ring hover:scale-125 transition-all cursor-pointer`}
                      title={`${day.date}: ${day.expense > 0 ? formatCurrency(day.expense, 'IDR') + ' spent' : 'No spend'}`}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col gap-4 sm:w-32 justify-center">
            <div className="bg-card/60 border rounded-xl p-3 flex-1 flex flex-col items-center justify-center text-center">
              <Flame className="w-5 h-5 text-orange-500 mb-1" />
              <p className="text-xl font-black">{heatmapData.currentStreak}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Day Streak</p>
            </div>
            <div className="bg-card/60 border rounded-xl p-3 flex-1 flex flex-col items-center justify-center text-center">
              <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
              <p className="text-xl font-black">{heatmapData.totalGreenDays}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Green Days</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
