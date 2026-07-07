import { useState, useMemo } from "react"
import { Plus, Wallet as WalletIcon, ArrowRightLeft, CreditCard, Banknote, Landmark } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { useFinance } from "@/store/FinanceContext"
import type { Wallet } from "@/types"
import { formatCurrency } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WalletModal } from "@/features/wallets/components/WalletModal"

const getTypeIcon = (type: Wallet["type"]) => {
  switch (type) {
    case "bank": return <Landmark className="h-6 w-6" />
    case "ewallet": return <WalletIcon className="h-6 w-6" />
    case "cash": return <Banknote className="h-6 w-6" />
    case "credit": return <CreditCard className="h-6 w-6" />
    default: return <WalletIcon className="h-6 w-6" />
  }
}

export function Wallets() {
  const { wallets, transactions, currency, convertCurrency } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)

  // Calculate current balances dynamically
  const walletBalances = useMemo(() => {
    const balances: Record<string, number> = {}
    
    // Initialize with starting balance
    wallets.forEach(w => {
      balances[w.id] = w.balance
    })

    // Add/subtract transactions
    transactions.forEach(t => {
      if (t.type === "income") {
        if (balances[t.walletId] !== undefined) balances[t.walletId] += t.amount
      } else if (t.type === "expense") {
        if (balances[t.walletId] !== undefined) balances[t.walletId] -= t.amount
      } else if (t.type === "transfer") {
        // From wallet
        if (balances[t.walletId] !== undefined) balances[t.walletId] -= t.amount
        // To wallet
        if (t.toWalletId && balances[t.toWalletId] !== undefined) balances[t.toWalletId] += t.amount
      }
    })

    return balances
  }, [wallets, transactions])

  const totalNetWorth = useMemo(() => {
    return Object.entries(walletBalances).reduce((acc, [walletId, balance]) => {
      const wallet = wallets.find(w => w.id === walletId)
      if (!wallet) return acc
      const walletCurrency = wallet.currency || currency
      return acc + convertCurrency(balance, walletCurrency, currency)
    }, 0)
  }, [walletBalances, wallets, currency, convertCurrency])

  const handleAdd = () => {
    setSelectedWallet(null)
    setIsModalOpen(true)
  }

  const handleEdit = (w: Wallet) => {
    setSelectedWallet(w)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-background to-background p-8 border border-indigo-500/10 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent pb-2">
              Wallets & Accounts
            </h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-xl">
              Manage your diverse funds. Total Net Worth: <span className="font-bold text-indigo-500">{formatCurrency(totalNetWorth, currency)}</span>
            </p>
          </div>
          <Button onClick={handleAdd} className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25 transition-all duration-300">
            <Plus className="mr-2 h-4 w-4" /> Add Wallet
          </Button>
        </div>
        <div className="absolute right-0 top-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-32 w-64 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {wallets.map((wallet, index) => {
            const currentBalance = walletBalances[wallet.id] || 0
            const isNegative = currentBalance < 0
            const displayColor = wallet.color || "#3b82f6"

            return (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card 
                  className="flex flex-col group overflow-hidden bg-card/40 backdrop-blur-xl shadow-lg transition-all duration-500 hover:shadow-xl hover:-translate-y-1 relative border-white/5 cursor-pointer"
                  onClick={() => handleEdit(wallet)}
                >
                  <div className="h-1.5 w-full" style={{ backgroundColor: displayColor }} />
                  
                  <div 
                    className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-10 group-hover:opacity-30 transition-opacity duration-700"
                    style={{ backgroundColor: displayColor }}
                  />

                  <CardHeader className="pb-2 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                          style={{ backgroundColor: displayColor }}
                        >
                          {getTypeIcon(wallet.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{wallet.name}</CardTitle>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">{wallet.type}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 pb-6 flex-1 flex flex-col justify-end relative z-10">
                    <div className="flex justify-between items-end">
                      <span className="text-muted-foreground text-sm font-medium">Balance</span>
                      <span className={`text-2xl font-bold tracking-tight ${isNegative ? "text-destructive" : ""}`}>
                        {formatCurrency(currentBalance, wallet.currency || currency)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <WalletModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        walletToEdit={selectedWallet} 
      />
    </div>
  )
}
