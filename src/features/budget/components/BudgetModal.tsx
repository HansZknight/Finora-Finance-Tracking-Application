import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { v4 as uuidv4 } from "uuid"

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
import type { Budget } from "@/types"

const budgetFormSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  amount: z.number().positive("Budget amount must be greater than zero"),
  month: z.string().min(1, "Month is required"),
})

type BudgetFormValues = z.infer<typeof budgetFormSchema>

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
  budgetToEdit?: Budget | null
  defaultMonth?: string
}

export function BudgetModal({
  isOpen,
  onClose,
  budgetToEdit,
  defaultMonth,
}: BudgetModalProps) {
  const { categories, updateBudget } = useFinance()
  const expenseCategories = categories.filter((c) => c.type === "expense" || c.type === "both")

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: "total",
      amount: 0,
      month: defaultMonth || new Date().toISOString().slice(0, 7), // YYYY-MM
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (budgetToEdit) {
        form.reset({
          categoryId: budgetToEdit.categoryId,
          amount: budgetToEdit.amount,
          month: budgetToEdit.month,
        })
      } else {
        form.reset({
          categoryId: "total",
          amount: 0,
          month: defaultMonth || new Date().toISOString().slice(0, 7),
        })
      }
    }
  }, [isOpen, budgetToEdit, defaultMonth, form])

  const onSubmit = (data: BudgetFormValues) => {
    const budgetData: Budget = {
      id: budgetToEdit?.id || `bud_${uuidv4()}`,
      categoryId: data.categoryId,
      amount: data.amount,
      month: data.month,
    }

    // updateBudget handles both adding new and updating existing budgets for the same category+month
    updateBudget(budgetData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {budgetToEdit ? "Edit Budget" : "Set Budget"}
          </DialogTitle>
          <DialogDescription>
            Set a spending limit for a specific category or overall.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <SelectItem value="total">Overall Budget (All Categories)</SelectItem>
                      {expenseCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
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
                  <FormLabel>Limit Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      step="0.01"
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="month"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Month</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {budgetToEdit ? "Save Changes" : "Set Budget"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
