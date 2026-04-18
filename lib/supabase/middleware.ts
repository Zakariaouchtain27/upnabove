import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname

  if (user) {
    // If logged in, fetch user role from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // If user has no role, push to onboarding (unless they're already there)
    if (!profile?.role && path !== '/onboarding' && !path.startsWith('/auth') && !path.startsWith('/logout')) {
       return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    if (profile?.role === 'candidate' && path.startsWith('/employer')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    if (profile?.role === 'employer' && path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/employer', request.url))
    }

    // Redirect away from login/signup if already auth'd
    if (path === '/login' || path === '/signup') {
      if (profile?.role === 'employer') {
        return NextResponse.redirect(new URL('/employer', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

  } else {
    // If not authenticated and trying to access protected routes
    if (path.startsWith('/dashboard') || path.startsWith('/employer') || path === '/onboarding') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return supabaseResponse
}
