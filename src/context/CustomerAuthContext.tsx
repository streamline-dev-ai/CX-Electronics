import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { customerSupabase, setRememberMe } from '../lib/customerAuth'
import { supabase } from '../lib/supabase'
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

    const { data: { subscription } } = customerSupabase.auth.onAuthStateChange((event, session) => {
      // Only react to events that actually change who the user is.
      // Ignore TOKEN_REFRESHED-with-null, INITIAL_SESSION-without-session etc.
      // — the initial getSession() above already established the right state.
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) setUser(toCustomerUser(session.user))
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Only update user details if the refreshed session has changed metadata.
        setUser(toCustomerUser(session.user))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email: string, password: string, name: string, remember = true): Promise<SignUpResult> {
    setRememberMe(remember)
    const { data, error } = await customerSupabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/account/login`,
      },
    })

    if (error) return { error: error.message, needsConfirmation: false }

    // Fire welcome email — fire-and-forget
    notifySignup(name, email).catch(() => {})

    // Stub a customers row so the admin Customers page can see new signups
    // even before they place an order. The checkout upserts on email later
    // and fills in the address details.
    supabase
      .from('customers')
      .upsert(
        { name: name.trim(), email: email.toLowerCase().trim() },
        { onConflict: 'email' },
      )
      .then(() => {}, () => {})

    // No session yet → Supabase is waiting for email confirmation.
    const needsConfirmation = !!data.user && !data.session
    return { error: null, needsConfirmation }
  }

  async function signIn(email: string, password: string, remember = true): Promise<string | null> {
    setRememberMe(remember)
    const { error } = await customerSupabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = error.message.toLowerCase()
      if (msg.includes('email not confirmed')) {
        return 'Please check your inbox and confirm your email before signing in.'
      }
      if (msg.includes('invalid login credentials')) {
        return 'Incorrect email or password.'
      }
      return error.message
    }
    return null
  }

  async function signOut(): Promise<void> {
    // scope:'local' = only sign out this client/tab. Default 'global' would
    // hit the auth server and could cascade into the admin session if the
    // server invalidates all refresh tokens for the same user.
    await customerSupabase.auth.signOut({ scope: 'local' })
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
