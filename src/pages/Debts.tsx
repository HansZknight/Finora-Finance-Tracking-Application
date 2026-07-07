import { useState } from "react"
import { Plus, CreditCard, Calendar, CheckCircle2, TrendingUp, Edit, Trash2, Sparkles, Crown } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

import { useFinance } from "@/store/FinanceContext"
import type { Debt } from "@/types"
import { formatCurrency } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import { DebtModal } from "@/features/debts/components/DebtModal"
import { DebtPaymentModal } from "@/features/debts/components/DebtPaymentModal"

export function Debts() {
  const { debts, deleteDebt, currency, isPro } = useFinance()
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null)

  const handleAdd = () => {
    setSelectedDebt(null)
    setIsDebtModalOpen(true)
  }

  const handleEdit = (debt: Debt) => {
    setSelectedDebt(debt)
    setIsDebtModalOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this debt record?")) {
      deleteDebt(id)
      toast.error("Debt deleted")
    }
  }

  const handlePay = (debt: Debt) => {
    setSelectedDebt(debt)
    setIsPaymentModalOpen(true)
  }

  const totalDebt = (debts || []).reduce((sum, d) => sum + d.totalAmount, 0)
  const totalPaid = (debts || []).reduce((sum, d) => sum + d.paidAmount, 0)
  const remainingDebt = totalDebt - totalPaid
  const overallProgress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0

  return (
    <div className="space-y-6 pb-20 md:pb-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!isPro && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-xl">
          <div className="text-center p-8 bg-card border rounded-2xl shadow-2xl max-w-sm mx-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Pro Feature</h2>
            <p className="text-muted-foreground mb-6">Upgrade to PRO to track loans and debts efficiently.</p>
            <Button className="w-full">Upgrade to Pro</Button>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-destructive/10 via-background to-background p-8 border border-destructive/10 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent pb-2">
              Debts & Loans
            </h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-xl">
              Crush your debts one payment at a time. You've got this! 💪
            </p>
          </div>
          <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25 transition-all duration-300">
            <Plus className="mr-2 h-4 w-4" /> Add Debt
          </Button>
        </div>
        <div className="absolute right-0 top-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-destructive/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/40 backdrop-blur-xl border-destructive/10 shadow-lg relative overflow-hidden transition-all duration-500 hover:shadow-destructive/20 hover:-translate-y-1 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-destructive/20 transition-all duration-500" />
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-destructive/70 transition-colors mb-2">Total Remaining</p>
                <h3 className="text-3xl font-bold text-destructive drop-shadow-sm">{formatCurrency(remainingDebt, currency)}</h3>
              </div>
              <div className="p-3 bg-destructive/10 rounded-xl ring-1 ring-destructive/20 group-hover:scale-110 transition-transform duration-300">
                <CreditCard className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-xl border-emerald-500/10 shadow-lg relative overflow-hidden transition-all duration-500 hover:shadow-emerald-500/20 hover:-translate-y-1 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-500" />
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-emerald-500/70 transition-colors mb-2">Total Paid Off</p>
                <h3 className="text-3xl font-bold text-emerald-500 drop-shadow-sm">{formatCurrency(totalPaid, currency)}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl ring-1 ring-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-primary/10 shadow-lg relative overflow-hidden transition-all duration-500 hover:shadow-primary/20 hover:-translate-y-1 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-500" />
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-primary/70 transition-colors mb-2">Overall Progress</p>
                <h3 className="text-3xl font-bold drop-shadow-sm">{Math.round(overallProgress)}%</h3>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {!debts || debts.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none bg-card/20 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-20 w-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-6 ring-2 ring-primary/10">
              <CreditCard className="h-10 w-10 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No active debts</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              You don't have any debts or loans tracked yet. Add one to start monitoring your repayment progress.
            </p>
            <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-primary/80 shadow-lg">Add Your First Debt</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {debts.map((debt, index) => {
              const progress = (debt.paidAmount / debt.totalAmount) * 100
              const isCompleted = progress >= 100
              const debtColor = debt.color || '#f43f5e'
              
              return (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className={`flex flex-col shadow-lg overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1 group relative ${isCompleted ? 'ring-2 ring-emerald-500/30 shadow-emerald-500/10' : ''}`} style={{ backgroundColor: isCompleted ? undefined : undefined }}>
                    {/* Top gradient bar */}
                    <div className="h-1.5 w-full relative overflow-hidden" style={{ backgroundColor: `${debtColor}30` }}>
                      <div className="h-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: debtColor }} />
                    </div>

                    {/* Glow effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ backgroundColor: debtColor }} />

                    {isCompleted && (
                      <div className="absolute top-3 right-3 z-20">
                        <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ring-emerald-500/30">
                          <Sparkles className="h-3 w-3" /> Paid Off
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="pb-4 relative z-10">
                      <div className="w-full pr-20">
                        <h3 className="font-bold text-xl mb-1 line-clamp-1">{debt.name}</h3>
                        {debt.dueDate && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            Due: {format(new Date(debt.dueDate), "MMM dd, yyyy")}
                          </div>
                        )}
                      </div>
                      
                      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-1">
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="h-8 w-8 bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background"
                          onClick={() => handleEdit(debt)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-8 w-8 shadow-sm"
                          onClick={() => handleDelete(debt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pb-4 flex-1 relative z-10">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Remaining</p>
                          <p className="font-bold text-lg">{formatCurrency(debt.totalAmount - debt.paidAmount, currency)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Total</p>
                          <p className="font-medium text-sm text-muted-foreground">{formatCurrency(debt.totalAmount, currency)}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 mt-4">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold">{Math.round(progress)}% Paid</span>
                          <span className="text-muted-foreground">{formatCurrency(debt.paidAmount, currency)}</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full overflow-hidden bg-muted/50 relative">
                          <div 
                            className="h-full rounded-full transition-all duration-1000 relative"
                            style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: debtColor }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0 bg-muted/10 border-t flex gap-2 relative z-10">
                      <Button 
                        variant={isCompleted ? "outline" : "default"}
                        className={`w-full mt-4 transition-all duration-300 ${!isCompleted ? 'bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25' : ''}`}
                        onClick={() => handlePay(debt)}
                        disabled={isCompleted}
                      >
                        {isCompleted ? (
                          <><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Fully Paid</>
                        ) : (
                          "Add Payment"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <DebtModal 
        isOpen={isDebtModalOpen} 
        onClose={() => setIsDebtModalOpen(false)} 
        debtToEdit={selectedDebt} 
      />

      <DebtPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        debt={selectedDebt}
      />
    </div>
  )
}
