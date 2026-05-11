import { useState } from 'react'

const KEY = 'cxx-admin-mode'
export type AdminMode = 'real' | 'demo'

export function useAdminMode(): [AdminMode, (m: AdminMode) => void] {
  const [mode, setMode] = useState<AdminMode>(() => {
    const stored = localStorage.getItem(KEY)
    return stored === 'demo' ? 'demo' : 'real'
  })

  function set(m: AdminMode) {
    localStorage.setItem(KEY, m)
    setMode(m)
  }

  return [mode, set]
}

export function getAdminMode(): AdminMode {
  return localStorage.getItem(KEY) === 'demo' ? 'demo' : 'real'
}
