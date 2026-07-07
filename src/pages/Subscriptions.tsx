import { useMemo } from "react"
import { Repeat, Calendar, Flame, Zap } from "lucide-react"
import { format, parseISO } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

import { useFinance } from "@/store/FinanceContext"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

// Brand color mapping for popular subscription services
const BRAND_COLORS: Record<string, { bg: string; glow: string; text: string }> = {
  netflix: { bg: '#E50914', glow: '#E50914', text: '#fff' },
  spotify: { bg: '#1DB954', glow: '#1DB954', text: '#fff' },
  youtube: { bg: '#FF0000', glow: '#FF0000', text: '#fff' },
  disney: { bg: '#0063E5', glow: '#0063E5', text: '#fff' },
  apple: { bg: '#555555', glow: '#A2AAAD', text: '#fff' },
  amazon: { bg: '#FF9900', glow: '#FF9900', text: '#000' },
  prime: { bg: '#00A8E1', glow: '#00A8E1', text: '#fff' },
  hbo: { bg: '#B428DB', glow: '#B428DB', text: '#fff' },
  figma: { bg: '#F24E1E', glow: '#F24E1E', text: '#fff' },
  github: { bg: '#24292e', glow: '#6e40c9', text: '#fff' },
  chatgpt: { bg: '#10A37F', glow: '#10A37F', text: '#fff' },
  openai: { bg: '#10A37F', glow: '#10A37F', text: '#fff' },
  notion: { bg: '#000000', glow: '#999', text: '#fff' },
  slack: { bg: '#4A154B', glow: '#E01E5A', text: '#fff' },
  zoom: { bg: '#2D8CFF', glow: '#2D8CFF', text: '#fff' },
  dropbox: { bg: '#0061FF', glow: '#0061FF', text: '#fff' },
  gym: { bg: '#FF6B35', glow: '#FF6B35', text: '#fff' },
  internet: { bg: '#1a73e8', glow: '#1a73e8', text: '#fff' },
  wifi: { bg: '#1a73e8', glow: '#1a73e8', text: '#fff' },
  electric: { bg: '#f59e0b', glow: '#f59e0b', text: '#000' },
  listrik: { bg: '#f59e0b', glow: '#f59e0b', text: '#000' },
  air: { bg: '#3b82f6', glow: '#3b82f6', text: '#fff' },
  insurance: { bg: '#0ea5e9', glow: '#0ea5e9', text: '#fff' },
  asuransi: { bg: '#0ea5e9', glow: '#0ea5e9', text: '#fff' },
}

function detectBrand(title: string): { bg: string; glow: string; text: string } | null {
  const lower = title.toLowerCase()
  for (const [key, colors] of Object.entries(BRAND_COLORS)) {
    if (lower.includes(key)) return colors
  }
  return null
}

