import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { verifyTurnstile } from '@/lib/turnstile';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Payload {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  turnstileToken?: string;
}

// Server-side signup. Verifies Turnstile (passthrough if key absent), creates
// the auth user via service role, creates the users-table profile row, then
// returns ok. The client then calls supabase.auth.signInWithPassword to start
// the cookie session.
export async function POST(request: NextRequest) {
  const p = (await request.json()) as Payload;
  if (!p?.email || !p?.password || !p?.username) {
    return NextResponse.json({ error: 'email, password, username required' }, { status: 400 });
  }
  if (p.password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }
  if (!/^[a-z0-9_]{2,24}$/.test(p.username)) {
    return NextResponse.json(
      { error: 'Username must be 2-24 chars (a-z, 0-9, _)' },
      { status: 400 }
    );
  }

  const ip = request.headers.get('x-forwarded-for') || undefined;
  const ok = await verifyTurnstile(p.turnstileToken, ip || undefined);
  if (!ok) {
    return NextResponse.json({ error: 'Bot check failed. Please try again.' }, { status: 403 });
  }

  const admin = getSupabaseServiceClient();

  // Username collision check up front (auth.admin createUser doesn't know
  // about our users table).
  const { count } = await admin
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('username', p.username);
  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
  }

  // Decide auto-confirm based on whether SMTP is wired. If RESEND_API_KEY is
  // set we leave confirmation to Supabase's default (which will use our SMTP);
  // otherwise auto-confirm to keep dev/sandbox usable.
  const autoConfirm = !process.env.RESEND_API_KEY;

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: p.email,
    password: p.password,
    email_confirm: autoConfirm,
    user_metadata: { username: p.username, display_name: p.displayName || p.username },
  });
  if (createErr || !created.user) {
    return NextResponse.json({ error: createErr?.message || 'Failed to create user' }, { status: 500 });
  }

  const { error: profileErr } = await admin.from('users').insert({
    id: created.user.id,
    email: p.email,
    username: p.username,
    display_name: p.displayName || p.username,
    privacy_level: 'friends',
  });
  if (profileErr) {
    // Roll back the auth user so the next attempt isn't blocked by a stale row.
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: profileErr.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    requireConfirmation: !autoConfirm,
    userId: created.user.id,
  });
}
