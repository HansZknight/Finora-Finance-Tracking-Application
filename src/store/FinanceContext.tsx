import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AppStateSchema } from '@/types'
import type { AppState, Transaction, Category, Goal, Budget, Debt, Wallet, Investment } from '@/types'
import { getItem, setItem, STORAGE_KEY } from '@/services/storage'
import { DEFAULT_CATEGORIES } from '@/constants/defaults'

interface FinanceContextType extends AppState {
  exchangeRates: Record<string, number>
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => number
  // Actions
  addWallet: (wallet: Wallet) => void
  updateWallet: (wallet: Wallet) => void
  deleteWallet: (id: string) => void

  addTransaction: (transaction: Transaction) => void
  updateTransaction: (transaction: Transaction) => void
  deleteTransaction: (id: string) => void
  
  addCategory: (category: Category) => void
  updateCategory: (category: Category) => void
  deleteCategory: (id: string) => void
  
  addGoal: (goal: Goal) => void
  updateGoal: (goal: Goal) => void
  deleteGoal: (id: string) => void
  
  updateBudget: (budget: Budget) => void
  
  addDebt: (debt: Debt) => void
  updateDebt: (debt: Debt) => void
  deleteDebt: (id: string) => void
  addDebtPayment: (debtId: string, amount: number, date: string, walletId: string, notes?: string) => void
  
  addInvestment: (investment: Investment) => void
  updateInvestment: (investment: Investment) => void
  deleteInvestment: (id: string) => void
  updateInvestmentPrice: (id: string, currentPrice: number) => void

  setTheme: (theme: AppState['theme']) => void
  setCurrency: (currency: AppState['currency']) => void
  enableBiometric: (credentialId: string) => void
  disableBiometric: () => void
}

