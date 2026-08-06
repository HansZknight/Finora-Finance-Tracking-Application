import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts"
import { Flame, TrendingUp, DollarSign } from "lucide-react"
import { useFinance } from "@/store/FinanceContext"
import { formatCurrency } from "@/lib/utils"

export function FIRESimulator() {
  const { currency, wallets } = useFinance()
  const totalLiquidAssets = wallets.reduce((sum, w) => sum + w.balance, 0)

  const [currentAge, setCurrentAge] = useState(30)
  const [retirementAge, setRetirementAge] = useState(50)
  const [lifeExpectancy] = useState(85)
  const [currentPortfolio, setCurrentPortfolio] = useState(totalLiquidAssets)
  const [monthlyContribution, setMonthlyContribution] = useState(5000000)
  const [annualReturn, setAnnualReturn] = useState(8) // 8% avg stock market return
  const [inflationRate, setInflationRate] = useState(3) // 3% avg inflation
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState(4) // 4% rule
  const [monthlyExpenses, setMonthlyExpenses] = useState(10000000)

  const fireData = useMemo(() => {
    const data = []
    let currentBal = currentPortfolio
    
    // Calculate required FIRE number in future value (adjusted for inflation)
    const yearsToRetirement = retirementAge - currentAge
    const futureMonthlyExpenses = monthlyExpenses * Math.pow(1 + (inflationRate / 100), yearsToRetirement)
    const fireNumber = (futureMonthlyExpenses * 12) / (safeWithdrawalRate / 100)

    const netRealReturn = (annualReturn - inflationRate) / 100

    let hitFireAge = null

    for (let age = currentAge; age <= lifeExpectancy; age++) {
      if (age < retirementAge) {
        // Accumulation phase
        currentBal = currentBal * (1 + netRealReturn) + (monthlyContribution * 12)
      } else {
        // Withdrawal phase
        const currentYearExpenses = (futureMonthlyExpenses * 12) * Math.pow(1 + (inflationRate / 100), age - retirementAge)
        currentBal = currentBal * (1 + netRealReturn) - currentYearExpenses
      }

      if (currentBal >= fireNumber && hitFireAge === null) {
        hitFireAge = age
      }

      data.push({
        age,
        portfolio: Math.max(0, currentBal),
        target: fireNumber
      })
    }

    return {
      data,
      fireNumber,
      hitFireAge,
      futureMonthlyExpenses
    }
  }, [currentAge, retirementAge, lifeExpectancy, currentPortfolio, monthlyContribution, annualReturn, inflationRate, safeWithdrawalRate, monthlyExpenses])

  return (
    <Card className="border-orange-500/20 shadow-xl relative overflow-hidden bg-gradient-to-br from-card to-orange-500/5 mt-6">
      <div className="hidden sm:block absolute right-0 top-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-2xl flex items-center gap-2">
          <div className="p-2 bg-orange-500/20 rounded-xl">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          FIRE Simulator
        </CardTitle>
        <CardDescription>Financial Independence, Retire Early. See when you can safely stop working.</CardDescription>
      </CardHeader>
      
      <CardContent className="relative z-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <Label>Current Age</Label>
            <Input type="number" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Retirement Age</Label>
            <Input type="number" value={retirementAge} onChange={(e) => setRetirementAge(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Current Portfolio</Label>
            <Input type="number" value={currentPortfolio} onChange={(e) => setCurrentPortfolio(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Monthly Contribution</Label>
            <Input type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Annual Return (%)</Label>
            <Input type="number" value={annualReturn} onChange={(e) => setAnnualReturn(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Inflation Rate (%)</Label>
            <Input type="number" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Est. Monthly Expenses in Retirement</Label>
            <Input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Safe Withdrawal Rate (%)</Label>
            <Input type="number" value={safeWithdrawalRate} onChange={(e) => setSafeWithdrawalRate(Number(e.target.value))} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="col-span-1 space-y-4">
            <div className="bg-card/80 p-5 rounded-2xl border sm:backdrop-blur-sm shadow-sm">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> FIRE Number
              </p>
              <p className="text-3xl font-bold mt-2 text-orange-500">
                {formatCurrency(fireData.fireNumber, currency)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                The total portfolio value you need by age {retirementAge} to safely withdraw {safeWithdrawalRate}% every year.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border sm:backdrop-blur-sm shadow-sm ${
              fireData.data[fireData.data.length - 1].portfolio > 0 
                ? 'bg-emerald-500/10 border-emerald-500/20' 
                : 'bg-destructive/10 border-destructive/20'
            }`}>
              <p className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Portfolio at Age {lifeExpectancy}
              </p>
              <p className="text-2xl font-bold mt-2">
                {formatCurrency(fireData.data[fireData.data.length - 1].portfolio, currency)}
              </p>
              <p className="text-xs mt-2 opacity-80">
                {fireData.data[fireData.data.length - 1].portfolio > 0 
                  ? 'Your money outlasts you! You can safely retire.' 
                  : 'You run out of money. Try saving more or retiring later.'}
              </p>
            </div>
          </div>

          <div className="col-span-2 h-[350px] bg-card/40 rounded-2xl p-4 border sm:backdrop-blur-sm">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fireData.data} margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" vertical={false} />
                <XAxis 
                  dataKey="age" 
                  tickFormatter={(val) => `Age ${val}`}
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  tickFormatter={(val) => {
                    if (val >= 1000000000) return `B ${(val / 1000000000).toFixed(1)}`
                    if (val >= 1000000) return `M ${(val / 1000000).toFixed(1)}`
                    return val
                  }}
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value, currency)}
                  labelFormatter={(label) => `Age ${label}`}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="portfolio" 
                  name="Portfolio Value"
                  stroke="#f97316" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorPortfolio)" 
                />
                <ReferenceLine 
                  y={fireData.fireNumber} 
                  stroke="#10b981" 
                  strokeDasharray="3 3" 
                  label={{ position: 'top', value: 'FIRE Target', fill: '#10b981', fontSize: 12 }} 
                />
                <ReferenceLine 
                  x={retirementAge} 
                  stroke="#888888" 
                  strokeDasharray="3 3" 
                  label={{ position: 'insideTopLeft', value: 'Retire', fill: '#888888', fontSize: 12 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
