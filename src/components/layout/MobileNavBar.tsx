import { NavLink } from "react-router-dom"
import { MoreHorizontal, Download, LayoutDashboard, Receipt, Wallet, TrendingUp, Tags, Repeat, CreditCard, PieChart, Target, Users, Plane, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"
import { usePWAInstall } from "@/hooks/usePWAInstall"

const sidebarNavItems = [
  { titleKey: "nav.dashboard", href: "/", icon: LayoutDashboard },
  { titleKey: "nav.transactions", href: "/transactions", icon: Receipt },
  { titleKey: "nav.wallets", href: "/wallets", icon: Wallet },
  { titleKey: "nav.investments", href: "/investments", icon: TrendingUp },
  { titleKey: "nav.categories", href: "/categories", icon: Tags },
  { titleKey: "nav.subscriptions", href: "/subscriptions", icon: Repeat },
  { titleKey: "nav.debts", href: "/debts", icon: CreditCard },
  { titleKey: "nav.budget", href: "/budget", icon: PieChart },
  { titleKey: "nav.goals", href: "/goals", icon: Target },
  { titleKey: "nav.contacts", href: "/contacts", icon: Users },
  { titleKey: "nav.trips", href: "/trips", icon: Plane },
  { titleKey: "nav.settings", href: "/settings", icon: Settings },
]

export function MobileNavBar({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: { 
  isMobileMenuOpen: boolean; 
  setIsMobileMenuOpen: (v: boolean) => void 
}) {
  const { t } = useTranslation()
  const { isInstallable, promptInstall } = usePWAInstall()

  return (
    <>
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
        <div className="flex justify-around items-center h-16 px-2 relative">
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
    </>
  )
}
