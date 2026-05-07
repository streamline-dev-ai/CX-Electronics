import { useEffect, useState } from 'react'

const MINIMUM_MS = 800
const FADE_MS = 350

interface Props {
  onDone: () => void
}

export function LoadingScreen({ onDone }: Props) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const start = Date.now()

    // Wait until the window has loaded AND at least MINIMUM_MS has passed
    function finish() {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, MINIMUM_MS - elapsed)
      setTimeout(() => {
        setFading(true)
        setTimeout(onDone, FADE_MS)
      }, remaining)
    }

    if (document.readyState === 'complete') {
      finish()
    } else {
      window.addEventListener('load', finish, { once: true })
      return () => window.removeEventListener('load', finish)
    }
  }, [onDone])

  return (
    <div
      aria-hidden="true"
      style={{
        transition: `opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1), transform ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1)`,
        opacity: fading ? 0 : 1,
        transform: fading ? 'scale(1.04)' : 'scale(1)',
        pointerEvents: fading ? 'none' : 'all',
      }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
    >
      {/* Background: bold red with subtle dark vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 80% at 50% 110%, #c0392b 0%, #E63939 50%, #be2222 100%)',
        }}
      />
      {/* Dark top vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(0,0,0,0.45) 0%, transparent 70%)',
        }}
      />
      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'300\' height=\'300\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'300\' height=\'300\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
          backgroundSize: '200px 200px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">

        {/* Logo */}
        <img
          src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png"
          alt="CW Electronics"
          className="h-20 sm:h-24 w-auto drop-shadow-xl"
        />

        {/* Spinner */}
        <div className="relative w-10 h-10 sm:w-11 sm:h-11">
          {/* Static track ring */}
          <div className="absolute inset-0 rounded-full border-2 border-white/20" />
          {/* Rotating accent ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: 'white',
              borderRightColor: 'rgba(255,255,255,0.35)',
              animation: 'cw-spin 900ms cubic-bezier(0.5,0.15,0.5,0.85) infinite',
            }}
          />
        </div>

        {/* Label */}
        <p
          className="text-white/60 font-medium tracking-[0.3em] uppercase"
          style={{ fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)' }}
        >
          Powering Up&hellip;
        </p>
      </div>

      {/* Keyframe injected inline so it works without Tailwind config changes */}
      <style>{`
        @keyframes cw-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
