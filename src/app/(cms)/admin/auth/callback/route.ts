import { NextResponse, type NextRequest } from 'next/server'
import { createSessionClient } from '@/lib/supabase/server'

/* Where Supabase's email links land (password reset, invites). Swaps the
   one-time code for a session, then carries on. */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const next = request.nextUrl.searchParams.get('next') || '/admin'
  const dest = request.nextUrl.clone()
  dest.search = ''
  dest.pathname = next.startsWith('/') && !next.startsWith('//') ? next : '/admin'

  if (code) {
    const supabase = await createSessionClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(dest)
  }
  dest.pathname = '/admin/login'
  return NextResponse.redirect(dest)
}
