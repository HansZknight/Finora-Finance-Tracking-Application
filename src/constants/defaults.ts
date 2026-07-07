import type { Category } from "@/types"

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense Categories
  { id: "cat_food", name: "Food", type: "expense", color: "#f87171", icon: "Utensils", isDefault: true },
  { id: "cat_transport", name: "Transportation", type: "expense", color: "#60a5fa", icon: "Car", isDefault: true },
  { id: "cat_shopping", name: "Shopping", type: "expense", color: "#c084fc", icon: "ShoppingBag", isDefault: true },
  { id: "cat_bills", name: "Bills", type: "expense", color: "#fb923c", icon: "Receipt", isDefault: true },
  { id: "cat_entertainment", name: "Entertainment", type: "expense", color: "#fb7185", icon: "Film", isDefault: true },
  { id: "cat_health", name: "Health", type: "expense", color: "#34d399", icon: "HeartPulse", isDefault: true },
  { id: "cat_education", name: "Education", type: "expense", color: "#38bdf8", icon: "BookOpen", isDefault: true },
  { id: "cat_debt", name: "Debt Repayment", type: "expense", color: "#f43f5e", icon: "CreditCard", isDefault: true },
  
  // Income Categories
  { id: "cat_salary", name: "Salary", type: "income", color: "#4ade80", icon: "Banknote", isDefault: true },
  { id: "cat_investment", name: "Investment", type: "income", color: "#2dd4bf", icon: "TrendingUp", isDefault: true },
  { id: "cat_freelance", name: "Freelance", type: "income", color: "#a78bfa", icon: "Laptop", isDefault: true },
  
  // Both
  { id: "cat_other", name: "Other", type: "both", color: "#94a3b8", icon: "MoreHorizontal", isDefault: true },
]
