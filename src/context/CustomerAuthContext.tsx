import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { customerSupabase, setRememberMe } from '../lib/customerAuth'
import { notifySignup } from '../lib/webhooks'

export interface CustomerUser {
  id: string
  email: string
  name: string
  created_at: string
}

interface SignUpResult {
  error: string | null
  needsConfirmation: boolean
}

interface CustomerAuthContextType {
  user: CustomerUser | null
  loading: boolean
  signIn: (email: string, password: string, remember?: boolean) => Promise<string | null>
  signUp: (email: string, password: string, name: string, remember?: boolean) => Promise<SignUpResult>
  signOut: () => Promise<void>
  updateName: (name: string) => Promise<string | null>
  resendConfirmation: (email: string) => Promise<string | null>
}

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null)

function toCustomerUser(user: User): CustomerUser {
  return {
    id: user.id,
    email: user.email ?? '',
    name: (user.user_metadata?.name as string) ?? user.email ?? '',
    created_at: user.created_at,
  }
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    customerSupabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? toCustomerUser(session.user) : null)
      setLoading(false)
    })

    const { data: { subscription } } = customerSupabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toCustomerUser(session.user) : null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string, name: string, remember = true): Promise<SignUpResult> {
    setRememberMe(remember)
    const { data, error } = await customerSupabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })

    if (error) return { error: error.message, needsConfirmation: false }

    // Fire welcome email — fire-and-forget
    notifySignup(name, email).catch(() => {})

    // Auto-confirm trigger sets email_confirmed_at server-side. If the initial
    // signUp didn't return a session (Supabase project may still have email
    // confirmation enabled), sign them in directly so they land logged in.
    if (data.user && !data.session) {
      await customerSupabase.auth.signInWithPassword({ email, password })
    }

    return { error: null, needsConfirmation: false }
  }

  async function signIn(email: string, password: string, remember = true): Promise<string | null> {
    setRememberMe(remember)
    const { error } = await customerSupabase.auth.signInWithPassword({ email, password })
    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        return 'Incorrect email or password.'
      }
      return error.message
    }
    return null
  }

  async function signOut(): Promise<void> {
    await customerSupabase.auth.signOut()
    setUser(null)
  }

  async function updateName(name: string): Promise<string | null> {
    const { error } = await customerSupabase.auth.updateUser({ data: { name } })
    if (error) return error.message
    setUser((prev) => prev ? { ...prev, name } : prev)
    return null
  }

  async function resendConfirmation(email: string): Promise<string | null> {
    const { error } = await customerSupabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/account/login`,
      },
    })
    return error ? error.message : null
  }

  return (
    <CustomerAuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateName, resendConfirmation }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) throw new Error('useCustomerAuth must be inside CustomerAuthProvider')
  return ctx
}
