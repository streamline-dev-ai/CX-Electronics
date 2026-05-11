import { useEffect, useState } from 'react'
import { Download, RefreshCw, X } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'

// Custom event from beforeinstallprompt to enable in-app install button.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const INSTALL_DISMISSED_KEY = 'cxx-pwa-install-dismissed'

export function PWAPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)

  // Service-worker update handling — prompts user to reload when a new SW is waiting.
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      // Check for updates every hour while the app is open.
      if (registration) {
        setInterval(() => {
          registration.update().catch(() => {})
        }, 60 * 60 * 1000)
      }
    },
  })

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)

      // Respect a user-dismissed banner for 14 days.
      const dismissedAt = localStorage.getItem(INSTALL_DISMISSED_KEY)
      if (dismissedAt && Date.now() - Number(dismissedAt) < 14 * 24 * 60 * 60 * 1000) return
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!installEvent) return
    setShowInstall(false)
    await installEvent.prompt()
    setInstallEvent(null)
  }

  function dismissInstall() {
    setShowInstall(false)
    localStorage.setItem(INSTALL_DISMISSED_KEY, String(Date.now()))
  }

  return (
    <>
      {/* Update available banner */}
      {needRefresh && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm bg-[#0F172A] border border-white/10 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-cxx-blue rounded-full flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">Update available</p>
            <p className="text-xs text-white/50 mt-0.5">A new version of CW Electronics is ready.</p>
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
      )}

      {/* Install prompt */}
      {showInstall && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[150] w-[calc(100%-2rem)] max-w-sm bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-cxx-blue/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-cxx-blue" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900">Install CW Electronics</p>
            <p className="text-xs text-gray-500 mt-0.5">Faster access · works offline · no app store</p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="bg-cxx-blue hover:bg-cxx-blue-hover text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
            >
              Install
            </button>
            <button
              onClick={dismissInstall}
              className="text-gray-400 hover:text-gray-700 p-1.5 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