export function Subscriptions() {
  const { transactions, categories, currency } = useFinance()

  // Filter only recurring transactions
  const subscriptions = useMemo(() => {
    return transactions.filter(t => t.isRecurring)
  }, [transactions])

  // Calculate total monthly burn rate
  const monthlyBurnRate = useMemo(() => {
    return subscriptions.reduce((total, sub) => {
      if (sub.type === "income") return total;
      
      let monthlyEquivalent = sub.amount;
      if (sub.recurringFrequency === "daily") monthlyEquivalent = sub.amount * 30;
      if (sub.recurringFrequency === "weekly") monthlyEquivalent = sub.amount * 4.33;
      
      return total + monthlyEquivalent;
    }, 0)
  }, [subscriptions])

  // Calculate yearly projection
  const yearlyBurn = monthlyBurnRate * 12
  
  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || "Unknown"
  }

  const getCategoryColor = (id: string) => {
    return categories.find((c) => c.id === id)?.color || "#ccc"
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 via-background to-background p-8 border border-orange-500/10 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent pb-2">
              Subscriptions
            </h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-xl">
              Your money on autopilot. Know where every recurring payment goes. 🔄
            </p>
          </div>
          <Button asChild className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25 transition-all duration-300">
            <Link to="/transactions">
              <Repeat className="mr-2 h-4 w-4" /> Manage Transactions
            </Link>
          </Button>
        </div>
        <div className="absolute right-0 top-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-destructive/5 blur-3xl" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card/40 backdrop-blur-xl border-orange-500/10 shadow-lg relative overflow-hidden transition-all duration-500 hover:shadow-orange-500/20 hover:-translate-y-1 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-all duration-500" />
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-orange-500/70 transition-colors mb-2">Monthly Burn Rate</p>
                <h3 className="text-3xl font-bold text-foreground drop-shadow-sm">{formatCurrency(monthlyBurnRate, currency)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Auto-deducted each month</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-xl ring-1 ring-orange-500/20 group-hover:scale-110 transition-transform duration-300">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-destructive/10 shadow-lg relative overflow-hidden transition-all duration-500 hover:shadow-destructive/20 hover:-translate-y-1 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-destructive/20 transition-all duration-500" />
          <CardContent className="p-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground group-hover:text-destructive/70 transition-colors mb-2">Yearly Projection</p>
                <h3 className="text-3xl font-bold text-destructive drop-shadow-sm">{formatCurrency(yearlyBurn, currency)}</h3>
                <p className="text-xs text-muted-foreground mt-1">If nothing changes</p>
              </div>
              <div className="p-3 bg-destructive/10 rounded-xl ring-1 ring-destructive/20 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-primary/10 shadow-lg relative overflow-hidden transition-all duration-500 hover:shadow-primary/20 hover:-translate-y-1 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-all duration-500" />
          <CardContent className="p-6 relative z-10 flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-full ring-1 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Active Subscriptions</p>
              <h3 className="text-3xl font-bold">{subscriptions.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-16 text-center border-dashed border-2 shadow-none bg-card/20 backdrop-blur-sm">
          <div className="h-20 w-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-6 ring-2 ring-primary/10">
            <Repeat className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="text-2xl font-bold mb-2">No active subscriptions</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Keep track of your Netflix, Spotify, Gym memberships, and other recurring bills here.
          </p>
          <Button asChild className="bg-gradient-to-r from-primary to-primary/80 shadow-lg">
            <Link to="/transactions">Add a Transaction</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {subscriptions.map((sub, index) => {
              const brand = detectBrand(sub.title)
              const cardBg = brand?.bg || getCategoryColor(sub.categoryId || "")
              const cardGlow = brand?.glow || cardBg

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="flex flex-col group overflow-hidden bg-card/40 backdrop-blur-xl shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative border-white/5">
                    {/* Top brand-colored accent bar */}
                    <div className="h-1.5 w-full" style={{ backgroundColor: cardBg }} />
                    
                    {/* Glow orb */}
                    <div 
                      className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-10 group-hover:opacity-25 transition-opacity duration-700"
                      style={{ backgroundColor: cardGlow }}
                    />

                    <CardHeader className="pb-4 relative z-10">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-lg ring-2 ring-white/10 transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: cardBg, color: brand?.text || '#fff' }}
                          >
                            {sub.title.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{sub.title}</CardTitle>
                            <CardDescription className="text-xs">{getCategoryName(sub.categoryId || "")}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 flex-1 flex flex-col justify-between relative z-10">
                      <div>
                        <div className="flex justify-between items-end mb-4 p-3 rounded-xl bg-muted/30">
                          <span className="text-muted-foreground text-xs uppercase font-medium tracking-wider">Cost</span>
                          <span className={`text-2xl font-bold ${sub.type === "income" ? "text-emerald-500" : "text-foreground"}`}>
                            {sub.type === "income" ? "+" : "-"}{formatCurrency(sub.amount, currency)}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted-foreground text-xs">Frequency</span>
                            <span className="font-medium capitalize text-xs px-2 py-1 rounded-full ring-1 ring-border" style={{ backgroundColor: `${cardBg}15`, color: cardBg }}>
                              {sub.recurringFrequency}
                            </span>
                          </div>
                          
                          {sub.nextRecurringDate && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-muted-foreground text-xs">Next Billing</span>
                              <span className="font-medium text-xs">
                                {format(parseISO(sub.nextRecurringDate), "MMM dd, yyyy")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
