import { useState } from "react"
import { format } from "date-fns"
import { Plus, Search, Filter, Download, Paperclip } from "lucide-react"
import { toast } from "sonner"

import { motion, AnimatePresence } from "framer-motion"

import { useFinance } from "@/store/FinanceContext"
import type { Transaction } from "@/types"
import { formatCurrency } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { TransactionModal } from "@/features/transactions/components/TransactionModal"

export function Transactions() {
  const { transactions, categories, deleteTransaction, currency, wallets } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null)
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || t.type === typeFilter
    const matchesCategory = categoryFilter === "all" || t.categoryId === categoryFilter
    return matchesSearch && matchesType && matchesCategory
  })

  const getCategoryName = (id: string) => {
    return categories.find((c) => c.id === id)?.name || "Unknown"
  }

  const handleEdit = (transaction: Transaction) => {
    setTransactionToEdit(transaction)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setTransactionToEdit(null)
    setIsModalOpen(true)
  }

  const handleExportCSV = () => {
    // Build CSV header
    const headers = ["Date,Title,Category,Type,Amount,Notes"]
    
    // Build CSV rows
    const rows = filteredTransactions.map(t => {
      const date = format(new Date(t.date), "yyyy-MM-dd")
      const title = `"${t.title.replace(/"/g, '""')}"`
      const category = `"${(t.type === 'transfer' ? 'Transfer' : getCategoryName(t.categoryId!)).replace(/"/g, '""')}"`
      const type = t.type
      const amount = t.amount
      const notes = `"${(t.notes || "").replace(/"/g, '""')}"`
      return `${date},${title},${category},${type},${amount},${notes}`
    })

    const csvContent = headers.concat(rows).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `finora_transactions_${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success("Transactions exported successfully")
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage your income and expenses.</p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={handleExportCSV} className="w-full sm:w-auto px-2">
            <Download className="mr-2 h-4 w-4 shrink-0" /> <span className="truncate">Export</span>
          </Button>
          <Button onClick={handleAdd} className="w-full sm:w-auto px-2">
            <Plus className="mr-2 h-4 w-4 shrink-0" /> <span className="truncate">Add New</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
        
        <div className="grid grid-cols-2 sm:flex sm:w-auto gap-2 sm:gap-4 w-full">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full bg-background">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                <SelectValue placeholder="Type" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No transactions found. Adjust your filters or add a new one.
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredTransactions.map((t) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <TableCell className="font-medium">
                      {format(new Date(t.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {t.title}
                        {t.receipt && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingReceipt(t.receipt!)
                            }}
                            className="text-primary hover:text-primary/80 transition-colors"
                            title="View Receipt"
                          >
                            <Paperclip className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {t.isRecurring && (
                          <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground uppercase tracking-wider">
                            {t.recurringFrequency}
                          </span>
                        )}
                      </div>
                      {t.notes && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">
                          {t.notes}
                        </p>
                      )}
                      {t.tags && t.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {t.tags.map(tag => (
                            <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary uppercase tracking-wide">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {t.type === 'transfer' ? 'Transfer' : getCategoryName(t.categoryId!)}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        t.type === "income" ? "text-emerald-500" : t.type === "transfer" ? "text-violet-500" : "text-destructive"
                      }`}
                    >
                      {t.type === "income" ? "+" : t.type === "transfer" ? "" : "-"}
                      {formatCurrency(t.amount, wallets.find(w => w.id === t.walletId)?.currency || currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(t)}
                          className="h-8 px-2"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteTransaction(t.id)
                            toast.error("Transaction deleted")
                          }}
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transactionToEdit={transactionToEdit}
      />

      {/* Receipt Viewer Modal */}
      {viewingReceipt && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setViewingReceipt(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <img 
              src={viewingReceipt} 
              alt="Receipt Full View" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/20"
              onClick={(e) => e.stopPropagation()}
            />
            <Button 
              variant="secondary" 
              className="absolute top-4 right-4 rounded-full w-10 h-10 p-0 shadow-lg"
              onClick={() => setViewingReceipt(null)}
            >
              &times;
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