const defaultState: AppState = {
  wallets: [],
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  goals: [],
  budgets: [],
  debts: [],
  investments: [],
  theme: 'system',
  currency: 'IDR',
  isBiometricEnabled: false,
  biometricCredentialId: null,
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const stored = getItem(STORAGE_KEY, null)
    if (stored) {
      // Validate schema on load to prevent broken states
      const parsed = AppStateSchema.safeParse(stored)
      if (parsed.success) {
        return parsed.data
      } else {
        console.warn("Stored data failed validation, resetting to defaults", parsed.error)
      }
    }
    return defaultState
  })

  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('finora-rates')
    if (cached) {
      try { return JSON.parse(cached) } catch(e) {}
    }
    return { USD: 1 } // Default fallback
  })

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates) {
          const rates = { ...data.rates, USD: 1 }
          setExchangeRates(rates)
          localStorage.setItem('finora-rates', JSON.stringify(rates))
        }
      })
      .catch(err => console.error("Failed to fetch exchange rates", err))
  }, [])

  const convertCurrency = useCallback((amount: number, fromCurrency: string, toCurrency: string) => {
    if (fromCurrency === toCurrency) return amount;
    
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    // Convert to USD first, then to target currency
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  }, [exchangeRates])

  // Migration: If we have transactions but no wallets, create a default Main Wallet
  useEffect(() => {
    if ((!state.wallets || state.wallets.length === 0) && state.transactions.length > 0) {
      const defaultWallet: Wallet = {
        id: `wallet_main`,
        name: "Main Wallet",
        type: "bank",
        balance: 0,
        color: "#3b82f6",
      }
      
      const updatedTransactions = state.transactions.map(t => ({
        ...t,
        walletId: t.walletId || defaultWallet.id
      }))

      setState(s => ({
        ...s,
        wallets: [defaultWallet],
        transactions: updatedTransactions
      }))
    } else if (!state.wallets || state.wallets.length === 0) {
      // Just initialize a default wallet for new users
       const defaultWallet: Wallet = {
        id: `wallet_main`,
        name: "Main Wallet",
        type: "bank",
        balance: 0,
        color: "#3b82f6",
      }
      setState(s => ({
        ...s,
        wallets: [defaultWallet]
      }))
    }
  }, [state.wallets, state.transactions.length])

  // Persist state changes
  useEffect(() => {
    setItem(STORAGE_KEY, state)
  }, [state])

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    if (state.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(state.theme)
    }
  }, [state.theme])

  // Process Recurring Transactions
  useEffect(() => {
    const now = new Date()
    let hasUpdates = false
    const newTransactions: Transaction[] = []
    
    const updatedTransactions = state.transactions.map(t => {
      if (t.isRecurring && t.nextRecurringDate) {
        const nextDate = new Date(t.nextRecurringDate)
        
        if (nextDate <= now) {
          hasUpdates = true
          
          // Create the new transaction instance
          const clonedTxn: Transaction = {
            ...t,
            id: `txn_rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            date: t.nextRecurringDate,
          }
          newTransactions.push(clonedTxn)
          
          // Update the original transaction's next date
          const nextNextDate = new Date(t.nextRecurringDate)
          if (t.recurringFrequency === "daily") nextNextDate.setDate(nextNextDate.getDate() + 1)
          if (t.recurringFrequency === "weekly") nextNextDate.setDate(nextNextDate.getDate() + 7)
          if (t.recurringFrequency === "monthly") nextNextDate.setMonth(nextNextDate.getMonth() + 1)
          
          return { ...t, nextRecurringDate: nextNextDate.toISOString() }
        }
      }
      return t
    })

    if (hasUpdates) {
      setState(s => ({
        ...s,
        transactions: [...newTransactions, ...updatedTransactions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }))
    }
  }, [state.transactions])

  // Callbacks for actions to maintain referential equality
  const addWallet = useCallback((w: Wallet) => {
    setState(s => ({ ...s, wallets: [...s.wallets, w] }))
  }, [])

  const updateWallet = useCallback((w: Wallet) => {
    setState(s => ({
      ...s,
      wallets: s.wallets.map(item => item.id === w.id ? w : item)
    }))
  }, [])

  const deleteWallet = useCallback((id: string) => {
    setState(s => ({
      ...s,
      wallets: s.wallets.filter(item => item.id !== id),
      // Optionally handle transactions tied to this wallet, for now we keep them to not lose history
    }))
  }, [])

  const addTransaction = useCallback((t: Transaction) => {
    setState(s => ({ ...s, transactions: [t, ...s.transactions] }))
  }, [])

  const updateTransaction = useCallback((t: Transaction) => {
    setState(s => ({
      ...s,
      transactions: s.transactions.map(item => item.id === t.id ? t : item)
    }))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setState(s => ({
      ...s,
      transactions: s.transactions.filter(item => item.id !== id)
    }))
  }, [])

  const addCategory = useCallback((c: Category) => {
    setState(s => ({ ...s, categories: [...s.categories, c] }))
  }, [])

  const updateCategory = useCallback((c: Category) => {
    setState(s => ({
      ...s,
      categories: s.categories.map(item => item.id === c.id ? c : item)
    }))
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setState(s => ({
      ...s,
      categories: s.categories.filter(item => item.id !== id)
    }))
  }, [])

  const addGoal = useCallback((g: Goal) => {
    setState(s => ({ ...s, goals: [...s.goals, g] }))
  }, [])

  const updateGoal = useCallback((g: Goal) => {
    setState(s => ({
      ...s,
      goals: s.goals.map(item => item.id === g.id ? g : item)
    }))
  }, [])

  const deleteGoal = useCallback((id: string) => {
    setState(s => ({
      ...s,
      goals: s.goals.filter(item => item.id !== id)
    }))
  }, [])

  const updateBudget = useCallback((b: Budget) => {
    setState(s => {
      const exists = s.budgets.find(item => item.categoryId === b.categoryId && item.month === b.month)
      if (exists) {
        return {
          ...s,
          budgets: s.budgets.map(item => item.id === exists.id ? b : item)
        }
      }
      return { ...s, budgets: [...s.budgets, b] }
    })
  }, [])

  const addDebt = useCallback((d: Debt) => {
    setState(s => ({ ...s, debts: [...(s.debts || []), d] }))
  }, [])

  const updateDebt = useCallback((d: Debt) => {
    setState(s => ({
      ...s,
      debts: (s.debts || []).map(item => item.id === d.id ? d : item)
    }))
  }, [])

  const deleteDebt = useCallback((id: string) => {
    setState(s => ({
      ...s,
      debts: (s.debts || []).filter(item => item.id !== id)
    }))
  }, [])

  const addDebtPayment = useCallback((debtId: string, amount: number, date: string, walletId: string, notes?: string) => {
    setState(s => {
      const debt = (s.debts || []).find(d => d.id === debtId)
      if (!debt) return s

      // Update debt paid amount
      const updatedDebt = { ...debt, paidAmount: debt.paidAmount + amount }
      
      // Create expense transaction
      const transaction: Transaction = {
        id: `txn_${Date.now()}`,
        title: `Payment: ${debt.name}`,
        amount,
        categoryId: "cat_debt",
        walletId,
        date,
        type: "expense",
        notes
      }

      return {
        ...s,
        debts: s.debts.map(d => d.id === debtId ? updatedDebt : d),
        transactions: [transaction, ...s.transactions]
      }
    })
  }, [])

  const addInvestment = useCallback((inv: Investment) => {
    setState(s => ({ ...s, investments: [...(s.investments || []), inv] }))
  }, [])

  const updateInvestment = useCallback((inv: Investment) => {
    setState(s => ({
      ...s,
      investments: (s.investments || []).map(item => item.id === inv.id ? inv : item)
    }))
  }, [])

  const deleteInvestment = useCallback((id: string) => {
    setState(s => ({
      ...s,
      investments: (s.investments || []).filter(item => item.id !== id)
    }))
  }, [])

  const updateInvestmentPrice = useCallback((id: string, currentPrice: number) => {
    setState(s => ({
      ...s,
      investments: (s.investments || []).map(item => 
        item.id === id 
          ? { ...item, currentPrice, lastUpdated: new Date().toISOString() } 
          : item
      )
    }))
  }, [])


  const setTheme = useCallback((theme: AppState['theme']) => {
    setState(s => ({ ...s, theme }))
  }, [])

  const setCurrency = useCallback((currency: AppState['currency']) => {
    setState(s => ({ ...s, currency }))
  }, [])

  const enableBiometric = useCallback((credentialId: string) => {
    setState(s => ({ ...s, isBiometricEnabled: true, biometricCredentialId: credentialId }))
  }, [])

  const disableBiometric = useCallback(() => {
    setState(s => ({ ...s, isBiometricEnabled: false, biometricCredentialId: null }))
  }, [])

  return (
    <FinanceContext.Provider value={{
      ...state,
      addWallet,
      updateWallet,
      deleteWallet,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      addGoal,
      updateGoal,
      deleteGoal,
      updateBudget,
      addDebt,
      updateDebt,
      deleteDebt,
      addDebtPayment,
      addInvestment,
      updateInvestment,
      deleteInvestment,
      updateInvestmentPrice,
      setTheme,
      setCurrency,
      enableBiometric,
      disableBiometric,
      exchangeRates,
      convertCurrency
    }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider')
  }
  return context
}
