import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// Supabase OAuth callback handler.
// Exchanges the OAuth `code` for a session, then ensures a row exists in the
// `users` table. Handles username collisions by appending a short hex suffix.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) return NextResponse.redirect(`${origin}${next}`);

  const supabase = await createSupabaseServerClient();
  const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeErr) {
    console.error('Error exchanging code for session:', exchangeErr);
    return NextResponse.redirect(
      `${origin}/auth/signin?error=${encodeURIComponent(exchangeErr.message)}`
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}${next}`);

  // Existing profile? Done.
  const { data: existingProfile } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (existingProfile) return NextResponse.redirect(`${origin}${next}`);

  // Build a base username from email prefix or user id.
  const baseRaw = (user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`)
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 24) || `user_${user.id.slice(0, 8)}`;

  // Try base first, then base + 4-hex suffix, retry on unique-violation.
  // Bounded loop to avoid infinite retry on persistent failure.
  for (let attempt = 0; attempt < 6; attempt++) {
    const username = attempt === 0
      ? baseRaw
      : `${baseRaw}_${crypto.randomBytes(2).toString('hex')}`;

    const { error: insertErr } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      username,
      display_name: user.user_metadata?.full_name || baseRaw,
      avatar_url: user.user_metadata?.avatar_url,
      privacy_level: 'friends',
    });

    if (!insertErr) break;

    // 23505 = unique_violation. Retry with a fresh suffix. Bail on anything else.
    const code = (insertErr as any).code;
    if (code !== '23505') {
      console.error('OAuth profile insert failed:', insertErr);
      break;
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
