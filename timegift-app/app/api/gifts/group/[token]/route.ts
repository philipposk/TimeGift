import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: preview the group gift (anyone with link)
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const admin = getSupabaseServiceClient();
  const { data: invite } = await admin
    .from('group_gift_invites')
    .select('*')
    .eq('token', token)
    .single();
  if (!invite) return NextResponse.json({ error: 'Invalid' }, { status: 404 });
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Expired' }, { status: 410 });
  }

  const { data: gift } = await admin
    .from('gifts')
    .select('id, recipient_email, recipient_phone, message, purpose_type, purpose_details, time_amount, status')
    .eq('id', invite.gift_id)
    .single();
  if (!gift) return NextResponse.json({ error: 'Gift gone' }, { status: 404 });

  const { data: contribs } = await admin
    .from('gift_contributions')
    .select('hours_minutes, sender_id, message, created_at')
    .eq('gift_id', invite.gift_id);

  // Don't expose contributor identity; only count + name for organizer.
  const { data: organizer } = await admin
    .from('users')
    .select('display_name, username')
    .eq('id', invite.created_by)
    .single();

  return NextResponse.json({
    gift,
    organizerName: organizer?.display_name || organizer?.username || 'Someone',
    contributorCount: (contribs || []).length,
    totalMinutes: (contribs || []).reduce((s, c) => s + (c.hours_minutes || 0), 0),
  });
}

interface JoinPayload {
  hoursMinutes: number;
  message?: string;
}

// POST: add a contribution. Requires sign-in.
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in first' }, { status: 401 });

  const admin = getSupabaseServiceClient();
  const { data: invite } = await admin
    .from('group_gift_invites')
    .select('*')
    .eq('token', token)
    .single();
  if (!invite) return NextResponse.json({ error: 'Invalid' }, { status: 404 });
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Expired' }, { status: 410 });
  }

  const payload = (await request.json()) as JoinPayload;
  if (!payload.hoursMinutes || payload.hoursMinutes < 1) {
    return NextResponse.json({ error: 'hoursMinutes required' }, { status: 400 });
  }

  const { error: upErr } = await admin
    .from('gift_contributions')
    .upsert(
      {
        gift_id: invite.gift_id,
        sender_id: user.id,
        hours_minutes: payload.hoursMinutes,
        message: payload.message || null,
      },
      { onConflict: 'gift_id,sender_id' }
    );
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // Recompute total on the shell gift.
  const { data: contribs } = await admin
    .from('gift_contributions')
    .select('hours_minutes')
    .eq('gift_id', invite.gift_id);
  const total = (contribs || []).reduce((s, c) => s + (c.hours_minutes || 0), 0);
  await admin.from('gifts').update({ time_amount: total, original_time_amount: total }).eq('id', invite.gift_id);

  return NextResponse.json({ success: true, totalMinutes: total });
}
