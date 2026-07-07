import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useFinance } from "@/store/FinanceContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Trophy, Star, ShieldCheck, Flame, Medal } from "lucide-react"

export function FinancialHealthCard() {
  const { t } = useTranslation()
  const { transactions, budgets, goals, debts } = useFinance()

  const { score, badges } = useMemo(() => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const currentMonthTx = transactions.filter(t => t.date.startsWith(currentMonth))
    
    const totalIncome = currentMonthTx.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
    const totalExpense = currentMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)
    
    const totalBudget = budgets.filter(b => b.month === currentMonth).reduce((acc, b) => acc + b.amount, 0)

    // 1. Budget Score (0-40)
    let budgetScore = 20 // default if no budget
    if (totalBudget > 0) {
      const budgetRatio = totalExpense / totalBudget
      if (budgetRatio <= 0.8) budgetScore = 40
      else if (budgetRatio <= 1.0) budgetScore = 30
      else budgetScore = Math.max(0, 40 - Math.floor((budgetRatio - 1) * 100))
    } else if (totalExpense === 0) {
      budgetScore = 40
    }

    // 2. Savings Score (0-30)
    let savingsScore = 15 // default
    if (totalIncome > 0) {
      const savingsRate = (totalIncome - totalExpense) / totalIncome
      if (savingsRate >= 0.2) savingsScore = 30
      else if (savingsRate > 0) savingsScore = 15
      else savingsScore = 0
    }

    // 3. Debt Score (0-30)
    let debtScore = 30 // default if no debt
    if (debts.length > 0) {
      const totalDebtAmount = debts.reduce((acc, d) => acc + d.totalAmount, 0)
      const totalPaidAmount = debts.reduce((acc, d) => acc + d.paidAmount, 0)
      if (totalDebtAmount > 0) {
        debtScore = Math.floor((totalPaidAmount / totalDebtAmount) * 30)
      }
    }

    const totalScore = Math.min(100, Math.max(0, budgetScore + savingsScore + debtScore))

    // Badges logic
    const hasMasterSaver = goals.some(g => g.currentAmount >= g.targetAmount && g.targetAmount > 0)
    const hasBudgetBoss = totalBudget > 0 && totalExpense <= 0.8 * totalBudget
    const hasDebtDestroyer = debts.some(d => d.paidAmount >= d.totalAmount && d.totalAmount > 0)
    const hasWealthBuilder = (totalIncome - totalExpense) > 5000 // Simple threshold

    return {
      score: totalScore,
      badges: [
        { id: 'master_saver', name: 'Master Saver', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', earned: hasMasterSaver, desc: 'Completed a savings goal' },
        { id: 'budget_boss', name: 'Budget Boss', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', earned: hasBudgetBoss, desc: 'Spent <80% of monthly budget' },
        { id: 'debt_destroyer', name: 'Debt Destroyer', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', earned: hasDebtDestroyer, desc: 'Fully paid off a debt' },
        { id: 'wealth_builder', name: 'Wealth Builder', icon: Trophy, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', earned: hasWealthBuilder, desc: 'Positive cashflow milestone' },
      ]
    }
  }, [transactions, budgets, goals, debts])

  // Get score color
  let scoreColor = "text-emerald-500"
  let scoreBg = "bg-emerald-500"
  if (score < 50) {
    scoreColor = "text-destructive"
    scoreBg = "bg-destructive"
  } else if (score < 80) {
    scoreColor = "text-yellow-500"
    scoreBg = "bg-yellow-500"
  }

  const circumference = 2 * Math.PI * 40
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 border-primary/10 shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Medal className="w-5 h-5 text-primary" /> {t('dashboard.financialHealth')}
        </CardTitle>
        <CardDescription>{t('dashboard.financialHealthDesc')}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col md:flex-row gap-8 items-center">
        {/* Radial Score Gauge */}
        <div className="relative flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              className="text-muted/30"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="64"
              cy="64"
            />
            <circle
              className={scoreColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="64"
              cy="64"
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-3xl font-extrabold ${scoreColor}`}>{score}</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('dashboard.badges.score')}</span>
          </div>
        </div>

        {/* Badges */}
        <div className="flex-1 w-full space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">{t('dashboard.badges.unlocked')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {badges.map((badge) => {
              const Icon = badge.icon
              if (!badge.earned) {
                return (
                  <div key={badge.id} className="flex flex-col items-center p-3 rounded-xl bg-muted/30 border border-dashed border-muted grayscale opacity-50 relative group">
                    <Icon className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-xs font-medium text-center line-clamp-1">{badge.name}</span>
                    {/* Tooltip for unearned */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                      {t('dashboard.badges.unlock')}: {badge.desc}
                    </div>
                  </div>
                )
              }
              
              return (
                <div key={badge.id} className={`flex flex-col items-center p-3 rounded-xl ${badge.bg} border ${badge.border} relative group shadow-sm transition-transform hover:-translate-y-1`}>
                  <div className={`absolute inset-0 rounded-xl ${badge.bg} blur-md -z-10`} />
                  <Icon className={`w-8 h-8 ${badge.color} mb-2 drop-shadow-sm`} />
                  <span className={`text-xs font-bold text-center ${badge.color} line-clamp-1`}>{badge.name}</span>
                  {/* Tooltip for earned */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {badge.desc}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
