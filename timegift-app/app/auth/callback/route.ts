import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// Supabase OAuth callback handler
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createSupabaseServerClient();
    
    // Exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(error.message)}`);
    }

    // Create user profile if it doesn't exist (for OAuth users)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile for OAuth user
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
          display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          privacy_level: 'friends',
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
