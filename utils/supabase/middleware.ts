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
          cookiesToSet.forEach(({ name, value, options }) => {
            // Fix for local development: remove secure flag for HTTP
            const modifiedOptions = { ...options }
            
            // Check if we're in development and using HTTP
            const isLocalHttp = request.url.startsWith('http://') && 
                              (request.url.includes('localhost') || request.url.includes('127.0.0.1'))
            
            if (isLocalHttp || process.env.NODE_ENV === 'development') {
              modifiedOptions.secure = false
              console.log(`Middleware: Setting cookie ${name} with secure: false for local development`)
            }
            
            request.cookies.set(name, value)
          })
          
          supabaseResponse = NextResponse.next({
            request,
          })
          
          cookiesToSet.forEach(({ name, value, options }) => {
            // Apply the same fix to response cookies
            const modifiedOptions = { ...options }
            
            const isLocalHttp = request.url.startsWith('http://') && 
                              (request.url.includes('localhost') || request.url.includes('127.0.0.1'))
            
            if (isLocalHttp || process.env.NODE_ENV === 'development') {
              modifiedOptions.secure = false
            }
            
            supabaseResponse.cookies.set(name, value, modifiedOptions)
          })
        },
      },
    }
  )

  // Don't run auth logic for static files
  if (
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.includes('/favicon.ico')
    //  || request.nextUrl.pathname.includes('/api/')
  ) {
    return supabaseResponse
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes that require authentication
  const protectedRoutes = [
    '/ai',
    '/cloud-storage',
    '/code/code-editor',
    '/code/seo-analyzer',
    '/documents',
    '/extra-tools/cv-maker',
    '/extra-tools/url-shorteners',
    '/pricing',
    '/usage'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}