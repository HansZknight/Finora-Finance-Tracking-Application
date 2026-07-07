import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, PieChart, Target, Settings, Menu, Tags, Repeat, CreditCard, LineChart, Wallet, TrendingUp, X, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'

import { CommandPalette } from '@/components/CommandPalette'
import { usePWAInstall } from '@/hooks/usePWAInstall'

const sidebarNavItems = [
  {
    titleKey: "nav.dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    titleKey: "nav.projections",
    href: "/projections",
    icon: LineChart,
  },
  {
    titleKey: "nav.transactions",
    href: "/transactions",
    icon: Receipt,
  },
  {
    titleKey: "nav.wallets",
    href: "/wallets",
    icon: Wallet,
  },
  {
    titleKey: "nav.investments",
    href: "/investments",
    icon: TrendingUp,
  },
  {
    titleKey: "nav.categories",
    href: "/categories",
    icon: Tags,
  },
  {
    titleKey: "nav.subscriptions",
    href: "/subscriptions",
    icon: Repeat,
  },
  {
    titleKey: "nav.debts",
    href: "/debts",
    icon: CreditCard,
  },
  {
    titleKey: "nav.budget",
    href: "/budget",
    icon: PieChart,
  },
  {
    titleKey: "nav.goals",
    href: "/goals",
    icon: Target,
  },
  {
    titleKey: "nav.settings",
    href: "/settings",
    icon: Settings,
  },
]

export function AppLayout() {
  const { t } = useTranslation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const { isInstallable, promptInstall } = usePWAInstall()

  // Trigger Cmd+K programmatically
  const triggerCommandPalette = () => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "k",
        ctrlKey: true, // we use ctrlKey to match either ctrl+k or cmd+k
      })
    )
  }

  return (
    <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
      {/* Background Ambient Mesh - Hidden on mobile for performance */}
      <div className="fixed inset-0 z-0 pointer-events-none print:hidden hidden md:block">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] -translate-x-1/2 -translate-y-1/2 mix-blend-normal"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[150px] translate-x-1/3 translate-y-1/3 mix-blend-normal"></div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-col border-r bg-card/60 backdrop-blur-xl px-4 py-6 sm:flex relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="mb-6 flex items-center gap-2 px-2">
          <img src="/favicon.png" alt="Finora" className="h-8 w-8 rounded-lg" />
          <span className="text-xl font-bold tracking-tight">Finora</span>
        </div>
        
        <div className="mb-6 px-2">
          <button 
            onClick={triggerCommandPalette}
            className="flex w-full items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground shadow-sm hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-2">
              <span className="w-4 h-4">🔍</span>
              {t('nav.search')}
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {sidebarNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              replace={true}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 hover:text-primary hover:bg-primary/5",
                  isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {t(item.titleKey)}
            </NavLink>
          ))}
        </nav>

        {isInstallable && (
          <div className="mt-auto pt-4 px-2">
            <button
              onClick={promptInstall}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-primary px-4 py-3 text-sm font-bold text-white shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Install App
            </button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col relative z-10 w-full min-w-0 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b bg-card/70 backdrop-blur-md px-4 sm:hidden sticky top-0 z-20">
          <div className="flex items-center">
            <button 
              className="mr-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            <div className="flex items-center gap-2">
              <img src="/favicon.png" alt="Finora" className="h-6 w-6 rounded-md" />
              <span className="text-lg font-bold">Finora</span>
            </div>
          </div>
          
          <button 
            onClick={triggerCommandPalette}
            className="p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors"
            aria-label="Search"
          >
            <span className="w-5 h-5 flex items-center justify-center">🔍</span>
          </button>
        </header>

        {/* Mobile Navigation (Animated) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex flex-col gap-2 border-b bg-card p-4 sm:hidden overflow-hidden"
            >
               {sidebarNavItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                >
                  <NavLink
                    to={item.href}
                    replace={true}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-95",
                        isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-primary/5"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {t(item.titleKey)}
                  </NavLink>
                </motion.div>
              ))}
              
              {isInstallable && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: sidebarNavItems.length * 0.03, duration: 0.2 }}
                  className="mt-4 pt-4 border-t"
                >
                  <button
                    onClick={promptInstall}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-primary px-4 py-3 text-sm font-bold text-white shadow-lg transition-all duration-300 active:scale-[0.98]"
                  >
                    <Download className="h-4 w-4" />
                    Install App
                  </button>
                </motion.div>
              )}
            </motion.nav>
          )}
        </AnimatePresence>

        <div className="flex-1 p-4 sm:p-8 w-full max-w-full overflow-x-hidden">
          <div className="mx-auto max-w-6xl w-full h-full min-w-0">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  )
}
