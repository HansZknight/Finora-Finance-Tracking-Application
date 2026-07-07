import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useFinance } from "@/store/FinanceContext"
import type { Transaction } from "@/types"
import { Paperclip, X, Loader2, Camera, Sparkles } from "lucide-react"
import { compressImageToBase64 } from "@/lib/utils"

const transactionFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  categoryId: z.string().optional(),
  walletId: z.string().min(1, "Wallet is required"),
  toWalletId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  type: z.enum(["income", "expense", "transfer"]),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  receipt: z.string().optional(),
}).refine((data) => {
  if (data.type !== "transfer" && !data.categoryId) return false
  return true
}, {
  message: "Category is required for income and expenses",
  path: ["categoryId"],
}).refine((data) => {
  if (data.type === "transfer" && !data.toWalletId) return false
  return true
}, {
  message: "Destination wallet is required for transfers",
  path: ["toWalletId"],
}).refine((data) => {
  if (data.type === "transfer" && data.walletId === data.toWalletId) return false
  return true
}, {
  message: "Source and destination wallets must be different",
  path: ["toWalletId"],
})

type TransactionFormValues = z.infer<typeof transactionFormSchema>

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transactionToEdit?: Transaction | null
}

export function TransactionModal({
  isOpen,
  onClose,
  transactionToEdit,
}: TransactionModalProps) {
  const { categories, wallets, addTransaction, updateTransaction, currency } = useFinance()

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      categoryId: "",
      walletId: wallets.length > 0 ? wallets[0].id : "",
      toWalletId: "",
      date: new Date().toISOString().split("T")[0],
      type: "expense",
      notes: "",
      tags: [],
      isRecurring: false,
      recurringFrequency: "monthly",
    },
  })

  const currentType = form.watch("type")
  const currentReceipt = form.watch("receipt")
  const currentWalletId = form.watch("walletId")
  const currentWallet = wallets.find(w => w.id === currentWalletId)
  const currentWalletCurrency = currentWallet?.currency || currency
  const [isCompressing, setIsCompressing] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState("")

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsScanning(true)
      
      // First compress the image to attach it to the form
      const base64 = await compressImageToBase64(file, 800, 0.6)
      form.setValue("receipt", base64, { shouldValidate: true })

      // Run OCR dynamically
      const { scanReceipt } = await import("@/lib/ocr")
      const result = await scanReceipt(file, (msg) => setScanStatus(msg))

      let updated = false
      if (result.amount) {
        form.setValue("amount", result.amount, { shouldValidate: true })
        updated = true
      }
      if (result.merchantName && result.merchantName !== "Unknown Store") {
        form.setValue("title", result.merchantName, { shouldValidate: true })
        updated = true
      }

      if (updated) {
        toast.success("AI successfully read your receipt!")
      } else {
        toast.error("AI couldn't find clear text on the receipt.")
      }

    } catch (error) {
      console.error("OCR Error:", error)
      toast.error("Failed to scan receipt")
    } finally {
      setIsScanning(false)
      setScanStatus("")
      if (e.target) e.target.value = ''
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) { // 10MB hard limit before compression
      toast.error("File is too large. Maximum size is 10MB.")
      return
    }

    try {
      setIsCompressing(true)
      // Compress image to Base64 (max width 800px, quality 0.6)
      const base64 = await compressImageToBase64(file, 800, 0.6)
      form.setValue("receipt", base64, { shouldValidate: true })
      toast.success("Receipt attached successfully")
    } catch (error) {
      console.error("Error compressing image:", error)
      toast.error("Failed to process image")
    } finally {
      setIsCompressing(false)
      if (e.target) e.target.value = '' // Reset input
    }
  }

  // Reset form when modal opens/closes or when editing
  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        form.reset({
          title: transactionToEdit.title,
          amount: transactionToEdit.amount,
          categoryId: transactionToEdit.categoryId || "",
          walletId: transactionToEdit.walletId,
          toWalletId: transactionToEdit.toWalletId || "",
          date: transactionToEdit.date.split("T")[0],
          type: transactionToEdit.type,
          notes: transactionToEdit.notes || "",
          tags: transactionToEdit.tags || [],
          isRecurring: transactionToEdit.isRecurring || false,
          recurringFrequency: transactionToEdit.recurringFrequency || "monthly",
          receipt: transactionToEdit.receipt || "",
        })
      } else {
        form.reset({
          title: "",
          amount: 0,
          categoryId: "",
          walletId: wallets.length > 0 ? wallets[0].id : "",
          toWalletId: "",
          date: new Date().toISOString().split("T")[0],
          type: "expense",
          notes: "",
          tags: [],
          isRecurring: false,
          recurringFrequency: "monthly",
          receipt: "",
        })
      }
    }
  }, [isOpen, transactionToEdit, form, wallets])

  const onSubmit = (data: TransactionFormValues) => {
    const transactionData: Transaction = {
      id: transactionToEdit?.id || `txn_${uuidv4()}`,
      title: data.title,
      amount: data.amount,
      categoryId: data.type === "transfer" ? "" : data.categoryId!,
      walletId: data.walletId,
      toWalletId: data.type === "transfer" ? data.toWalletId : undefined,
      date: new Date(data.date).toISOString(), // Ensure ISO format
      type: data.type,
      notes: data.notes,
      tags: data.tags || [],
      isRecurring: data.isRecurring || false,
      recurringFrequency: data.isRecurring ? data.recurringFrequency : undefined,
      receipt: data.receipt,
    }

    if (data.isRecurring && !transactionToEdit?.nextRecurringDate) {
      const date = new Date(data.date)
      if (data.recurringFrequency === "daily") date.setDate(date.getDate() + 1)
      if (data.recurringFrequency === "weekly") date.setDate(date.getDate() + 7)
      if (data.recurringFrequency === "monthly") date.setMonth(date.getMonth() + 1)
      transactionData.nextRecurringDate = date.toISOString()
    } else if (data.isRecurring && transactionToEdit?.nextRecurringDate) {
      transactionData.nextRecurringDate = transactionToEdit.nextRecurringDate
    }

    if (transactionToEdit) {
      updateTransaction(transactionData)
      toast.success("Transaction updated successfully")
    } else {
      addTransaction(transactionData)
      toast.success("Transaction added successfully")
    }

    onClose()
  }

  // Filter categories by type
  const filteredCategories = categories.filter(
    (c) => c.type === currentType || c.type === "both"
  )

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transactionToEdit ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            Enter the details of your transaction below.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="type"
                render={({ field }: any) => (
                  <FormItem>
                     <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val)
                        if (val === "transfer") form.setValue("categoryId", "")
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
                name="amount"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Amount ({currentWalletCurrency})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control as any}
              name="title"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder={currentType === "transfer" ? "E.g., Transfer to GoPay" : "E.g., Groceries"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {currentType === "transfer" ? (
              <div className="grid grid-cols-2 gap-4 items-center">
                <FormField
                  control={form.control as any}
                  name="walletId"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>From Wallet</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Source" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {wallets.map((w) => (
                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control as any}
                  name="toWalletId"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>To Wallet</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Destination" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {wallets.map((w) => (
                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control as any}
                  name="walletId"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Wallet</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select wallet" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {wallets.map((w) => (
                            <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control as any}
                  name="categoryId"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control as any}
              name="date"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Press Enter)</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[44px] bg-background">
                      {(field.value || []).map((tag: string, index: number) => (
                        <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                          #{tag}
                          <button
                            type="button"
                            onClick={() => {
                              const newTags = [...(field.value || [])]
                              newTags.splice(index, 1)
                              field.onChange(newTags)
                            }}
                            className="text-primary hover:text-destructive ml-1"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                      <input
                        type="text"
                        placeholder={(!field.value || field.value.length === 0) ? "Add tags like 'Lunch' or 'Vacation'..." : ""}
                        className="flex-1 bg-transparent outline-none text-sm min-w-[120px]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault()
                            const value = e.currentTarget.value.trim().replace(/^#/, '')
                            if (value && !(field.value || []).includes(value)) {
                              field.onChange([...(field.value || []), value])
                            }
                            e.currentTarget.value = ""
                          }
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Dinner with friends" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2 border p-4 rounded-md">
              <FormLabel>Attachment / Receipt (Optional)</FormLabel>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button 
                  type="button" 
                  className="relative overflow-hidden w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-primary text-white shadow-lg shadow-indigo-500/25 border-0 hover:from-indigo-600 hover:to-primary/90"
                  disabled={isScanning || isCompressing}
                >
                  {isScanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                  {isScanning ? scanStatus : "AI Smart Scan"}
                  {!isScanning && <Sparkles className="w-3 h-3 ml-2 text-yellow-300" />}
                  <input 
                    type="file" 
                    accept="image/*"
                    capture="environment"
                    onChange={handleScanReceipt}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isScanning || isCompressing}
                  />
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="relative overflow-hidden w-full sm:w-auto"
                  disabled={isScanning || isCompressing}
                >
                  {isCompressing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Paperclip className="w-4 h-4 mr-2" />}
                  {isCompressing ? "Processing..." : "Manual Upload"}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isScanning || isCompressing}
                  />
                </Button>
                
                {currentReceipt && (
                  <div className="relative w-12 h-12 rounded-md overflow-hidden border shadow-sm group">
                    <img src={currentReceipt} alt="Receipt preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => form.setValue("receipt", "")}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Image will be automatically resized and compressed to save storage space.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 items-end">
              <FormField
                control={form.control as any}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-4 border rounded-md">
                    <FormControl>
                      <input 
                        type="checkbox" 
                        checked={field.value} 
                        onChange={field.onChange} 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Recurring Transaction
                    </FormLabel>
                  </FormItem>
                )}
              />

              {form.watch("isRecurring") && (
                <FormField
                  control={form.control as any}
                  name="recurringFrequency"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {transactionToEdit ? "Save Changes" : "Add Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
