import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

export function AccountProfile() {
  const { user, updateName } = useCustomerAuth()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user?.name ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    const err = await updateName(name.trim())
    if (err) setError(err)
    else setEditing(false)
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white text-lg">Profile</h2>
          {!editing && (
            <button onClick={() => { setEditing(true); setName(user?.name ?? '') }}
              className="text-xs font-semibold text-white/50 hover:text-white transition-colors">
              Edit
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-900/40 border border-red-500/30 rounded-xl px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-xs text-white/40 font-semibold uppercase tracking-widest mb-1">Name</p>
            {editing ? (
              <input value={name} onChange={(e) => setName(e.target.value)}
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

          {editing && (
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-[#E63939] hover:bg-[#C82020] text-white font-bold py-2 rounded-xl text-sm transition-colors disabled:opacity-60">
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setError(null) }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 rounded-xl text-sm transition-colors">
                Cancel
              </button>
            </div>
          )}
        </div>
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
