import { useState, useEffect } from "react"

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
} from "@/components/ui/dialog"

interface DebtModalProps {
  isOpen: boolean
  onClose: () => void
  debtToEdit?: Debt | null
}

export function DebtModal({ isOpen, onClose, debtToEdit }: DebtModalProps) {
  const { addDebt, updateDebt } = useFinance()

  const [name, setName] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [paidAmount, setPaidAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [color, setColor] = useState("#f43f5e")

  useEffect(() => {
    if (isOpen) {
      if (debtToEdit) {
        setName(debtToEdit.name)
        setTotalAmount(debtToEdit.totalAmount.toString())
        setPaidAmount(debtToEdit.paidAmount.toString())
        setDueDate(debtToEdit.dueDate || "")
        setColor(debtToEdit.color || "#f43f5e")
      } else {
        setName("")
        setTotalAmount("")
        setPaidAmount("")
        setDueDate("")
        setColor("#f43f5e")
      }
    }
  }, [isOpen, debtToEdit])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const debtData: Debt = {
      id: debtToEdit ? debtToEdit.id : `debt_${Date.now()}`,
      name,
      totalAmount: parseFloat(totalAmount) || 0,
      paidAmount: parseFloat(paidAmount) || 0,
      dueDate: dueDate || undefined,
      color,
    }

    if (debtToEdit) {
      updateDebt(debtData)
    } else {
      addDebt(debtData)
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{debtToEdit ? "Edit Debt" : "Add New Debt"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Debt Name</Label>
            <Input
              id="name"
              placeholder="e.g. Mortgage, Car Loan, Credit Card"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalAmount">Total Debt Amount</Label>
            <Input
              id="totalAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAmount">Already Paid (Optional)</Label>
            <Input
              id="paidAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Theme Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 uppercase font-mono"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {debtToEdit ? "Update Debt" : "Add Debt"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
