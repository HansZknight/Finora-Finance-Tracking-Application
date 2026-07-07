import { useMemo } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

import { useFinance } from "@/store/FinanceContext"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function ExpenseChart() {
  const { transactions, categories, currency } = useFinance()

  const data = useMemo(() => {
    const expensesByCategory: Record<string, { value: number; color: string; name: string }> = {}

    transactions.forEach((t) => {
      if (t.type === "expense") {
        if (!expensesByCategory[t.categoryId]) {
          const category = categories.find((c) => c.id === t.categoryId)
          expensesByCategory[t.categoryId] = {
            value: 0,
            color: category?.color || "#8884d8",
            name: category?.name || "Unknown",
          }
        }
        expensesByCategory[t.categoryId].value += t.amount
      }
    })

    return Object.values(expensesByCategory)
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  return (
    <Card className="col-span-1 bg-card/40 backdrop-blur-xl border-primary/10 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <CardHeader className="relative z-10">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Expense Breakdown</CardTitle>
        <CardDescription>
          Where your money is going
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No expenses recorded yet
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatCurrency(Number(value), currency)}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    padding: "12px"
                  }}
                  itemStyle={{ color: "var(--foreground)", fontWeight: 500 }}
                />
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingLeft: '10px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
