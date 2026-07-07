import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
import finoraLogo from '@/assets/finora-icon.png'

export function Preloader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(() => {
    return !sessionStorage.getItem('finora-preloaded')
  })
  
  const progress = useMotionValue(0)
  const progressText = useTransform(progress, (v) => `${Math.round(v)}%`)
  
  const [loadingText, setLoadingText] = useState("Securing vault...")

  const texts = [
    "Securing vault...",
    "Syncing encrypted data...",
    "Loading financial modules...",
    "Preparing dashboard..."
  ]

  useEffect(() => {
    if (!isLoading) return

    document.body.style.overflow = 'hidden'
    
    // Animate progress value directly without React state re-renders (preserves INP)
    const controls = animate(progress, 100, { duration: 2.5, ease: "linear" })

    // Switch text milestones
    const t1 = setTimeout(() => setLoadingText(texts[1]), 600)
    const t2 = setTimeout(() => setLoadingText(texts[2]), 1200)
    const t3 = setTimeout(() => setLoadingText(texts[3]), 2000)

    const finishTimer = setTimeout(() => {
      setIsLoading(false)
      sessionStorage.setItem('finora-preloaded', 'true')
      document.body.style.overflow = 'auto'
    }, 2600)

    return () => {
      controls.stop()
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(finishTimer)
      document.body.style.overflow = 'auto'
    }
  }, [isLoading, progress])

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] bg-[#030712] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Ambient Background Mesh */}
            <motion.div 
              className="absolute w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-primary/20 blur-[120px] pointer-events-none"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none translate-x-1/3 translate-y-1/3"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            {/* Central Logo Sequence */}
            <div className="relative z-10 flex flex-col items-center w-full px-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mb-8 relative flex flex-col items-center"
              >
                <img 
                  src={finoraLogo} 
                  alt="Finora Logo" 
                  className="w-32 h-32 object-contain drop-shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                />
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 10, letterSpacing: "0px" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "4px" }}
                transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 mb-16"
              >
                FINORA
              </motion.h1>

              {/* Progress Container */}
              <div className="w-full max-w-sm flex flex-col items-center">
                <div className="w-full flex justify-between text-white/70 text-xs sm:text-sm uppercase tracking-widest mb-4 font-medium h-5">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={loadingText}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="truncate pr-4"
                    >
                      {loadingText}
                    </motion.span>
                  </AnimatePresence>
                  <motion.span className="tabular-nums font-mono font-bold text-white/90">
                    {progressText}
                  </motion.span>
                </div>
                
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative backdrop-blur-sm border border-white/5">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-indigo-400 to-white rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "linear" }}
                  />
                  {/* Glowing tip */}
                  <motion.div 
                    className="absolute top-0 h-full w-4 bg-white shadow-[0_0_12px_4px_rgba(255,255,255,0.7)] rounded-full blur-[1px]"
                    initial={{ left: "-8px", opacity: 0 }}
                    animate={{ left: "calc(100% - 8px)", opacity: 1 }}
                    transition={{ duration: 2.5, ease: "linear" }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App Container with entry animation */}
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ 
          opacity: isLoading ? 0 : 1, 
          filter: isLoading ? "blur(10px)" : "blur(0px)"
        }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0 }}
        className={isLoading ? "pointer-events-none" : ""}
      >
        {children}
      </motion.div>
    </>
  )
}
