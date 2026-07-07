import { useState, useMemo } from "react"
import { Plus, Calculator, ShieldCheck, AlertTriangle, Flame } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useFinance } from "@/store/FinanceContext"
import type { Budget } from "@/types"
import { formatCurrency } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { BudgetModal } from "@/features/budget/components/BudgetModal"

export function Budget() {
  const { budgets, transactions, categories, currency } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null)
  
  // State for current selected month (defaults to current month)
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7))

  const handleEdit = (budget: Budget) => {
    setBudgetToEdit(budget)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setBudgetToEdit(null)
    setIsModalOpen(true)
  }

  // Filter budgets for selected month and calculate spent amounts
  const budgetData = useMemo(() => {
    const monthlyBudgets = budgets.filter((b) => b.month === selectedMonth)
    
    // Calculate total expenses in the selected month
    const monthlyExpenses = transactions.filter((t) => {
      return t.type === "expense" && t.date.startsWith(selectedMonth)
    })

    return monthlyBudgets.map((budget) => {
      let spent = 0

      if (budget.categoryId === "total") {
        spent = monthlyExpenses.reduce((acc, curr) => acc + curr.amount, 0)
      } else {
        spent = monthlyExpenses
          .filter((t) => t.categoryId === budget.categoryId)
          .reduce((acc, curr) => acc + curr.amount, 0)
      }

      const progress = Math.min((spent / budget.amount) * 100, 100)
      const isOverBudget = spent > budget.amount

      let name = "Overall Budget"
      let color = "#3b82f6" // blue

      if (budget.categoryId !== "total") {
        const cat = categories.find((c) => c.id === budget.categoryId)
        name = cat?.name || "Unknown Category"
        color = cat?.color || color
      }

      return {
        ...budget,
        spent,
        progress,
        isOverBudget,
        name,
        color,
      }
    })
  }, [budgets, transactions, categories, selectedMonth])

  // Calculate overall health
  const overallHealth = useMemo(() => {
    if (budgetData.length === 0) return null
    const avgUsage = budgetData.reduce((s, b) => s + (b.spent / b.amount) * 100, 0) / budgetData.length
    const overBudgetCount = budgetData.filter(b => b.isOverBudget).length
    if (overBudgetCount > 0) return { label: "Slow down your spending!", color: "destructive", icon: AlertTriangle, avg: avgUsage }
    if (avgUsage > 70) return { label: "Watch your limits carefully.", color: "yellow-500", icon: Flame, avg: avgUsage }
    return { label: "You are doing GREAT! 🎉", color: "emerald-500", icon: ShieldCheck, avg: avgUsage }
  }, [budgetData])

  // Radial progress SVG helper
  const RadialProgress = ({ value, color, size = 100, strokeWidth = 8 }: { value: number; color: string; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (Math.min(value, 100) / 100) * circumference

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background p-8 border border-primary/10 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent pb-2">
              Budgets
            </h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-xl">
              Master your money. Set limits, stay disciplined. 🎯
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-40 bg-background/50 backdrop-blur-sm"
            />
            <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25 transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" /> Set Budget
            </Button>
          </div>
        </div>
        <div className="absolute right-0 top-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      {/* Overall Health Banner */}
      {overallHealth && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className={`bg-card/40 backdrop-blur-xl border-${overallHealth.color}/10 shadow-lg relative overflow-hidden`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${overallHealth.color}/40 to-transparent`} />
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-${overallHealth.color}/10`}>
                <overallHealth.icon className={`h-6 w-6 text-${overallHealth.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold">{overallHealth.label}</p>
                <p className="text-sm text-muted-foreground">Average budget usage: {overallHealth.avg.toFixed(0)}%</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {budgetData.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 shadow-none bg-card/20 backdrop-blur-sm">
          <div className="h-20 w-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-6 ring-2 ring-primary/10">
            <Calculator className="h-10 w-10 text-primary/60" />
          </div>
          <CardTitle className="mb-2">No Budgets for {selectedMonth}</CardTitle>
          <CardDescription className="max-w-sm mb-6">
            Set an overall monthly budget or specific limits for categories like Food and Transportation.
          </CardDescription>
          <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-primary/80 shadow-lg">Set a Budget</Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {budgetData.map((budget, index) => {
              const remaining = budget.amount - budget.spent
              const statusColor = budget.isOverBudget 
                ? 'hsl(var(--destructive))' 
                : budget.progress > 70 
                  ? '#eab308' 
                  : budget.color

              return (
                <motion.div
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className={`flex flex-col relative overflow-hidden group bg-card/40 backdrop-blur-xl shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-1 ${
                    budget.isOverBudget 
                      ? 'border-destructive/30 ring-1 ring-destructive/10' 
                      : 'border-primary/10'
                  }`}>
                    {/* Glow orb */}
                    <div 
                      className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                      style={{ backgroundColor: statusColor }}
                    />

                    {budget.isOverBudget && (
                      <div className="absolute top-3 right-3 z-20">
                        <div className="flex items-center gap-1 bg-destructive/20 text-destructive px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ring-destructive/30 animate-pulse">
                          <AlertTriangle className="h-3 w-3" /> Over Budget
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-2 relative z-10">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {budget.categoryId !== 'total' && (
                          <div 
                            className="w-3 h-3 rounded-full ring-2 ring-white/20 shadow-sm" 
                            style={{ backgroundColor: budget.color }}
                          />
                        )}
                        {budget.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col justify-end pt-2 relative z-10">
                      {/* Radial Progress */}
                      <div className="flex items-center gap-6 mb-4">
                        <div className="relative">
                          <RadialProgress value={budget.progress} color={statusColor} size={90} strokeWidth={7} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-lg font-bold ${budget.isOverBudget ? 'text-destructive' : ''}`}>
                              {budget.progress.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Spent</p>
                            <p className={`font-bold text-lg ${budget.isOverBudget ? 'text-destructive' : ''}`}>
                              {formatCurrency(budget.spent, currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Limit</p>
                            <p className="font-medium text-sm text-muted-foreground">
                              {formatCurrency(budget.amount, currency)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Remaining badge */}
                      <div className={`text-center py-2 rounded-lg text-sm font-semibold ${
                        budget.isOverBudget 
                          ? 'bg-destructive/10 text-destructive' 
                          : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                        {budget.isOverBudget 
                          ? `${formatCurrency(Math.abs(remaining), currency)} over limit` 
                          : `${formatCurrency(remaining, currency)} remaining`
                        }
                      </div>
                      
                      <div className="flex justify-end mt-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEdit(budget)}
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10"
                        >
                          Edit Limit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        budgetToEdit={budgetToEdit}
        defaultMonth={selectedMonth}
      />
    </div>
  )
}
