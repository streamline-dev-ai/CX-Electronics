import { createClient } from '@supabase/supabase-js'

// Separate Supabase client for customer auth.
// Uses a different localStorage key so customer sessions never touch the admin session.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL) as string
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string

const REMEMBER_KEY = 'cxx-remember-me'

export function setRememberMe(remember: boolean) {
  if (typeof window === 'undefined') return
  if (remember) {
    localStorage.setItem(REMEMBER_KEY, 'true')
  } else {
    localStorage.setItem(REMEMBER_KEY, 'false')
  }
}

export function getRememberMe(): boolean {
  if (typeof window === 'undefined') return true
  // Default to true (remember) — only opt out explicitly.
  return localStorage.getItem(REMEMBER_KEY) !== 'false'
}

// Custom storage adapter that routes session storage based on the remember flag.
// - Remember = true  → localStorage (persists across browser restarts)
// - Remember = false → sessionStorage (cleared when the tab closes)
// Reads check both stores so an existing session is honoured regardless of where it lives.
const customerStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key) ?? sessionStorage.getItem(key)
  },
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return
    if (getRememberMe()) {
      localStorage.setItem(key, value)
      sessionStorage.removeItem(key)
    } else {
      sessionStorage.setItem(key, value)
      localStorage.removeItem(key)
    }
  },
  removeItem(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export const customerSupabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
      autoRefreshToken: true,
      storageKey: 'cxx-customer-auth',
      storage: customerStorage,
    },
  },
)
