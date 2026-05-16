// Admin-only PWA install gate.
//
// We intentionally do NOT ship a <link rel="manifest"> in index.html. The
// manifest is injected at runtime from the admin login page once the install
// password has been verified — so the browser never offers to install the app
// to public visitors. The service worker still registers (for offline caching
// of admin/asset routes) regardless of manifest presence.

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Listener = (ev: BeforeInstallPromptEvent | null) => void

let captured: BeforeInstallPromptEvent | null = null
const listeners = new Set<Listener>()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    captured = e as BeforeInstallPromptEvent
    listeners.forEach((fn) => fn(captured))
  })
  window.addEventListener('appinstalled', () => {
    captured = null
    listeners.forEach((fn) => fn(null))
  })
}

export function getInstallEvent(): BeforeInstallPromptEvent | null {
  return captured
}

export function subscribeInstall(fn: Listener): () => void {
  listeners.add(fn)
  fn(captured)
  return () => {
    listeners.delete(fn)
  }
}

const MANIFEST_LINK_ID = 'pwa-manifest-link'

export function injectManifestLink(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(MANIFEST_LINK_ID)) return
  const link = document.createElement('link')
  link.id = MANIFEST_LINK_ID
  link.rel = 'manifest'
  link.href = '/manifest.webmanifest'
  document.head.appendChild(link)
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia?.('(display-mode: standalone)').matches) return true
  if (window.matchMedia?.('(display-mode: minimal-ui)').matches) return true
  const nav = window.navigator as Navigator & { standalone?: boolean }
  if (nav.standalone) return true
  return false
}

const PASSWORD_FALLBACK = 'cw-admin-install'

export function verifyInstallPassword(input: string): boolean {
  const expected =
    (import.meta.env.VITE_PWA_INSTALL_PASSWORD as string | undefined) || PASSWORD_FALLBACK
  return input.trim() === expected
}
