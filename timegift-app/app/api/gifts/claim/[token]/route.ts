import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { insertNotification } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: look up a claim token, return the gift preview (sender name + message).
//      No auth required - so unregistered people clicking an email link can see
//      what they have been gifted before signing up.
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const admin = getSupabaseServiceClient();
  const { data: row } = await admin
    .from('claim_tokens')
    .select('*')
    .eq('token', token)
    .single();
  if (!row) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 410 });
  }
  if (row.claimed_at) {
    return NextResponse.json({ error: 'Already claimed' }, { status: 409 });
  }

  const { data: gift } = await admin
    .from('gifts')
    .select('id, message, time_amount, time_unit, purpose_type, purpose_details, sender_id, status, voice_url, voice_duration_seconds')
    .eq('id', row.gift_id)
    .single();
  if (!gift) return NextResponse.json({ error: 'Gift no longer exists' }, { status: 404 });

  const { data: sender } = await admin
    .from('users')
    .select('display_name, username, avatar_url')
    .eq('id', gift.sender_id)
    .single();

  return NextResponse.json({
    gift: {
      id: gift.id,
      message: gift.message,
      timeAmount: gift.time_amount,
      timeUnit: gift.time_unit,
      purposeType: gift.purpose_type,
      purposeDetails: gift.purpose_details,
      status: gift.status,
      voiceUrl: gift.voice_url,
      voiceDurationSeconds: gift.voice_duration_seconds,
      sender: {
        displayName: sender?.display_name || sender?.username || 'Someone',
        avatarUrl: sender?.avatar_url || null,
      },
    },
    recipient: {
      email: row.recipient_email,
      phone: row.recipient_phone,
    },
  });
}

// POST: claim the token. Requires the user to be signed in. Verifies the
// signed-in user's email/phone matches the token's recipient, links the gift
// to their account, marks the token claimed.
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in first' }, { status: 401 });

  const admin = getSupabaseServiceClient();
  const { data: row } = await admin
    .from('claim_tokens')
    .select('*')
    .eq('token', token)
    .single();
  if (!row) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Token expired' }, { status: 410 });
  }
  if (row.claimed_at) {
    return NextResponse.json({ error: 'Already claimed' }, { status: 409 });
  }

  const { data: profile } = await admin
    .from('users')
    .select('email, phone')
    .eq('id', user.id)
    .single();
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const emailMatch = row.recipient_email && profile.email === row.recipient_email;
  const phoneMatch = row.recipient_phone && profile.phone === row.recipient_phone;
  if (!emailMatch && !phoneMatch) {
    return NextResponse.json(
      { error: 'This claim link does not belong to your account' },
      { status: 403 }
    );
  }

  // Link the gift to this user + mark token claimed (transactional via separate
  // updates: token is single-use and re-checked at the top, low risk of race).
  await admin.from('gifts').update({ recipient_id: user.id }).eq('id', row.gift_id);
  await admin
    .from('claim_tokens')
    .update({ claimed_at: new Date().toISOString(), claimed_by: user.id })
    .eq('token', token);

  await insertNotification({
    userId: user.id,
    giftId: row.gift_id,
    type: 'gift_received',
    title: 'You have a TimeGift',
    message: 'A gift sent to your email/phone is now in your account.',
  });

  return NextResponse.json({ success: true, giftId: row.gift_id });
}
