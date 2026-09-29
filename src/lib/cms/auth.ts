import 'server-only'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import { createSessionClient } from '@/lib/supabase/server'

/* The proxy already sends signed-out visitors to the login page; this is the
   check that counts, because it asks the database whether the user is on the
   editor allowlist - the same rule RLS applies to every write. */
export const getEditor = cache(async () => {
  const supabase = await createSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, isAdmin: false }
  const { data: isAdmin } = await supabase.rpc('is_admin')
  return { supabase, user, isAdmin: isAdmin === true }
})

export async function requireEditor() {
  const e = await getEditor()
  if (!e.user) redirect('/admin/login')
  if (!e.isAdmin) redirect('/admin/login?error=not-an-editor')
  return e as typeof e & { user: NonNullable<typeof e.user> }
}
