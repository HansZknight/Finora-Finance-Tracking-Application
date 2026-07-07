import { useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { useFinance } from "@/store/FinanceContext"
import type { Category } from "@/types"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { motion, AnimatePresence } from "framer-motion"
import { CategoryModal } from "@/features/categories/components/CategoryModal"
import { TagsBreakdownChart } from "@/features/categories/components/TagsBreakdownChart"

export function Categories() {
  const { categories, deleteCategory } = useFinance()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)

  const handleEdit = (category: Category) => {
    setCategoryToEdit(category)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setCategoryToEdit(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Manage your transaction categories and analyze tags.</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <TagsBreakdownChart />
        </div>
        
        <div className="lg:col-span-2 bg-card rounded-2xl border shadow-sm overflow-hidden h-fit">
          <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {categories.map((c) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="group border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <TableCell>
                    <div 
                      className="w-6 h-6 rounded-full border shadow-sm" 
                      style={{ backgroundColor: c.color || '#ccc' }} 
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {c.name}
                    {c.isDefault && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="capitalize">{c.type}</TableCell>
                  <TableCell className="text-right">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(c)}
                        className="h-8 px-2"
                      >
                        Edit
                      </Button>
                      {!c.isDefault && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteCategory(c.id)
                            toast.error("Category deleted")
                          }}
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={categoryToEdit}
      />
    </div>
  )
}
