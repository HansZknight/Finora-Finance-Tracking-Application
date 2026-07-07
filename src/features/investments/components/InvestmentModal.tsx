import { useState, useEffect } from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"

import { useFinance } from "@/store/FinanceContext"
import type { Investment } from "@/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface InvestmentModalProps {
  isOpen: boolean
  onClose: () => void
  investmentToEdit: Investment | null
}

const INVESTMENT_TYPES = [
  { id: "stock", label: "Stock / Equity" },
  { id: "crypto", label: "Cryptocurrency" },
  { id: "gold", label: "Gold / Precious Metals" },
  { id: "mutual_fund", label: "Mutual Fund" },
  { id: "other", label: "Other Asset" },
]

export function InvestmentModal({ isOpen, onClose, investmentToEdit }: InvestmentModalProps) {
  const { addInvestment, updateInvestment } = useFinance()
  
  const [name, setName] = useState("")
  const [symbol, setSymbol] = useState("")
  const [type, setType] = useState<Investment["type"]>("stock")
  const [quantity, setQuantity] = useState("")
  const [averageBuyPrice, setAverageBuyPrice] = useState("")
  const [currentPrice, setCurrentPrice] = useState("")
  const [color, setColor] = useState("#10b981")

  useEffect(() => {
    if (isOpen) {
      if (investmentToEdit) {
        setName(investmentToEdit.name)
        setSymbol(investmentToEdit.symbol)
        setType(investmentToEdit.type)
        setQuantity(investmentToEdit.quantity.toString())
        setAverageBuyPrice(investmentToEdit.averageBuyPrice.toString())
        setCurrentPrice(investmentToEdit.currentPrice.toString())
        setColor(investmentToEdit.color || "#10b981")
      } else {
        setName("")
        setSymbol("")
        setType("stock")
        setQuantity("")
        setAverageBuyPrice("")
        setCurrentPrice("")
        setColor("#10b981")
      }
    }
  }, [isOpen, investmentToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !symbol.trim()) {
      toast.error("Name and symbol are required")
      return
    }

    const numQuantity = parseFloat(quantity)
    const numBuyPrice = parseFloat(averageBuyPrice)
    const numCurrentPrice = parseFloat(currentPrice)

    if (!numQuantity || numQuantity <= 0) {
      toast.error("Quantity must be positive")
      return
    }

    if (!numBuyPrice || numBuyPrice <= 0) {
      toast.error("Buy price must be positive")
      return
    }

    const investment: Investment = {
      id: investmentToEdit?.id || `inv_${uuidv4()}`,
      name: name.trim(),
      symbol: symbol.trim().toUpperCase(),
      type,
      quantity: numQuantity,
      averageBuyPrice: numBuyPrice,
      currentPrice: numCurrentPrice || numBuyPrice, // default to buy price if empty
      lastUpdated: new Date().toISOString(),
      color,
    }

    if (investmentToEdit) {
      updateInvestment(investment)
      toast.success("Investment updated successfully")
    } else {
      addInvestment(investment)
      toast.success("Investment added successfully")
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{investmentToEdit ? "Edit Investment" : "Add Investment"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inv-name">Asset Name</Label>
              <Input
                id="inv-name"
                placeholder="e.g. Apple Inc, Bitcoin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-symbol">Symbol/Ticker</Label>
              <Input
                id="inv-symbol"
                placeholder="e.g. AAPL, BTC"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inv-type">Asset Type</Label>
            <select
              id="inv-type"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={type}
              onChange={(e) => setType(e.target.value as Investment["type"])}
              required
            >
              {INVESTMENT_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inv-quantity">Total Quantity</Label>
              <Input
                id="inv-quantity"
                type="number"
                step="any"
                placeholder="0.0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-buy">Avg. Buy Price (Per Unit)</Label>
              <Input
                id="inv-buy"
                type="number"
                step="any"
                placeholder="0.00"
                value={averageBuyPrice}
                onChange={(e) => setAverageBuyPrice(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inv-current">Current Price (Per Unit)</Label>
            <Input
              id="inv-current"
              type="number"
              step="any"
              placeholder={averageBuyPrice || "0.00"}
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave empty to use buy price initially.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inv-color">Theme Color</Label>
            <div className="flex gap-2">
              <Input
                id="inv-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 uppercase font-mono"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {investmentToEdit ? "Save Changes" : "Add Investment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
