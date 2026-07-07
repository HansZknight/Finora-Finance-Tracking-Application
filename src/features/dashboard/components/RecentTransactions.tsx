import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useTranslation } from "react-i18next"

import { useFinance } from "@/store/FinanceContext"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function RecentTransactions() {
  const { t } = useTranslation()
  const { transactions, categories, currency } = useFinance()

  // Get the 5 most recent transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || "Unknown"
  }

  const getCategoryColor = (id: string) => {
    return categories.find((c) => c.id === id)?.color || "#ccc"
  }

  return (
    <Card className="col-span-1 lg:col-span-3 bg-card/40 backdrop-blur-xl border-primary/10 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
      <CardHeader className="flex flex-row items-center justify-between relative z-10">
        <div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t('dashboard.recentTransactions')}</CardTitle>
          <CardDescription>
            Your latest financial activities
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10 transition-colors">
          <Link to="/transactions" className="flex items-center gap-1">
            {t('dashboard.viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="relative z-10">
        {recentTransactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            {t('dashboard.noTransactions')}
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 hover:bg-primary/5 rounded-xl transition-all duration-300 hover:shadow-sm border border-transparent hover:border-primary/10">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white/10"
                    style={{ backgroundColor: t.type === 'transfer' ? '#8b5cf6' : getCategoryColor(t.categoryId!) }}
                  >
                    {t.type === 'transfer' ? 'T' : getCategoryName(t.categoryId!).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{t.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(parseISO(t.date), "MMM dd, yyyy")} • {t.type === 'transfer' ? 'Transfer' : getCategoryName(t.categoryId!)}
                    </p>
                  </div>
                </div>
                <div className={`font-semibold text-sm px-3 py-1 rounded-full ${t.type === 'income' ? 'text-emerald-500 bg-emerald-500/10' : t.type === 'transfer' ? 'text-violet-500 bg-violet-500/10' : 'text-destructive bg-destructive/10'}`}>
                  {t.type === 'income' ? '+' : t.type === 'transfer' ? '' : '-'}{formatCurrency(t.amount, currency)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
