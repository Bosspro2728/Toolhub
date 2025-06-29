import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Fix for local development: remove secure flag for HTTP
              const modifiedOptions = { ...options }
              
              if (process.env.NODE_ENV === 'development') {
                // In development, allow cookies over HTTP by removing secure flag
                modifiedOptions.secure = false
                console.log(`Setting cookie ${name} with secure: false for development`)
              }
              
              cookieStore.set(name, value, modifiedOptions)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
            console.log('Cookie setting error (can be ignored):', error)
          }
        },
      },
    }
  )
}