import { Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SummaryCards } from "@/features/dashboard/components/SummaryCards"
import { ExpenseChart } from "@/features/dashboard/components/ExpenseChart"
import { IncomeExpenseChart } from "@/features/dashboard/components/IncomeExpenseChart"
import { RecentTransactions } from "@/features/dashboard/components/RecentTransactions"
import { SmartInsights } from "@/features/dashboard/components/SmartInsights"
import { FinancialHealthCard } from "@/features/dashboard/components/FinancialHealthCard"

import { useTranslation } from "react-i18next"

export function Dashboard() {
  const { t, i18n } = useTranslation()
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background p-8 border shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent pb-2 print:hidden">
              {t('dashboard.welcome')}
            </h1>
            <div className="hidden print:block mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-black">FINORA</h1>
              </div>
              <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-2 uppercase tracking-widest text-gray-800">Executive Financial Report</h2>
              <p className="text-sm text-gray-600 font-medium">Generated on: {new Date().toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-sm text-gray-600 mb-8 font-medium">Confidential Document</p>
            </div>
            <p className="mt-2 text-lg text-muted-foreground max-w-xl print:hidden">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <Button onClick={() => window.print()} variant="outline" className="bg-background/50 backdrop-blur-sm print:hidden">
            <Printer className="mr-2 h-4 w-4" /> {t('dashboard.printReport')}
          </Button>
        </div>
        <div className="absolute right-0 top-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>
      
      <SmartInsights />
      <FinancialHealthCard />
      <SummaryCards />

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <IncomeExpenseChart />
        <ExpenseChart />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <RecentTransactions />
      </div>
    </div>
  )
}
