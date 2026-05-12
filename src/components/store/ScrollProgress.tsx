import { useLocation } from 'react-router-dom'
import { motion, useScroll, useSpring } from 'framer-motion'

// Hidden on routes where progress is irrelevant.
const HIDDEN_PREFIXES = ['/admin', '/account', '/checkout', '/cart', '/order', '/receipt', '/invoice']

/**
 * Hair-thin red scroll-progress bar at the top of the viewport.
 * Uses a spring so it feels alive without jitter on fast scrolls.
 */
export function ScrollProgress() {
  const { pathname } = useLocation()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.5 })

  if (HIDDEN_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return null
  }

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[60] bg-gradient-to-r from-[#E63939] via-[#FF6B6B] to-[#E63939] pointer-events-none"
      aria-hidden
    />
  )
}
