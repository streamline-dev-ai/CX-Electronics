import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Zap, Loader2, Mail, CheckCircle } from 'lucide-react'
import { customerSupabase } from '../../lib/customerAuth'

export function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    const { error: err } = await customerSupabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/account/reset-password`,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-green-900/40 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
          <p className="text-white/50 text-sm mb-2">
            We sent a password reset link to <span className="text-white font-medium">{email}</span>.
          </p>
          <p className="text-white/40 text-sm mb-6">
            Click the link in the email to set a new password.
          </p>
          <Link
            to="/account/login"
            className="inline-block bg-[#E63939] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#C82020] transition-colors"
          >
            Back to Sign In
          </Link>
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
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="text-white/50 text-sm mt-1">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                placeholder="you@email.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/30"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Sending…' : 'Send Reset Link'}
          </button>
        </form>

        <p className="text-center mt-6">
          <Link to="/account/login" className="text-sm text-white/30 hover:text-white/60">← Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
