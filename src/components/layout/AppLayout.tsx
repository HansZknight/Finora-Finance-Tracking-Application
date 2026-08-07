import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { LayoutDashboard, Receipt, PieChart, Target, Settings, Tags, Repeat, CreditCard, LineChart, Wallet, TrendingUp, Download, Plus, Users, Plane, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

import { CommandPalette } from '@/components/CommandPalette'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { useFinance } from '@/store/FinanceContext'
import { MobileNavBar } from './MobileNavBar'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

function TravelModeBanner() {
  const { t } = useTranslation()
  const { trips, activeTripId, setActiveTripId } = useFinance()
  const activeTrip = trips?.find(t => t.id === activeTripId)

  if (!activeTrip) return null

  return (
    <div className="bg-cyan-500 text-white px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-medium sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Plane className="w-4 h-4 animate-pulse" />
        <span>{t('trips.travelModeActive', 'Travel Mode Active')}: <strong>{activeTrip.name}</strong></span>
      </div>
      <button 
        onClick={() => setActiveTripId(null)}
        className="px-2 py-1 bg-black/20 hover:bg-black/30 rounded-md transition-colors"
      >
        {t('trips.turnOff', 'Turn Off')}
      </button>
    </div>
  )
}

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
    titleKey: "nav.contacts",
    href: "/contacts",
    icon: Users,
  },
  {
    titleKey: "nav.trips",
    href: "/trips",
    icon: Plane,
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('finora_skip_login')
      toast.success("Logged out successfully")
      window.location.href = '/'
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  return (
    <div className="flex h-[100dvh] w-full bg-background relative overflow-hidden">
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
              {item.titleKey.startsWith('nav.') ? t(item.titleKey) : item.titleKey}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-3 pt-4 px-2">
          {isInstallable && (
            <button
              onClick={promptInstall}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-primary px-4 py-3 text-sm font-bold text-white shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Install App
            </button>
          )}
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200 text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col relative z-10 w-full min-w-0 overflow-x-hidden pb-24 sm:pb-0">
        
        {/* Travel Mode Banner */}
        <TravelModeBanner />

        {/* Mobile Header (Simplified) */}
        <header className="flex h-16 items-center justify-between border-b bg-card/70 backdrop-blur-md px-4 sm:hidden sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="Finora" className="h-8 w-8 rounded-lg shadow-sm" />
            <span className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Finora</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={triggerCommandPalette}
              className="p-2.5 bg-muted/50 text-muted-foreground hover:bg-muted rounded-full transition-colors flex items-center justify-center shadow-sm"
              aria-label="Search"
            >
              <span className="w-5 h-5 flex items-center justify-center leading-none text-base">🔍</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="p-2.5 text-destructive hover:bg-destructive/10 rounded-full transition-colors flex items-center justify-center"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <MobileNavBar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Mobile FAB (Floating Action Button) */}
      <div className="sm:hidden fixed bottom-20 right-4 z-50">
        <NavLink 
          to="/transactions?new=true"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" strokeWidth={2.5} />
        </NavLink>
      </div>

      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  )
}
