import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { customerSupabase } from '../../lib/customerAuth'

export function AccountProfile() {
  const { user, updateName } = useCustomerAuth()

  // Name editing
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)

  // Password change
  const [changingPw, setChangingPw] = useState(false)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [savingPw, setSavingPw] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)

  async function handleSaveName() {
    if (!name.trim()) return
    setSavingName(true)
    setNameError(null)
    const err = await updateName(name.trim())
    if (err) setNameError(err)
    else setEditingName(false)
    setSavingName(false)
  }

  async function handleSavePassword() {
    if (newPw.length < 6) { setPwError('Password must be at least 6 characters'); return }
    if (newPw !== confirmPw) { setPwError('Passwords do not match'); return }
    setSavingPw(true)
    setPwError(null)
    const { error } = await customerSupabase.auth.updateUser({ password: newPw })
    if (error) {
      setPwError(error.message)
    } else {
      setPwSuccess(true)
      setChangingPw(false)
      setNewPw('')
      setConfirmPw('')
      setTimeout(() => setPwSuccess(false), 4000)
    }
    setSavingPw(false)
  }

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white text-lg">Profile</h2>
          {!editingName && (
            <button onClick={() => { setEditingName(true); setName(user?.name ?? '') }}
              className="text-xs font-semibold text-white/50 hover:text-white transition-colors">
              Edit
            </button>
          )}
        </div>

        {nameError && (
          <div className="mb-4 bg-red-900/40 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">{nameError}</div>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-1">Name</p>
            {editingName ? (
              <input value={name} onChange={(e) => setName(e.target.value)} autoFocus
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63939]" />
            ) : (
              <p className="text-white font-medium">{user?.name || '—'}</p>
            )}
          </div>

          <div>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-1">Email</p>
            <p className="text-white font-medium">{user?.email}</p>
          </div>

          <div>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-1">Member since</p>
            <p className="text-white">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })
                : '—'}
            </p>
          </div>

          {editingName && (
            <div className="flex gap-2 pt-2">
              <button onClick={handleSaveName} disabled={savingName}
                className="flex-1 flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-2 rounded-xl text-sm transition-colors disabled:opacity-60">
                {savingName && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {savingName ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setEditingName(false); setNameError(null) }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-xl text-sm transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Password card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white text-base">Password</h2>
          {!changingPw && (
            <button onClick={() => setChangingPw(true)}
              className="text-xs font-semibold text-white/50 hover:text-white transition-colors">
              Change
            </button>
          )}
        </div>

        {pwSuccess && (
          <div className="mb-3 bg-green-900/40 border border-green-500/30 rounded-xl px-4 py-3 text-sm text-green-300">
            Password updated successfully.
          </div>
        )}

        {changingPw ? (
          <div className="space-y-3">
            {pwError && (
              <div className="bg-red-900/40 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">{pwError}</div>
            )}
            <div>
              <label className="block text-xs text-white/40 font-semibold uppercase tracking-widest mb-1">New Password</label>
              <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                placeholder="Min. 6 characters" autoComplete="new-password"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/30" />
            </div>
            <div>
              <label className="block text-xs text-white/40 font-semibold uppercase tracking-widest mb-1">Confirm Password</label>
              <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password" autoComplete="new-password"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E63939] placeholder:text-white/30" />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleSavePassword} disabled={savingPw}
                className="flex-1 flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-2 rounded-xl text-sm transition-colors disabled:opacity-60">
                {savingPw && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {savingPw ? 'Saving…' : 'Update Password'}
              </button>
              <button onClick={() => { setChangingPw(false); setPwError(null); setNewPw(''); setConfirmPw('') }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-xl text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/40">••••••••••••</p>
        )}
      </div>

      <div className="bg-[#E63939]/10 border border-[#E63939]/20 rounded-2xl p-5">
        <p className="text-sm text-white font-semibold mb-1">Shipping details</p>
        <p className="text-sm text-white/50">
          Your shipping address is saved automatically when you place an order.
        </p>
      </div>
    </div>
  )
}
