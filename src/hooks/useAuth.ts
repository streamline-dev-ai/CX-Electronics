import { useState, useEffect } from 'react'
import { supabase, setAdminRememberMe } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, session: null, loading: true })

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setState({ user: data.session?.user ?? null, session: data.session, loading: false })
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false })
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  return state
}

export async function signIn(email: string, password: string, remember = true) {
  setAdminRememberMe(remember)
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  // scope:'local' — only end this admin session, don't cascade through
  // refresh tokens server-side (which can knock out a separate logged-in
  // customer session sharing the same auth user).
  return supabase.auth.signOut({ scope: 'local' })
}
