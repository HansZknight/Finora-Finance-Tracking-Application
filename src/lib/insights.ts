import { format, subMonths, isSameMonth, parseISO } from "date-fns"
import type { Transaction, Budget, Goal } from "@/types"

export type InsightType = "positive" | "warning" | "neutral"

export interface Insight {
  id: string
  type: InsightType
  title: string
  message: string
}

export function generateInsights(
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[]
): Insight[] {
  const insights: Insight[] = []
  const today = new Date()
  const currentMonthDate = today
  const previousMonthDate = subMonths(today, 1)

  const currentMonthStr = format(currentMonthDate, "yyyy-MM")
  
  // 1. Month-over-Month Spending Comparison
  const currentMonthExpenses = transactions
    .filter(t => t.type === "expense" && isSameMonth(parseISO(t.date), currentMonthDate))
    .reduce((sum, t) => sum + t.amount, 0)
    
  const previousMonthExpenses = transactions
    .filter(t => t.type === "expense" && isSameMonth(parseISO(t.date), previousMonthDate))
    .reduce((sum, t) => sum + t.amount, 0)

  if (previousMonthExpenses > 0) {
    const diffPercentage = ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
    
    if (diffPercentage > 20) {
      insights.push({
        id: "high-spending",
        type: "warning",
        title: "Spending Alert",
        message: `Your spending this month is up ${Math.round(diffPercentage)}% compared to last month. Consider reviewing your recent expenses.`,
      })
    } else if (diffPercentage < -10) {
      insights.push({
        id: "low-spending",
        type: "positive",
        title: "Great Job Saving!",
        message: `Your expenses are down ${Math.abs(Math.round(diffPercentage))}% from last month. Keep up the good financial habits!`,
      })
    }
  }

  // 2. Budget Alerts
  budgets.filter(b => b.month === currentMonthStr).forEach(budget => {
    let spent = 0;
    if (budget.categoryId === "total") {
      spent = currentMonthExpenses
    } else {
      spent = transactions
        .filter(t => t.type === "expense" && t.categoryId === budget.categoryId && isSameMonth(parseISO(t.date), currentMonthDate))
        .reduce((sum, t) => sum + t.amount, 0)
    }

    if (budget.amount > 0) {
      const budgetUsedPercentage = (spent / budget.amount) * 100
      
      // Determine how far along we are in the month
      const currentDay = today.getDate()
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
      const monthProgress = (currentDay / daysInMonth) * 100

      if (budgetUsedPercentage > 95) {
        insights.push({
          id: `budget-critical-${budget.id}`,
          type: "warning",
          title: "Budget Critical",
          message: `You have used ${Math.round(budgetUsedPercentage)}% of your ${budget.categoryId === 'total' ? 'total' : 'category'} budget for this month.`,
        })
      } else if (budgetUsedPercentage > monthProgress + 20) {
         insights.push({
          id: `budget-warning-${budget.id}`,
          type: "warning",
          title: "Pacing Warning",
          message: `You are spending your ${budget.categoryId === 'total' ? 'total' : 'category'} budget faster than usual. You've used ${Math.round(budgetUsedPercentage)}% but we're only ${Math.round(monthProgress)}% through the month.`,
        })
      }
    }
  })

  // 3. Goals Progress
  const nearlyCompletedGoals = goals.filter(g => {
    if (g.targetAmount === 0) return false;
    const progress = (g.currentAmount / g.targetAmount) * 100
    return progress >= 80 && progress < 100
  })

  nearlyCompletedGoals.forEach(g => {
    insights.push({
      id: `goal-almost-${g.id}`,
      type: "positive",
      title: "Goal in Sight!",
      message: `You are almost there! You've reached ${Math.round((g.currentAmount/g.targetAmount)*100)}% of your goal: "${g.title}".`,
    })
  })
  
  // 4. Zero Data Fallback (New user)
  if (transactions.length === 0) {
     insights.push({
      id: "welcome-insight",
      type: "neutral",
      title: "Welcome to Finora",
      message: "Start adding your income and expenses. We'll analyze your patterns and give you smart financial advice here.",
    })
  } else if (insights.length === 0) {
    // If we have data but no specific insights trigger
    insights.push({
      id: "all-good",
      type: "positive",
      title: "On Track",
      message: "Your finances look stable. You are staying within your usual spending habits. Keep it up!",
    })
  }

  // Return max 4 insights to not overwhelm the user
  return insights.slice(0, 4)
}
