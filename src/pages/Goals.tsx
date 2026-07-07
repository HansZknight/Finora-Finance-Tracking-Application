import { useState, useMemo } from "react"
import { Plus, Target, MoreVertical, Edit2, Trash2, Award, Crown } from "lucide-react"
import { toast } from "sonner"

import { useFinance } from "@/store/FinanceContext"
import type { Goal } from "@/types"
import { formatCurrency } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { GoalModal } from "@/features/goals/components/GoalModal"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Goals() {
  const { goals, deleteGoal, currency, isPro } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null)

  const handleEdit = (goal: Goal) => {
    setGoalToEdit(goal)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    if (!isPro && goals.length >= 1) {
      toast.error("Free plan is limited to 1 goal. Upgrade to PRO for unlimited goals.")
      return
    }
    setGoalToEdit(null)
    setIsModalOpen(true)
  }

  // Calculate overall progress
  const { totalSaved, totalTarget } = useMemo(() => {
    return goals.reduce(
      (acc, goal) => ({
        totalSaved: acc.totalSaved + goal.currentAmount,
        totalTarget: acc.totalTarget + goal.targetAmount,
      }),
      { totalSaved: 0, totalTarget: 0 }
    )
  }, [goals])

  const overallProgress = totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">Savings Goals</h1>
          <p className="text-muted-foreground mt-1">Track your progress towards what matters.</p>
        </div>
        <Button onClick={handleAdd} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add Goal {!isPro && goals.length >= 1 && <Crown className="w-3 h-3 ml-1 text-amber-300" />}
        </Button>
      </div>

      {goals.length > 0 && (
        <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="flex-1 w-full space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Overall Progress</p>
                <div className="flex items-end gap-2">
                  <h2 className="text-4xl font-bold tracking-tight">{formatCurrency(totalSaved, currency)}</h2>
                  <p className="text-muted-foreground mb-1">/ {formatCurrency(totalTarget, currency)}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={overallProgress} className="h-4 bg-primary/10" indicatorColor="#6366f1" />
                <p className="text-sm font-medium text-primary text-right">{overallProgress.toFixed(1)}% Achieved</p>
              </div>
            </div>
            <div className="hidden md:flex w-24 h-24 rounded-full bg-primary/10 items-center justify-center border border-primary/20 shadow-inner">
              <Award className="h-10 w-10 text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      {goals.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed bg-muted/30">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Target className="h-10 w-10 text-primary opacity-80" />
          </div>
          <CardTitle className="text-2xl mb-2">No Goals Set</CardTitle>
          <CardDescription className="max-w-sm mb-8 text-base">
            Create a saving goal to start tracking your progress towards a new car, vacation, or emergency fund.
          </CardDescription>
          <Button onClick={handleAdd} size="lg" className="shadow-lg shadow-primary/20">
            Create Your First Goal
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
            const isCompleted = progress >= 100
            
            // Generate a very subtle transparent background based on the goal color
            const hexToRgba = (hex: string, alpha: number) => {
              const r = parseInt(hex.slice(1, 3), 16) || 0
              const g = parseInt(hex.slice(3, 5), 16) || 0
              const b = parseInt(hex.slice(5, 7), 16) || 0
              return `rgba(${r}, ${g}, ${b}, ${alpha})`
            }
            
            const glowColor = goal.color || '#3b82f6'
            const bgGradient = `linear-gradient(to bottom right, ${hexToRgba(glowColor, 0.1)}, transparent)`

            return (
              <Card 
                key={goal.id} 
                className={`flex flex-col relative overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-xl ${isCompleted ? 'border-emerald-500/50' : ''}`}
                style={{ 
                  background: bgGradient,
                  boxShadow: `0 10px 30px -10px ${hexToRgba(glowColor, 0.2)}` 
                }}
              >
                {/* Decorative mesh glow inside card */}
                <div 
                  className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-50 pointer-events-none transition-opacity group-hover:opacity-80"
                  style={{ backgroundColor: glowColor }}
                />

                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider shadow-sm z-10">
                    Completed
                  </div>
                )}
                
                <CardHeader className="pb-2 relative z-10">
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm" 
                        style={{ backgroundColor: hexToRgba(glowColor, 0.2), color: glowColor }}
                      >
                        <Target className="h-4 w-4" />
                      </div>
                      <span className="truncate">{goal.title}</span>
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(goal)} className="cursor-pointer">
                          <Edit2 className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteGoal(goal.id)} className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col justify-end pt-4 relative z-10">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm items-end">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Saved</span>
                        <span className="font-semibold text-lg leading-none">
                          {formatCurrency(goal.currentAmount, currency)}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Target</span>
                        <span className="font-medium text-sm leading-none">
                          {formatCurrency(goal.targetAmount, currency)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Progress 
                        value={progress} 
                        indicatorColor={glowColor} 
                        className="h-2.5 bg-background/50 backdrop-blur-sm" 
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium" style={{ color: glowColor }}>
                          {progress.toFixed(1)}%
                        </span>
                        {goal.targetDate && (
                          <span className="text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">
                            By {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        goalToEdit={goalToEdit}
      />
    </div>
  )
}
