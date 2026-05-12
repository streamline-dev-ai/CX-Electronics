import { useRef, type ReactNode, type MouseEvent } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  href?: string
  onClick?: () => void
  /** How strongly the button "pulls" toward the cursor. 0.2 = subtle. */
  strength?: number
  /** Whether to render an <a> (default if href provided) or a <button>. */
  as?: 'a' | 'button'
  target?: string
  rel?: string
  ariaLabel?: string
}

/**
 * Magnetic hover effect for primary CTAs. Subtly gravitates toward the cursor
 * on desktop — adds an expensive, deliberate feel without being gimmicky.
 * Disabled on touch via a hover:none media query check inside the component.
 */
export function MagneticButton({
  children,
  className = '',
  href,
  onClick,
  strength = 0.25,
  as,
  target,
  rel,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 })

  function handleMouseMove(e: MouseEvent) {
    // Skip on touch — they get plain hover off
    if (window.matchMedia('(hover: none)').matches) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const offsetX = e.clientX - (rect.left + rect.width / 2)
    const offsetY = e.clientY - (rect.top + rect.height / 2)
    x.set(offsetX * strength)
    y.set(offsetY * strength)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  const motionStyle = { x: springX, y: springY }

  if (href || as === 'a') {
    return (
      <motion.a
        ref={(el) => { ref.current = el }}
        href={href}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        style={motionStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        className={className}
      >
        {children}
      </motion.a>
    )
  }

  return (
    <motion.button
      ref={(el) => { ref.current = el }}
      type="button"
      aria-label={ariaLabel}
      style={motionStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  )
}
