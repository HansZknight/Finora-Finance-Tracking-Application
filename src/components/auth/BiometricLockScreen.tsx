import { useEffect, useState } from "react"
import { Lock, Fingerprint, RefreshCcw, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFinance } from "@/store/FinanceContext"
import { verifyBiometric } from "@/lib/webauthn"

export function BiometricLockScreen({ children }: { children: React.ReactNode }) {
  const { isBiometricEnabled, biometricCredentialId } = useFinance()
  
  // If not enabled, render children immediately
  if (!isBiometricEnabled || !biometricCredentialId) {
    return <>{children}</>
  }

  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")

  const handleVerify = async () => {
    try {
      setIsVerifying(true)
      setError("")
      const success = await verifyBiometric(biometricCredentialId)
      if (success) {
        setIsUnlocked(true)
      } else {
        setError("Verification failed or was cancelled. Please try again.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify identity.")
    } finally {
      setIsVerifying(false)
    }
  }

  // Auto-verify on mount
  useEffect(() => {
    let mounted = true
    if (!isUnlocked && !isVerifying && mounted) {
      handleVerify()
    }
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isUnlocked) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-md w-full bg-card border border-border shadow-2xl rounded-2xl p-8 flex flex-col items-center text-center relative z-10 overflow-hidden">
        {/* Animated grid background inside card */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' }} />

        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-primary rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/25 mb-6 animate-pulse">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Vault Locked</h1>
        <p className="text-muted-foreground mb-8">
          Finora is secured with your device's biometric lock. Please verify your identity to access your financial data.
        </p>

        {error && (
          <div className="mb-6 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 w-full">
            {error}
          </div>
        )}

        <Button 
          onClick={handleVerify} 
          disabled={isVerifying}
          className="w-full h-14 text-lg bg-indigo-500 hover:bg-indigo-600 text-white"
        >
          {isVerifying ? (
            <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Fingerprint className="w-5 h-5 mr-2 animate-bounce" />
          )}
          {isVerifying ? "Verifying..." : "Unlock Vault"}
        </Button>
        
        <div className="mt-8 flex items-center justify-center text-xs text-muted-foreground">
          <Lock className="w-3 h-3 mr-1" /> End-to-End Local Security
        </div>
      </div>
    </div>
  )
}
