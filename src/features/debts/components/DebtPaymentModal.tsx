import { useState, useEffect } from "react"
import { format } from "date-fns"
import { toast } from "sonner"

import { useFinance } from "@/store/FinanceContext"
import type { Debt } from "@/types"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface DebtPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  debt: Debt | null
}

export function DebtPaymentModal({ isOpen, onClose, debt }: DebtPaymentModalProps) {
  const { addDebtPayment, wallets } = useFinance()
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [notes, setNotes] = useState("")
  const [walletId, setWalletId] = useState("")

  useEffect(() => {
    if (isOpen) {
      setAmount("")
      setDate(format(new Date(), "yyyy-MM-dd"))
      setNotes(debt ? `Payment for ${debt.name}` : "")
      if (wallets.length > 0) setWalletId(wallets[0].id)
    }
  }, [isOpen, debt, wallets])

  if (!debt) return null

  const remaining = debt.totalAmount - debt.paidAmount

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) return
    
    if (numAmount > remaining) {
      toast.error("Payment amount cannot exceed remaining debt")
      return
    }

    if (!walletId) {
      toast.error("Please select a wallet")
      return
    }

    addDebtPayment(debt.id, numAmount, new Date(date).toISOString(), walletId, notes)
    toast.success("Payment recorded successfully")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay Debt: {debt.name}</DialogTitle>
          <DialogDescription>
            This will reduce your debt balance and automatically record an expense transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="pay-amount">Amount to Pay</Label>
            <Input
              id="pay-amount"
              type="number"
              min="0.01"
              max={remaining}
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-date">Payment Date</Label>
            <Input
              id="pay-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-wallet">Payment Source (Wallet)</Label>
            <select
              id="pay-wallet"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              required
            >
              <option value="" disabled>Select wallet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pay-notes">Notes (Optional)</Label>
            <Input
              id="pay-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Confirm Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
