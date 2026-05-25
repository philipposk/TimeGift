import { NextResponse, NextRequest } from 'next/server';
import crypto from 'crypto';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface CreatePayload {
  recipientType: 'email' | 'phone';
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName?: string;
  purposeType: 'anything' | 'specific';
  purposeDetails?: string | null;
  // Organizer's own contribution
  hoursMinutes: number;
  message: string;
}

// POST: create the empty group gift and the organizer's first contribution.
// Returns the gift id + a join token URL for sharing with co-senders.
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = (await request.json()) as CreatePayload;
  if (!payload.message || !payload.hoursMinutes || payload.hoursMinutes < 1) {
    return NextResponse.json({ error: 'message + hoursMinutes required' }, { status: 400 });
  }

  const admin = getSupabaseServiceClient();

  let recipientId: string | null = null;
  if (payload.recipientType === 'email' && payload.recipientEmail) {
    const { data } = await admin.from('users').select('id').eq('email', payload.recipientEmail).maybeSingle();
    recipientId = data?.id ?? null;
  } else if (payload.recipientType === 'phone' && payload.recipientPhone) {
    const { data } = await admin.from('users').select('id').eq('phone', payload.recipientPhone).maybeSingle();
    recipientId = data?.id ?? null;
  }

  // The "shell" gift carries totals + status; per-sender details live in
  // gift_contributions and are joined on render.
  const { data: gift, error: insErr } = await admin
    .from('gifts')
    .insert({
      sender_id: user.id,
      recipient_id: recipientId,
      recipient_email: payload.recipientEmail || null,
      recipient_phone: payload.recipientPhone || null,
      message: payload.message,
      time_amount: payload.hoursMinutes,
      original_time_amount: payload.hoursMinutes,
      time_unit: payload.hoursMinutes >= 60 ? 'hours' : 'minutes',
      purpose_type: payload.purposeType,
      purpose_details: payload.purposeDetails || null,
      status: 'pending',
      is_group: true,
    })
    .select()
    .single();
  if (insErr || !gift) return NextResponse.json({ error: insErr?.message || 'Insert failed' }, { status: 500 });

  await admin.from('gift_contributions').insert({
    gift_id: gift.id,
    sender_id: user.id,
    hours_minutes: payload.hoursMinutes,
    message: payload.message,
  });

  const token = crypto.randomBytes(24).toString('base64url');
  await admin.from('group_gift_invites').insert({
    token,
    gift_id: gift.id,
    created_by: user.id,
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  });

  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/g/group/${token}`;
  return NextResponse.json({ success: true, gift, joinUrl });
}
