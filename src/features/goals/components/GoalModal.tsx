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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { useFinance } from "@/store/FinanceContext"
import type { Goal } from "@/types"

const goalFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  targetAmount: z.number().positive("Target amount must be greater than zero"),
  currentAmount: z.number().min(0, "Current amount cannot be negative"),
  targetDate: z.string().optional(),
  color: z.string().optional(),
})

type GoalFormValues = z.infer<typeof goalFormSchema>

interface GoalModalProps {
  isOpen: boolean
  onClose: () => void
  goalToEdit?: Goal | null
}

export function GoalModal({
  isOpen,
  onClose,
  goalToEdit,
}: GoalModalProps) {
  const { addGoal, updateGoal } = useFinance()

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      title: "",
      targetAmount: 0,
      currentAmount: 0,
      targetDate: "",
      color: "#3b82f6",
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        form.reset({
          title: goalToEdit.title,
          targetAmount: goalToEdit.targetAmount,
          currentAmount: goalToEdit.currentAmount,
          targetDate: goalToEdit.targetDate ? goalToEdit.targetDate.split("T")[0] : "",
          color: goalToEdit.color || "#3b82f6",
        })
      } else {
        form.reset({
          title: "",
          targetAmount: 0,
          currentAmount: 0,
          targetDate: "",
          color: "#3b82f6",
        })
      }
    }
  }, [isOpen, goalToEdit, form])

  const onSubmit = (data: GoalFormValues) => {
    const goalData: Goal = {
      id: goalToEdit?.id || `goal_${uuidv4()}`,
      title: data.title,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      targetDate: data.targetDate ? new Date(data.targetDate).toISOString() : undefined,
      color: data.color,
    }

    if (goalToEdit) {
      updateGoal(goalData)
    } else {
      addGoal(goalData)
    }

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {goalToEdit ? "Edit Goal" : "Add Goal"}
          </DialogTitle>
          <DialogDescription>
            Set a new saving target or edit an existing one.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control as any}
              name="title"
              render={({ field }: any) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Vacation Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="targetAmount"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Target Amount</FormLabel>
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
                name="currentAmount"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Current Saved</FormLabel>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control as any}
                name="targetDate"
                render={({ field }: any) => (
                  <FormItem>
                    <FormLabel>Target Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control as any}
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
                {goalToEdit ? "Save Changes" : "Create Goal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
