import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, PieChart, Target, Settings, Tags, Repeat, CreditCard, LineChart, Wallet, TrendingUp, Download, MoreHorizontal } from 'lucide-react'
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
              onClick={() => {}}
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
      <main className="flex flex-1 flex-col relative z-10 w-full min-w-0 overflow-x-hidden pb-24 sm:pb-0">
        {/* Mobile Header (Simplified) */}
        <header className="flex h-16 items-center justify-between border-b bg-card/70 backdrop-blur-md px-4 sm:hidden sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Finora" className="h-8 w-8 rounded-lg shadow-sm" />
            <span className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Finora</span>
          </div>
          
          <button 
            onClick={triggerCommandPalette}
            className="p-2.5 bg-muted/50 text-muted-foreground hover:bg-muted rounded-full transition-colors flex items-center justify-center shadow-sm"
            aria-label="Search"
          >
            <span className="w-5 h-5 flex items-center justify-center leading-none text-base">🔍</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center h-16 px-2">
          {sidebarNavItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              replace={true}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 relative group transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <item.icon className={cn("w-6 h-6 transition-transform duration-200", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <motion.div layoutId="nav-indicator" className="absolute -inset-2 bg-primary/10 rounded-full -z-10" />
                    )}
                  </div>
                  <span className={cn("text-[10px] font-medium transition-all", isActive ? "opacity-100" : "opacity-70")}>
                    {t(item.titleKey)}
                  </span>
                </>
              )}
            </NavLink>
          ))}
          
          {/* More Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 relative group transition-colors",
              isMobileMenuOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <MoreHorizontal className={cn("w-6 h-6 transition-transform duration-200", isMobileMenuOpen && "scale-110")} strokeWidth={isMobileMenuOpen ? 2.5 : 2} />
              {isMobileMenuOpen && (
                <motion.div layoutId="nav-indicator" className="absolute -inset-2 bg-primary/10 rounded-full -z-10" />
              )}
            </div>
            <span className={cn("text-[10px] font-medium transition-all", isMobileMenuOpen ? "opacity-100" : "opacity-70")}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" Menu Overlay / Bottom Sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="sm:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="sm:hidden fixed bottom-16 left-0 right-0 z-40 bg-card border-t rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] overflow-hidden max-h-[75vh] flex flex-col"
            >
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto my-3 opacity-50 shrink-0" />
              <div className="px-6 pb-2 shrink-0">
                <h3 className="text-lg font-bold">More Options</h3>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-hide space-y-1">
                {sidebarNavItems.slice(4).map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <NavLink
                      to={item.href}
                      replace={true}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-medium transition-colors",
                          isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {t(item.titleKey)}
                    </NavLink>
                  </motion.div>
                ))}
                
                {isInstallable && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4 mt-2 border-t"
                  >
                    <button
                      onClick={() => {
                        promptInstall()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-primary px-4 py-3.5 text-sm font-bold text-white shadow-lg"
                    >
                      <Download className="h-5 w-5" />
                      Install Finora App
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  )
}
