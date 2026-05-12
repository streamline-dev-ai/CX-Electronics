import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// Scroll to the top on every pathname OR query-string change (e.g. ?category=cctv),
// except when the user is doing browser back/forward — in that case we let
// the browser restore its own scroll position.
export function ScrollToTop() {
  const { pathname, search } = useLocation()
  const navType = useNavigationType() // 'PUSH' | 'REPLACE' | 'POP'

  useEffect(() => {
    if (navType === 'POP') return
    // requestAnimationFrame avoids the new page rendering, then scrolling
    // — fires after layout so the jump is instant from the user's POV.
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }, [pathname, search, navType])

  return null
}
