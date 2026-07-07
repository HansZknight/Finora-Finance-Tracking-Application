import { useState, useEffect } from "react"
import { toast } from "sonner"

import { useFinance } from "@/store/FinanceContext"
import type { Wallet } from "@/types"

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

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  walletToEdit: Wallet | null
}

const WALLET_TYPES = [
  { id: "bank", label: "Bank Account" },
  { id: "ewallet", label: "E-Wallet" },
  { id: "cash", label: "Cash" },
  { id: "credit", label: "Credit Card" },
]

export function WalletModal({ isOpen, onClose, walletToEdit }: WalletModalProps) {
  const { addWallet, updateWallet, currency: globalCurrency } = useFinance()
  
  const [name, setName] = useState("")
  const [type, setType] = useState<Wallet["type"]>("bank")
  const [balance, setBalance] = useState("")
  const [color, setColor] = useState("#3b82f6")
  const [walletCurrency, setWalletCurrency] = useState(globalCurrency)

  useEffect(() => {
    if (isOpen) {
      if (walletToEdit) {
        setName(walletToEdit.name)
        setType(walletToEdit.type)
        setBalance(walletToEdit.balance.toString())
        setColor(walletToEdit.color || "#3b82f6")
        setWalletCurrency(walletToEdit.currency || globalCurrency)
      } else {
        setName("")
        setType("bank")
        setBalance("")
        setColor("#3b82f6")
        setWalletCurrency(globalCurrency)
      }
    }
  }, [isOpen, walletToEdit, globalCurrency])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error("Wallet name is required")
      return
    }

    const numBalance = parseFloat(balance) || 0

    const wallet: Wallet = {
      id: walletToEdit?.id || `wallet_${Date.now()}`,
      name: name.trim(),
      type,
      balance: numBalance,
      color,
      currency: walletCurrency as Wallet["currency"],
    }

    if (walletToEdit) {
      updateWallet(wallet)
      toast.success("Wallet updated successfully")
    } else {
      addWallet(wallet)
      toast.success("Wallet created successfully")
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{walletToEdit ? "Edit Wallet" : "Add New Wallet"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="wallet-name">Wallet Name</Label>
            <Input
              id="wallet-name"
              placeholder="e.g. BCA, GoPay, Cash"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-type">Wallet Type</Label>
            <select
              id="wallet-type"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={type}
              onChange={(e) => setType(e.target.value as Wallet["type"])}
              required
            >
              {WALLET_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-currency">Currency</Label>
            <select
              id="wallet-currency"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              value={walletCurrency}
              onChange={(e) => setWalletCurrency(e.target.value)}
              required
            >
              <option value="IDR">🇮🇩 IDR - Indonesian Rupiah</option>
              <option value="USD">🇺🇸 USD - US Dollar</option>
              <option value="EUR">🇪🇺 EUR - Euro</option>
              <option value="GBP">🇬🇧 GBP - British Pound</option>
              <option value="SGD">🇸🇬 SGD - Singapore Dollar</option>
              <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
              <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-balance">Initial Balance</Label>
            <Input
              id="wallet-balance"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              disabled={!!walletToEdit} // Disable changing initial balance if editing
            />
            {walletToEdit && (
              <p className="text-xs text-muted-foreground">Initial balance cannot be changed after creation.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="wallet-color">Theme Color</Label>
            <div className="flex gap-2">
              <Input
                id="wallet-color"
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
              {walletToEdit ? "Save Changes" : "Create Wallet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
