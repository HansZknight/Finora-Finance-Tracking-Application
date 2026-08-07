import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AppStateSchema } from '@/types'
import type { AppState, Transaction, Category, Goal, Budget, Debt, Wallet, Investment, Contact, Trip } from '@/types'
import { getItem, setItem, STORAGE_KEY } from '@/services/storage'
import { DEFAULT_CATEGORIES } from '@/constants/defaults'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface FinanceContextType extends AppState {
  user: User | null
  syncStatus: 'idle' | 'syncing' | 'error' | 'success'
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

  addContact: (contact: Contact) => void
  updateContact: (contact: Contact) => void
  deleteContact: (id: string) => void

  addTrip: (trip: Trip) => void
  updateTrip: (trip: Trip) => void
  deleteTrip: (id: string) => void
  setActiveTripId: (id: string | null) => void

  setTheme: (theme: AppState['theme']) => void
  setCurrency: (currency: AppState['currency']) => void
  enableBiometric: (credentialId: string) => void
  disableBiometric: () => void
  activatePro: (key: string) => boolean
}

const defaultState: AppState = {
  wallets: [],
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  goals: [],
  budgets: [],
  debts: [],
  investments: [],
  contacts: [],
  trips: [],
  activeTripId: null,
  theme: 'system',
  currency: 'IDR',
  isBiometricEnabled: false,
  biometricCredentialId: null,
  isPro: false,
  licenseKey: undefined,
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

  const [user, setUser] = useState<User | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle')

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

  // Persist state changes locally
  useEffect(() => {
    setItem(STORAGE_KEY, state)
  }, [state])

  // Handle Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Fetch cloud backup on login
        setSyncStatus('syncing')
        supabase
          .from('user_backups')
          .select('app_state')
          .eq('user_id', session.user.id)
          .single()
          .then((res) => {
            if (res.error) {
              setSyncStatus('error')
              return
            }
            const data = res.data
            if (data && data.app_state) {
              // Validate and apply cloud state
              const parsed = AppStateSchema.safeParse(data.app_state)
              if (parsed.success) {
                // To avoid overwriting existing local data silently, 
                // we'll only restore if the cloud data has more transactions,
                // or if local is basically empty.
                setState(prev => {
                  if (parsed.data.transactions.length >= prev.transactions.length) {
                    return parsed.data
                  }
                  return prev
                })
              }
            }
            setSyncStatus('success')
            setTimeout(() => setSyncStatus('idle'), 3000)
          })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Auto-sync to Cloud (Debounced)
  useEffect(() => {
    if (!user) return;

    setSyncStatus('syncing')
    const timer = setTimeout(async () => {
      const { error } = await supabase
        .from('user_backups')
        .upsert({
          user_id: user.id,
          app_state: state,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })
      
      if (error) {
        console.error('Failed to sync to cloud:', error)
        setSyncStatus('error')
      } else {
        setSyncStatus('success')
        setTimeout(() => setSyncStatus('idle'), 3000)
      }
    }, 3000) // 3 seconds debounce

    return () => clearTimeout(timer)
  }, [state, user])


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
    setState(prev => ({
      ...prev,
      investments: prev.investments.map(inv => 
        inv.id === id ? { ...inv, currentPrice, lastUpdated: new Date().toISOString() } : inv
      )
    }))
  }, [])

  const addContact = useCallback((contact: Contact) => {
    setState(prev => ({ ...prev, contacts: [...prev.contacts, contact] }))
  }, [])

  const updateContact = useCallback((contact: Contact) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => c.id === contact.id ? contact : c)
    }))
  }, [])

  const deleteContact = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== id),
      // Also remove splitWith references from transactions
      transactions: prev.transactions.map(t => t.splitWith === id ? { ...t, splitWith: undefined, splitAmount: undefined } : t)
    }))
  }, [])

  const addTrip = useCallback((trip: Trip) => {
    setState(prev => ({ ...prev, trips: [...(prev.trips || []), trip] }))
  }, [])

  const updateTrip = useCallback((trip: Trip) => {
    setState(prev => ({
      ...prev,
      trips: (prev.trips || []).map(t => t.id === trip.id ? trip : t)
    }))
  }, [])

  const deleteTrip = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      trips: (prev.trips || []).filter(t => t.id !== id),
      activeTripId: prev.activeTripId === id ? null : prev.activeTripId,
      transactions: prev.transactions.map(t => t.tripId === id ? { ...t, tripId: undefined } : t)
    }))
  }, [])

  const setActiveTripId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, activeTripId: id }))
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

  const activatePro = useCallback((key: string) => {
    if (key.trim() === 'FINORA-PRO-LIFETIME') {
      setState(s => ({ ...s, isPro: true, licenseKey: key }))
      return true
    }
    return false
  }, [])

  return (
    <FinanceContext.Provider value={{
      ...state,
      user,
      syncStatus,
      exchangeRates,
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
      addContact,
      updateContact,
      deleteContact,
      addTrip,
      updateTrip,
      deleteTrip,
      setActiveTripId,
      setTheme,
      setCurrency,
      enableBiometric,
      disableBiometric,
      activatePro,
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
