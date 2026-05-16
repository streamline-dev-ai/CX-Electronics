import { RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

// The public site no longer offers an install banner. PWA install is gated
// behind the admin login page (see src/lib/pwaInstall.ts + AdminLogin).
// This component only handles the "new version available" banner so admins
// (and any future installed clients) get fresh service-worker updates.
export function PWAPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => {})
        }, 60 * 60 * 1000)
      }
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm bg-[#0F172A] border border-white/10 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 bg-[#E63939] rounded-full flex items-center justify-center flex-shrink-0">
        <RefreshCw className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Update available</p>
        <p className="text-xs text-white/50 mt-0.5">A new version is ready.</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-[#E63939] hover:bg-[#C82020] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
        >
          Reload
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="text-white/40 hover:text-white p-1.5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
