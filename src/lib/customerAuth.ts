import { createClient } from '@supabase/supabase-js'

// Separate Supabase client for customer auth.
// Uses a different localStorage key so customer sessions never touch the admin session.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL) as string
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string

const REMEMBER_KEY = 'cxx-remember-me'

// Kept for API compatibility with the login/register forms. The customer
// session is now ALWAYS persisted (the owner explicitly wants customers to
// stay signed in across reloads and browser restarts until they press
// "Sign out"), so this flag no longer gates storage — it just records the
// user's checkbox preference for future use.
export function setRememberMe(remember: boolean) {
  if (typeof window === 'undefined') return
  localStorage.setItem(REMEMBER_KEY, remember ? 'true' : 'false')
}

export function getRememberMe(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(REMEMBER_KEY) !== 'false'
}

// Storage adapter: ALWAYS localStorage so the customer stays signed in across
// reloads AND browser restarts. Reads fall back to sessionStorage so any
// legacy session written by an older build is still honoured (and migrated
// up to localStorage on the next write).
const customerStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key) ?? sessionStorage.getItem(key)
  },
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, value)
    sessionStorage.removeItem(key)
  },
  removeItem(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

export const CUSTOMER_AUTH_STORAGE_KEY = 'cxx-customer-auth'

export const customerSupabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
      autoRefreshToken: true,
      storageKey: CUSTOMER_AUTH_STORAGE_KEY,
      storage: customerStorage,
    },
  },
)
