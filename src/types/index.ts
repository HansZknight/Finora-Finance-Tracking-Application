import { z } from "zod"

// Enum types
export const TransactionTypeSchema = z.enum(["income", "expense", "transfer"])
export type TransactionType = z.infer<typeof TransactionTypeSchema>

export const RecurringFrequencySchema = z.enum(["daily", "weekly", "monthly"])
export type RecurringFrequency = z.infer<typeof RecurringFrequencySchema>

// Schemas
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["income", "expense", "both", "transfer"]),
  color: z.string().optional(),
  icon: z.string().optional(),
  isDefault: z.boolean().default(false),
})
export type Category = z.infer<typeof CategorySchema>

export const WalletSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["bank", "ewallet", "cash", "credit"]),
  balance: z.number().default(0),
  color: z.string().optional(),
  icon: z.string().optional(),
  currency: z.enum(["USD", "EUR", "GBP", "IDR", "SGD", "JPY", "AUD"]).optional(),
})
export type Wallet = z.infer<typeof WalletSchema>

export const TransactionSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be positive"),
  categoryId: z.string().optional(),
  walletId: z.string().min(1, "Wallet is required"),
  toWalletId: z.string().optional(), // For transfers
  date: z.string(), // ISO String
  type: TransactionTypeSchema,
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]).optional(),
  isRecurring: z.boolean().default(false).optional(),
  recurringFrequency: RecurringFrequencySchema.optional(),
  nextRecurringDate: z.string().optional(),
  receipt: z.string().optional(), // Base64 image
})
export type Transaction = z.infer<typeof TransactionSchema>

export const GoalSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  targetAmount: z.number().positive(),
  currentAmount: z.number().nonnegative().default(0),
  targetDate: z.string().optional(),
  color: z.string().optional(),
})
export type Goal = z.infer<typeof GoalSchema>

export const BudgetSchema = z.object({
  id: z.string(),
  categoryId: z.string(), // 'total' for overall budget, or specific category id
  amount: z.number().positive(),
  month: z.string(), // Format: YYYY-MM
})
export type Budget = z.infer<typeof BudgetSchema>

export const DebtSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  totalAmount: z.number().positive(),
  paidAmount: z.number().nonnegative().default(0),
  dueDate: z.string().optional(),
  color: z.string().optional(),
})
export type Debt = z.infer<typeof DebtSchema>

export const InvestmentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  symbol: z.string().min(1, "Symbol is required"),
  type: z.enum(["stock", "crypto", "gold", "mutual_fund", "other"]),
  quantity: z.number().positive("Quantity must be positive"),
  averageBuyPrice: z.number().positive("Buy price must be positive"),
  currentPrice: z.number().positive("Current price must be positive"),
  lastUpdated: z.string(), // ISO String
  color: z.string().optional(),
})
export type Investment = z.infer<typeof InvestmentSchema>

// Application State Schema for Local Storage
export const AppStateSchema = z.object({
  wallets: z.array(WalletSchema).default([]),
  transactions: z.array(TransactionSchema),
  categories: z.array(CategorySchema),
  goals: z.array(GoalSchema),
  budgets: z.array(BudgetSchema),
  debts: z.array(DebtSchema).default([]),
  investments: z.array(InvestmentSchema).default([]),
  theme: z.enum(["light", "dark", "system"]),
  currency: z.enum(["USD", "EUR", "GBP", "IDR", "SGD", "JPY", "AUD"]).default("IDR"),
  isBiometricEnabled: z.boolean().default(false).optional(),
  biometricCredentialId: z.string().nullable().default(null).optional(),
  isPro: z.boolean().default(false).optional(),
  licenseKey: z.string().optional(),
})
export type AppState = z.infer<typeof AppStateSchema>
