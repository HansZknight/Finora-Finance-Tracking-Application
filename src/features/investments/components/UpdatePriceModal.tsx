import { useState, useEffect } from "react"
import { toast } from "sonner"

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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface UpdatePriceModalProps {
  isOpen: boolean
  onClose: () => void
  investment: Investment | null
}

export function UpdatePriceModal({ isOpen, onClose, investment }: UpdatePriceModalProps) {
  const { updateInvestmentPrice, currency } = useFinance()
  const [currentPrice, setCurrentPrice] = useState("")

  useEffect(() => {
    if (isOpen && investment) {
      setCurrentPrice(investment.currentPrice.toString())
    }
  }, [isOpen, investment])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!investment) return

    const numPrice = parseFloat(currentPrice)
    if (!numPrice || numPrice <= 0) {
      toast.error("Price must be a positive number")
      return
    }

    updateInvestmentPrice(investment.id, numPrice)
    toast.success("Price updated successfully")
    onClose()
  }

  if (!investment) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Price: {investment.symbol}</DialogTitle>
          <DialogDescription>
            Update the current market price for {investment.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="current-price">New Current Price (Per Unit)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                {currency}
              </span>
              <Input
                id="current-price"
                type="number"
                step="any"
                className="pl-12"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center text-sm mt-4">
            <span className="text-muted-foreground">Previous Price:</span>
            <span className="font-semibold">{investment.currentPrice}</span>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Price
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
