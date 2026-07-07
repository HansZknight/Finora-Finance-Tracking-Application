import { useEffect } from "react"
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
import type { Category } from "@/types"

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["income", "expense", "both", "transfer"]),
  color: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  categoryToEdit?: Category | null
}

export function CategoryModal({
  isOpen,
  onClose,
  categoryToEdit,
}: CategoryModalProps) {
  const { addCategory, updateCategory } = useFinance()

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      type: "expense",
      color: "#94a3b8",
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        form.reset({
          name: categoryToEdit.name,
          type: categoryToEdit.type,
          color: categoryToEdit.color || "#94a3b8",
        })
      } else {
        form.reset({
          name: "",
          type: "expense",
          color: "#94a3b8",
        })
      }
    }
  }, [isOpen, categoryToEdit, form])

  const onSubmit = (data: CategoryFormValues) => {
    const categoryData: Category = {
      id: categoryToEdit?.id || `cat_${uuidv4()}`,
      name: data.name,
      type: data.type,
      color: data.color,
      isDefault: categoryToEdit?.isDefault || false,
    }

    if (categoryToEdit) {
      updateCategory(categoryData)
      toast.success("Category updated successfully")
    } else {
      addCategory(categoryData)
      toast.success("Category added successfully")
    }

    onClose()
  }

  const isDefaultCategory = categoryToEdit?.isDefault

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {categoryToEdit ? "Edit Category" : "Add Category"}
          </DialogTitle>
          <DialogDescription>
            {isDefaultCategory
              ? "You can only edit the color and type of default categories."
              : "Enter the details for this category."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="E.g., Subscription" 
                      disabled={isDefaultCategory}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
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
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input type="color" className="w-12 h-10 p-1" {...field} />
                        <Input type="text" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {categoryToEdit ? "Save Changes" : "Add Category"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
