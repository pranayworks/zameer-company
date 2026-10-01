import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ziuqzoqwkbtpjbleoibj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_mmGLuziB99Tw2hI2AsPqSg_OPfwqgRE'

/**
 * Custom fetch wrapper that catches unhandled network connection failures (e.g. offline, 
 * invalid domain, or unconfigured Supabase backend) and returns a clean 503 Response.
 * This prevents AuthRetryableFetchError and TypeError: Failed to fetch from polluting 
 * the browser console or triggering Next.js error overlays.
 */
const safeFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init)
  } catch (err) {
    return new Response(
      JSON.stringify({ message: 'Supabase service offline or unconfigured.', error: String(err) }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: safeFetch,
  },
})

/**
 * Safe auth helper: reads the user from the local session instead of making
 * a network call via getUser(). This prevents the Supabase auth-token lock
 * from being stolen when multiple components initialize concurrently.
 */
export async function getSessionUser() {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error || !data?.session) return { user: null, error }
    return { user: data.session.user, error: null }
  } catch (e) {
    return { user: null, error: e }
  }
}
