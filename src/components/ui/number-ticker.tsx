import { useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"

interface NumberTickerProps {
  value: number
  formatString?: (val: number) => string
}

export function NumberTicker({ value, formatString = (val) => val.toString() }: NumberTickerProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const spring = useSpring(0, { bounce: 0, duration: 1500 })
  const display = useTransform(spring, (current) => formatString(current))

  useEffect(() => {
    setHasMounted(true)
    spring.set(value)
  }, [spring, value])

  if (!hasMounted) {
    return <span>{formatString(0)}</span>
  }

  return <motion.span>{display}</motion.span>
}
