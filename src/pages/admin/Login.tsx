import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Check, ShoppingBag, ShieldCheck, Download, Lock, X } from 'lucide-react'
import { signIn } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { isAdminEmail } from '../../lib/adminEmails'
import {
  getInstallEvent,
  subscribeInstall,
  injectManifestLink,
  verifyInstallPassword,
  isStandalone,
  type BeforeInstallPromptEvent,
} from '../../lib/pwaInstall'

export function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // PWA install gate — manifest is injected only after the install password
  // is verified. After injection we wait for `beforeinstallprompt`, then call
  // `.prompt()` to surface the native install dialog.
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(getInstallEvent())
  const [showInstallModal, setShowInstallModal] = useState(false)
  const [installPwd, setInstallPwd] = useState('')
  const [installError, setInstallError] = useState<string | null>(null)
  const [installInfo, setInstallInfo] = useState<string | null>(null)
  const [installVerified, setInstallVerified] = useState(false)
  const [installing, setInstalling] = useState(false)
  const standalone = isStandalone()

  useEffect(() => subscribeInstall(setInstallEvent), [])

  function openInstallModal() {
    setInstallPwd('')
    setInstallError(null)
    setInstallInfo(null)
    setInstallVerified(false)
    setShowInstallModal(true)
  }

  function closeInstallModal() {
    if (installing) return
    setShowInstallModal(false)
  }

  async function handleVerifyAndInstall(e: FormEvent) {
    e.preventDefault()
    setInstallError(null)
    setInstallInfo(null)

    if (!verifyInstallPassword(installPwd)) {
      setInstallError('Incorrect install password.')
      return
    }

    setInstallVerified(true)
    setInstalling(true)
    injectManifestLink()

    // If beforeinstallprompt has already fired, prompt immediately.
    const captured = getInstallEvent()
    if (captured) {
      try {
        await captured.prompt()
      } catch {
        /* user dismissed */
      }
      setInstalling(false)
      setShowInstallModal(false)
      return
    }

    // Otherwise wait up to 5s for it to fire now that the manifest is present.
    const waitFor = new Promise<BeforeInstallPromptEvent | null>((resolve) => {
      const unsub = subscribeInstall((ev) => {
        if (ev) {
          unsub()
          resolve(ev)
        }
      })
      setTimeout(() => {
        unsub()
        resolve(null)
      }, 5000)
    })

    const ev = await waitFor
    if (ev) {
      try {
        await ev.prompt()
      } catch {
        /* user dismissed */
      }
      setShowInstallModal(false)
    } else {
      setInstallInfo(
        'Manifest enabled. Open your browser menu and choose "Install app" or "Add to Home Screen".',
      )
    }
    setInstalling(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Reject non-admin emails BEFORE attempting auth — saves the round-trip
    // and avoids creating spurious failed-login signals in Supabase logs.
    if (!isAdminEmail(email)) {
      setError('This account does not have admin access. Customers sign in below.')
      setLoading(false)
      return
    }

    const { data, error: err } = await signIn(email, password, remember)

    if (err) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    // Defense in depth: re-check after auth in case server returned a different email.
    if (!isAdminEmail(data?.user?.email)) {
      await supabase.auth.signOut({ scope: 'local' })
      setError('This account does not have admin access.')
      setLoading(false)
      return
    }

    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#E63939]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E63939]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <img src="https://res.cloudinary.com/dzhwylkfr/image/upload/v1777722832/CW-Logo_ujfdip.png" alt="CW Electronics Logo" className="h-10 w-auto" />
          <div>
            <p className="font-bold text-white leading-tight">CW Electronics</p>
            <p className="text-xs text-white/50 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Admin Panel
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-2xl border border-white/10 p-6">
          <h1 className="font-semibold text-gray-900 mb-1">Sign in</h1>
          <p className="text-xs text-gray-500 mb-5">Admin access only — single sign-in account.</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cxx-blue focus:border-transparent"
                placeholder="admin@cwelectronics.co.za"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cxx-blue focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <span
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  remember ? 'bg-cxx-blue border-cxx-blue' : 'border-gray-300 group-hover:border-gray-400'
                }`}
              >
                {remember && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </span>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="sr-only"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Keep me signed in</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cxx-blue hover:bg-cxx-blue-hover text-white font-medium py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Customer hint — common confusion point */}
        <Link
          to="/account/login"
          className="mt-4 flex items-center justify-center gap-2 text-xs text-white/60 hover:text-white transition-colors"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Looking to shop? Customer sign in →
        </Link>

        {/* Install desktop app — admin only, password gated */}
        {!standalone && (
          <button
            type="button"
            onClick={openInstallModal}
            className="mt-3 w-full flex items-center justify-center gap-2 text-xs text-white/40 hover:text-white/80 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Install admin app
          </button>
        )}
      </div>

      {/* Install password modal */}
      {showInstallModal && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeInstallModal}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeInstallModal}
              disabled={installing}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 bg-[#FEE9E9] rounded-xl flex items-center justify-center">
                <Lock className="w-4 h-4 text-[#E63939]" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-sm">Install admin app</h2>
                <p className="text-[11px] text-gray-500">Restricted — password required.</p>
              </div>
            </div>

            <form onSubmit={handleVerifyAndInstall} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Install password
                </label>
                <input
                  type="password"
                  value={installPwd}
                  onChange={(e) => setInstallPwd(e.target.value)}
                  autoFocus
                  required
                  disabled={installing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E63939] focus:border-transparent disabled:bg-gray-50"
                  placeholder="••••••••"
                />
              </div>

              {installError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {installError}
                </div>
              )}

              {installInfo && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  {installInfo}
                </div>
              )}

              <button
                type="submit"
                disabled={installing || installVerified && !!installInfo}
                className="w-full bg-[#E63939] hover:bg-[#C82020] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {installing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Preparing install…
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Verify &amp; install
                  </>
                )}
              </button>

              {!installEvent && !installVerified && (
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Tip: install works best in Chrome, Edge, or any Chromium browser on desktop or Android.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
