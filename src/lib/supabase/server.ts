import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { SUPABASE_KEY, SUPABASE_URL } from './env'

/** Acts as the signed-in editor. RLS decides what they may do. */
export async function createSessionClient() {
  const store = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options))
        } catch {
          /* called from a Server Component - the proxy refreshes the session instead */
        }
      },
    },
  })
}

/** Anonymous, cookie-free - for reading published content, so pages stay cacheable. */
export function createPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Service role, if configured. Bypasses RLS - server only, never for user-driven reads. */
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createClient(SUPABASE_URL, key, { auth: { persistSession: false, autoRefreshToken: false } })
}
