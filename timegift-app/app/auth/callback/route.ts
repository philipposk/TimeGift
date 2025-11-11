import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // Create profile if it doesn't exist
      if (!existingProfile) {
        await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: data.user.user_metadata.full_name || data.user.email,
              username: data.user.email?.split('@')[0] || `user_${data.user.id.slice(0, 8)}`,
              privacy_level: 'friends',
            },
          ])

        // Create statistics record
        await supabase
          .from('gift_statistics')
          .insert([{ user_id: data.user.id }])
      }
    }
  }

  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
}
