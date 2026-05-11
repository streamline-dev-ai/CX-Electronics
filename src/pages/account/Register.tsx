import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap, Loader2, Check } from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

export function AccountRegister() {
  const { signUp } = useCustomerAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'loading'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setState('loading')
    setError(null)

    const { error: err } = await signUp(email, password, name, remember)
    if (err) {
      setError(err)
      setState('idle')
      return
    }
    navigate('/account', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-[#E63939] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">CW Electronics</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-white/50 text-sm mt-1">
            Already have one?{' '}
            <Link to="/account/login" className="text-[#E63939] hover:underline font-medium">Sign in</Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-red-900/40 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
          )}
          {[
            { label: 'Full Name', value: name, set: setName, type: 'text', placeholder: 'John Smith', auto: 'name' },
            { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'you@email.com', auto: 'email' },
            { label: 'Password', value: password, set: setPassword, type: 'password', placeholder: 'Min. 6 characters', auto: 'new-password' },
            { label: 'Confirm Password', value: confirm, set: setConfirm, type: 'password', placeholder: '••••••••', auto: 'new-password' },
          ].map(({ label, value, set, type, placeholder, auto }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-white/70 mb-1">{label}</label>
              <input type={type} value={value} onChange={(e) => set(e.target.value)} required autoComplete={auto}
                className="w-full px-3 py-2.5 text-sm bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/30"
                placeholder={placeholder} />
            </div>
          ))}

          <label className="flex items-center gap-2 cursor-pointer select-none group pt-1">
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                remember ? 'bg-[#E63939] border-[#E63939]' : 'border-white/30 group-hover:border-white/50'
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
            <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">Keep me signed in on this device</span>
          </label>

          <button type="submit" disabled={state === 'loading'}
            className="w-full flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60">
            {state === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
            {state === 'loading' ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center mt-6">
          <Link to="/" className="text-sm text-white/30 hover:text-white/60">← Back to store</Link>
        </p>
      </div>
    </div>
  )
}
