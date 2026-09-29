import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/* Keeps the editor's Supabase session fresh and turns signed-out visitors away
   from the admin. The public page never passes through here, so it stays
   static. Whether a signed-in user may actually edit is decided in the admin
   layout (and by RLS), not here. */

const OPEN = ['/admin/login', '/admin/auth', '/admin/reset']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && path.startsWith('/admin') && !OPEN.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = path === '/admin' ? '' : `?next=${encodeURIComponent(path)}`
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/preview/:path*'],
}
