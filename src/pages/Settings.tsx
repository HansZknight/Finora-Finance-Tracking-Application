import { useState } from "react"
import { Download, Upload, Trash2, AlertTriangle, Moon, Sun, Monitor, Lock, Fingerprint, Key, Crown } from "lucide-react"
import { toast } from "sonner"
import { registerBiometric } from "@/lib/webauthn"


import { useFinance } from "@/store/FinanceContext"
import { AppStateSchema } from "@/types"
import { STORAGE_KEY } from "@/services/storage"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


import { useTranslation } from "react-i18next"

export function Settings() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme, currency, setCurrency, isBiometricEnabled, enableBiometric, disableBiometric, isPro, activatePro } = useFinance()
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [isRegisteringBiometric, setIsRegisteringBiometric] = useState(false)
  const [licenseInput, setLicenseInput] = useState("")

  const handleExportJSON = () => {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return

    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `finance-tracker-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)
        
        // Validate with Zod
        const validated = AppStateSchema.parse(parsed)
        
        // If valid, save and reload
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validated))
        setImportStatus("success")
        
        // Reload to apply state
        setTimeout(() => window.location.reload(), 1500)
      } catch (err) {
        console.error("Import failed:", err)
        setImportStatus("error")
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  const toggleBiometric = async () => {
    if (!isPro) {
      toast.error("Biometric Vault is a PRO feature. Please upgrade to use this.")
      return
    }

    if (isBiometricEnabled) {
      disableBiometric()
      toast.success("Biometric lock disabled")
      return
    }

    try {
      setIsRegisteringBiometric(true)
      const credentialId = await registerBiometric()
      enableBiometric(credentialId)
      toast.success("Biometric lock enabled! Your app is now secured.")
    } catch (error: any) {
      toast.error(error.message || "Failed to setup biometric lock.")
    } finally {
      setIsRegisteringBiometric(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">{t('settings.title')}</h1>
        <p className="text-muted-foreground mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Preferences */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.language')}</CardTitle>
              <CardDescription>{t('settings.languageDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full sm:w-[280px]">
                <select 
                  value={i18n.language} 
                  onChange={(e) => {
                    const value = e.target.value;
                    i18n.changeLanguage(value);
                    localStorage.setItem('finora-language', value);
                  }}
                  className="w-full appearance-none bg-background border border-input shadow-sm rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground cursor-pointer transition-colors hover:bg-accent/50"
                >
                  <option value="en">🇬🇧 {t('settings.english')}</option>
                  <option value="id">🇮🇩 {t('settings.indonesian')}</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-50">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('settings.appearance')}</CardTitle>
              <CardDescription>Customize how Finora looks on your device.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button 
                variant={theme === "light" ? "default" : "outline"}
                className={`flex-1 h-24 flex flex-col gap-3 transition-all ${theme === 'light' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-6 w-6" />
                Light
              </Button>
              <Button 
                variant={theme === "dark" ? "default" : "outline"}
                className={`flex-1 h-24 flex flex-col gap-3 transition-all ${theme === 'dark' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-6 w-6" />
                Dark
              </Button>
              <Button 
                variant={theme === "system" ? "default" : "outline"}
                className={`flex-1 h-24 flex flex-col gap-3 transition-all ${theme === 'system' ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-6 w-6" />
                System
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('settings.currency')}</CardTitle>
              <CardDescription>Select your preferred primary currency for display.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative w-full sm:w-[280px]">
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full appearance-none bg-background border border-input shadow-sm rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground cursor-pointer transition-colors hover:bg-accent/50"
                >
                  <option value="IDR">🇮🇩 IDR - Indonesian Rupiah</option>
                  <option value="USD">🇺🇸 USD - US Dollar</option>
                  <option value="EUR">🇪🇺 EUR - Euro</option>
                  <option value="GBP">🇬🇧 GBP - British Pound</option>
                  <option value="SGD">🇸🇬 SGD - Singapore Dollar</option>
                  <option value="JPY">🇯🇵 JPY - Japanese Yen</option>
                  <option value="AUD">🇦🇺 AUD - Australian Dollar</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground opacity-50">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Data Management */}
        <div className="space-y-6">

          {/* PRO Activation Card */}
          <Card className={`relative overflow-hidden ${isPro ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5' : 'border-border'}`}>
            {isPro && (
              <div className="absolute top-0 right-0 p-4">
                <Crown className="w-8 h-8 text-amber-500 opacity-20" />
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className={`w-5 h-5 ${isPro ? 'text-amber-500' : 'text-primary'}`} /> 
                Finora PRO License
              </CardTitle>
              <CardDescription>
                {isPro ? "Thank you for supporting Finora! All premium features are unlocked." : "Enter your Master Key to unlock AI Scanner, Biometric Vault, and Unlimited Tracking."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPro ? (
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-semibold text-amber-500">PRO Activated</p>
                    <p className="text-xs text-amber-500/80">Lifetime License Active</p>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter Product Key..."
                    value={licenseInput}
                    onChange={(e) => setLicenseInput(e.target.value)}
                    className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  />
                  <Button 
                    onClick={() => {
                      if (activatePro(licenseInput)) {
                        toast.success("Finora PRO Activated Successfully! 👑")
                        setLicenseInput("")
                      } else {
                        toast.error("Invalid Product Key.")
                      }
                    }}
                  >
                    Activate
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export your data for backup, or import a previous backup. 
                Since this app uses local storage, backing up your data is highly recommended.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={handleExportJSON} className="w-full flex-1 h-12 shadow-md hover:shadow-lg transition-all">
                  <Download className="mr-2 h-4 w-4" /> Export JSON
                </Button>
                
                <div className="relative w-full flex-1">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    title="Import JSON Backup"
                  />
                  <Button variant="outline" className="w-full h-12 pointer-events-none relative z-0">
                    <Upload className="mr-2 h-4 w-4" /> Import JSON
                  </Button>
                </div>
              </div>

              {importStatus === "success" && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <p className="text-sm text-emerald-500 font-medium flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Data imported successfully! Reloading...
                  </p>
                </div>
              )}
              {importStatus === "error" && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Invalid backup file. Please ensure it matches the required format.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-destructive/30 bg-destructive/5 relative overflow-hidden group">
            {/* Warning Stripes Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }} />
            
            <CardHeader className="relative z-10">
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Danger Zone
              </CardTitle>
              <CardDescription className="text-destructive/80">
                Permanently delete all your transactions, categories, goals, and budgets.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your financial data 
                      from your browser's local storage.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-500">
                <Lock className="w-5 h-5" /> Security Vault
              </CardTitle>
              <CardDescription>
                Lock your offline data with your device's native FaceID, TouchID, or PIN.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center justify-between p-4 bg-background rounded-lg border shadow-sm ${!isPro && 'opacity-60 grayscale'}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${isBiometricEnabled ? 'bg-indigo-500/10 text-indigo-500' : 'bg-muted text-muted-foreground'}`}>
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      Biometric Lock 
                      {!isPro && <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded">PRO</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isBiometricEnabled ? "Enabled. App requires authentication to open." : "Disabled"}
                    </p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isBiometricEnabled || false}
                    onChange={toggleBiometric}
                    disabled={isRegisteringBiometric}
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                <strong className="text-foreground">Note:</strong> Because this app is 100% offline, this security key is tied to this specific device. If you clear your browser data, the lock will safely reset.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
