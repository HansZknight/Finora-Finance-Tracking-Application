import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format, parseISO } from "date-fns"

import { useFinance } from "@/store/FinanceContext"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function IncomeExpenseChart() {
  const { transactions, currency } = useFinance()

  const data = useMemo(() => {
    // Group transactions by month
    const monthlyData: Record<string, { month: string; income: number; expense: number; dateStr: string }> = {}

    transactions.forEach((t) => {
      // Assuming ISO date string
      const date = parseISO(t.date)
      const monthKey = format(date, "yyyy-MM") // e.g., 2023-10
      const monthLabel = format(date, "MMM yyyy") // e.g., Oct 2023

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          income: 0,
          expense: 0,
          dateStr: monthKey,
        }
      }

      if (t.type === "income") {
        monthlyData[monthKey].income += t.amount
      } else {
        monthlyData[monthKey].expense += t.amount
      }
    })

    // Sort chronologically and take last 6 months
    return Object.values(monthlyData)
      .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
      .slice(-6)
  }, [transactions])

  return (
    <Card className="col-span-1 lg:col-span-2 bg-card/40 backdrop-blur-xl border-emerald-500/10 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-emerald-500/10 transition-all duration-1000" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-destructive/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 group-hover:bg-destructive/10 transition-all duration-1000" />
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Cash Flow</CardTitle>
        <CardDescription>
          Income vs Expenses over time (Last 6 months)
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No transactions recorded yet
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickFormatter={(value) => `$${value}`}
                  dx={-10}
                />
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value), currency)}
                  cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "16px",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                    padding: "16px",
                    borderWidth: "1px",
                  }}
                  itemStyle={{ color: "var(--foreground)", fontWeight: 600, fontSize: "14px" }}
                  labelStyle={{ color: "var(--muted-foreground)", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "24px" }}
                  iconType="circle"
                  iconSize={10}
                />
                <Bar 
                  dataKey="income" 
                  name="Income" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
                <Bar 
                  dataKey="expense" 
                  name="Expense" 
                  fill="#ef4444" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
