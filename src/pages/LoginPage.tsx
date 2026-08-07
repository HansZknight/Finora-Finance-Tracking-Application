import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowRight, Loader2, Info, LockKeyhole } from 'lucide-react'
import { toast } from 'sonner'
import finoraLogo from '@/assets/finora-icon.png'


export function LoginPage({ onSkip }: { onSkip: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error("Please enter email and password")
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        toast.success('Registration successful! You are now logged in.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Login successful! Sync enabled.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'Google Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4 relative overflow-hidden text-slate-50">
      {/* Premium Dark Background with Mesh Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] rounded-full bg-primary/20 blur-[80px]" />
      </div>

      <div className="w-full max-w-[420px] space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center flex flex-col items-center">
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden p-3">
              <img src={finoraLogo} alt="Finora" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Finora
          </h1>
          <p className="text-slate-400 text-base font-medium tracking-wide">
            Intelligent Wealth Management
          </p>
        </div>

        <Card className="border-white/10 shadow-2xl backdrop-blur-md bg-slate-900/60 overflow-hidden">
          {/* Subtle top border gradient */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <CardHeader className="pb-6">
            <CardTitle className="text-xl text-center font-semibold text-white">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              {isSignUp ? 'Start your journey to financial freedom' : 'Sign in to access your dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 relative overflow-hidden group border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all duration-300"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3 transition-transform group-hover:scale-110 duration-300" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="font-medium">Continue with Google</span>
            </Button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/10" />
              <span className="flex-shrink-0 mx-4 text-xs font-medium text-slate-500 uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-white/10" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 ml-1">Email address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10 h-11 bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300 ml-1">Password</Label>
                <div className="relative group">
                  <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-slate-500 transition-colors group-focus-within:text-indigo-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-black/40 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white border-0 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all duration-300 font-semibold" 
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {isSignUp ? 'Create Account' : 'Sign In'}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          </CardContent>
          
          <div className="px-6 pb-6 space-y-4">
            <p className="text-center text-sm text-slate-400">
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button 
                type="button"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors hover:underline"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>

            <div className="w-full bg-black/40 rounded-xl p-4 flex items-start gap-3 border border-white/5 backdrop-blur-md">
              <div className="bg-white/10 p-1.5 rounded-lg shrink-0 mt-0.5">
                <Info className="w-4 h-4 text-indigo-300" />
              </div>
              <div className="text-sm text-slate-300 flex-1">
                <p className="font-medium text-white mb-1">Prefer offline mode?</p>
                <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                  Your data stays purely on your device. You can enable cloud sync later.
                </p>
                <button 
                  type="button" 
                  onClick={onSkip}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10 w-full"
                >
                  Continue without Sync
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
