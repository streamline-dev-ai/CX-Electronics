import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { customerSupabase } from '../../lib/customerAuth'

type PageState = 'loading' | 'ready' | 'success' | 'invalid'

export function ResetPassword() {
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Parse the hash fragment Supabase appends to the redirect URL
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (type === 'recovery' && accessToken && refreshToken) {
      customerSupabase.auth
        .setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ error: err }) => {
          setPageState(err ? 'invalid' : 'ready')
        })
    } else {
      // Check if we already have a session (user navigated here from a live session)
      customerSupabase.auth.getSession().then(({ data: { session } }) => {
        setPageState(session ? 'ready' : 'invalid')
      })
    }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (newPw.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPw !== confirmPw) { setError('Passwords do not match'); return }
    setSaving(true)
    setError(null)

    const { error: err } = await customerSupabase.auth.updateUser({ password: newPw })
    if (err) {
      setError(err.message)
      setSaving(false)
    } else {
      setPageState('success')
      setTimeout(() => navigate('/account', { replace: true }), 2500)
    }
  }

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#E63939] animate-spin" />
      </div>
    )
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-red-900/40 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Link expired or invalid</h2>
          <p className="text-white/50 text-sm mb-6">
            This reset link has expired or already been used. Please request a new one.
          </p>
          <Link
            to="/account/forgot-password"
            className="inline-block bg-[#E63939] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#C82020] transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </div>
    )
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-900/40 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Password updated!</h2>
          <p className="text-white/50 text-sm">Redirecting you to your account…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-[#E63939] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">CW Electronics</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Set new password</h1>
          <p className="text-white/50 text-sm mt-1">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">New Password</label>
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              autoFocus
              autoComplete="new-password"
              placeholder="Min. 6 characters"
              className="w-full px-3 py-2.5 text-sm bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Repeat new password"
              className="w-full px-3 py-2.5 text-sm bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/30"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Updating…' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
