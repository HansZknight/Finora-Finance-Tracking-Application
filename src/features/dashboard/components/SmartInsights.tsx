import { useMemo } from "react"
import { Sparkles, TrendingUp, AlertTriangle, Info } from "lucide-react"

import { useFinance } from "@/store/FinanceContext"
import { generateInsights } from "@/lib/insights"
import type { Insight } from "@/lib/insights"
import { Card, CardContent } from "@/components/ui/card"

import { useTranslation } from "react-i18next"

export function SmartInsights() {
  const { t } = useTranslation()
  const { transactions, budgets, goals } = useFinance()

  const insights = useMemo(() => {
    return generateInsights(transactions, budgets, goals)
  }, [transactions, budgets, goals])

  if (insights.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-emerald-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case "positive":
        return "bg-emerald-500/10 border-emerald-500/20"
      case "warning":
        return "bg-amber-500/10 border-amber-500/20"
      default:
        return "bg-blue-500/10 border-blue-500/20"
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="p-1.5 bg-primary/10 rounded-lg">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h2 className="text-lg font-bold tracking-tight">{t('dashboard.smartInsights')}</h2>
      </div>
      
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 snap-x hide-scrollbar">
        {insights.map((insight: Insight) => (
          <Card 
            key={insight.id} 
            className={`flex-none w-[280px] sm:w-[320px] snap-center shadow-none border ${getBgColor(insight.type)} transition-all hover:scale-[1.02]`}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 bg-background p-2 rounded-full shadow-sm">
                  {getIcon(insight.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.message}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
