import { createClient } from '@supabase/supabase-js'

// Separate Supabase client for customer auth.
// Uses a different localStorage key so customer sessions never touch the admin session.
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL) as string
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string

export const customerSupabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: false,
      autoRefreshToken: true,
      storageKey: 'cxx-customer-auth',
    },
  },
)
