import { useMemo } from "react"
import { useFinance } from "@/store/FinanceContext"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Hash } from "lucide-react"

export function TagsBreakdownChart() {
  const { transactions, currency } = useFinance()

  const data = useMemo(() => {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const tagTotals: Record<string, number> = {}

    transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .forEach(t => {
        if (t.tags && t.tags.length > 0) {
          t.tags.forEach(tag => {
            tagTotals[tag] = (tagTotals[tag] || 0) + t.amount
          })
        }
      })

    return Object.entries(tagTotals)
      .map(([name, value]) => ({ name: `#${name}`, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) // Top 5
  }, [transactions])

  if (data.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-background via-background to-muted/20 border-primary/10 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="w-5 h-5 text-primary" /> Top Expense Tags
          </CardTitle>
          <CardDescription>Breakdown by hashtags for this month.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed rounded-xl border-muted">
            Add tags to your transactions to see insights here.
          </div>
        </CardContent>
      </Card>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/90 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl">
          <p className="text-sm font-medium mb-1 text-primary">{payload[0].payload.name}</p>
          <p className="text-base font-bold text-foreground">
            {formatCurrency(payload[0].value, currency)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-gradient-to-br from-background via-background to-muted/20 border-primary/10 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Hash className="w-5 h-5 text-primary" /> Top Expense Tags
        </CardTitle>
        <CardDescription>Your top 5 specific expenses this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="opacity-10" />
              <XAxis 
                type="number" 
                hide 
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                className="text-foreground"
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Bar 
                dataKey="value" 
                fill="currentColor" 
                radius={[0, 4, 4, 0]}
                className="fill-primary"
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
