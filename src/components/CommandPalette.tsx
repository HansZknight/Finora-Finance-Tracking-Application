import { useEffect, useState } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  Settings, 
  Tags, 
  Repeat, 
  CreditCard,
  Plus,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'

import { useFinance } from '@/store/FinanceContext'
import { TransactionModal } from '@/features/transactions/components/TransactionModal'
import { DebtModal } from '@/features/debts/components/DebtModal'
import { GoalModal } from '@/features/goals/components/GoalModal'
import { BudgetModal } from '@/features/budget/components/BudgetModal'
import { CategoryModal } from '@/features/categories/components/CategoryModal'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { setTheme } = useFinance()

  // Modals state
  const [txModalOpen, setTxModalOpen] = useState(false)
  const [debtModalOpen, setDebtModalOpen] = useState(false)
  const [goalModalOpen, setGoalModalOpen] = useState(false)
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [catModalOpen, setCatModalOpen] = useState(false)

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <>
      <Command.Dialog 
        open={open} 
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh]"
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
          onClick={() => setOpen(false)}
        />
        
        {/* Modal Content */}
        <div className="relative z-50 w-full max-w-lg overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl">
          <Command className="w-full flex flex-col overflow-hidden">
            <div className="flex items-center border-b px-3">
              <Command.Input 
                placeholder="Type a command or search..." 
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
              <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>
              
              <Command.Group heading="Quick Actions" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                <Command.Item 
                  onSelect={() => runCommand(() => setTxModalOpen(true))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Transaction
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => setDebtModalOpen(true))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Add Debt / Loan
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => setGoalModalOpen(true))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                >
                  <Target className="mr-2 h-4 w-4" /> Create Goal
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => setBudgetModalOpen(true))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                >
                  <PieChart className="mr-2 h-4 w-4" /> Set Budget
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => setCatModalOpen(true))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
                >
                  <Tags className="mr-2 h-4 w-4" /> Add Category
                </Command.Item>
              </Command.Group>

              <Command.Separator className="-mx-1 h-px bg-border my-2" />

              <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                <Command.Item 
                  onSelect={() => runCommand(() => navigate('/'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => navigate('/transactions'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Receipt className="mr-2 h-4 w-4" /> Transactions
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => navigate('/categories'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Tags className="mr-2 h-4 w-4" /> Categories
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => navigate('/debts'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Debts & Loans
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => navigate('/budget'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <PieChart className="mr-2 h-4 w-4" /> Budget
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => navigate('/goals'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Target className="mr-2 h-4 w-4" /> Goals
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => navigate('/subscriptions'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Repeat className="mr-2 h-4 w-4" /> Subscriptions
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => navigate('/settings'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Command.Item>
              </Command.Group>

              <Command.Separator className="-mx-1 h-px bg-border my-2" />

              <Command.Group heading="Appearance" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                <Command.Item 
                  onSelect={() => runCommand(() => setTheme('light'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Sun className="mr-2 h-4 w-4" /> Light Theme
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => setTheme('dark'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Moon className="mr-2 h-4 w-4" /> Dark Theme
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => setTheme('system'))}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-2 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <Monitor className="mr-2 h-4 w-4" /> System Theme
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      </Command.Dialog>

      {/* Global Modals rendered here when triggered from command palette */}
      <TransactionModal isOpen={txModalOpen} onClose={() => setTxModalOpen(false)} />
      <DebtModal isOpen={debtModalOpen} onClose={() => setDebtModalOpen(false)} />
      <GoalModal isOpen={goalModalOpen} onClose={() => setGoalModalOpen(false)} />
      <BudgetModal isOpen={budgetModalOpen} onClose={() => setBudgetModalOpen(false)} />
      <CategoryModal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} />
    </>
  )
}
