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
    }
    if (!error) {
      redirect(next)
    }
  }
  else if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Optionally, add error details to the redirect for debugging
  redirect('/error')
}
