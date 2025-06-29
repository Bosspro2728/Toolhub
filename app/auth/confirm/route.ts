import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  const code = searchParams.get('code')
  const supabase = await createClient()
  
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (error) {
      // For debugging: log the error
      console.error('verifyOtp error:', error)
      return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(error.message)}`, request.url))
    }
    
    // If next path is reset-password, redirect with token
    if (next === '/reset-password') {
      return NextResponse.redirect(new URL(`${next}?token=${token_hash}`, request.url))
    }
    
    return NextResponse.redirect(new URL(next, request.url))
  }
  else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('exchangeCodeForSession error:', error)
      return NextResponse.redirect(new URL(`/error?message=${encodeURIComponent(error.message)}`, request.url))
    }
    
    return NextResponse.redirect(new URL(next, request.url))
  }

  // Optionally, add error details to the redirect for debugging
  return NextResponse.redirect(new URL('/error?message=Invalid confirmation link', request.url))
}