import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Safe auth helper: reads the user from the local session instead of making
 * a network call via getUser(). This prevents the Supabase auth-token lock
 * from being stolen when multiple components initialize concurrently
 * (e.g. React StrictMode double-mounting, multiple contexts loading at once).
 */
export async function getSessionUser() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error || !session) return { user: null, error }
  return { user: session.user, error: null }
}
