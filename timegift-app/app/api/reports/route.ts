import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ReportPayload {
  reportedUserId?: string | null;
  giftId?: string | null;
  reason: string;          // short tag: 'spam' | 'harassment' | 'inappropriate' | 'scam' | 'other'
  details?: string | null; // free text
  alsoBlock?: boolean;     // if true, auto-block the reported user
}

const VALID_REASONS = ['spam', 'harassment', 'inappropriate', 'scam', 'other'];

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = (await request.json()) as ReportPayload;
  if (!payload?.reason || !VALID_REASONS.includes(payload.reason)) {
    return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
  }
  if (!payload.reportedUserId && !payload.giftId) {
    return NextResponse.json({ error: 'reportedUserId or giftId required' }, { status: 400 });
  }

  const admin = getSupabaseServiceClient();

  let reportedUserId = payload.reportedUserId || null;
  if (!reportedUserId && payload.giftId) {
    // Derive the other party from the gift.
    const { data: gift } = await admin
      .from('gifts')
      .select('sender_id, recipient_id')
      .eq('id', payload.giftId)
      .single();
    if (gift) {
      reportedUserId = gift.sender_id === user.id ? gift.recipient_id : gift.sender_id;
    }
  }

  const { error: insertErr } = await admin.from('gift_reports').insert({
    reporter_id: user.id,
    reported_user_id: reportedUserId,
    gift_id: payload.giftId || null,
    reason: payload.reason,
    details: payload.details || null,
  });
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  if (payload.alsoBlock && reportedUserId && reportedUserId !== user.id) {
    await admin
      .from('blocks')
      .upsert(
        { blocker_id: user.id, blocked_user_id: reportedUserId, reason: payload.reason },
        { onConflict: 'blocker_id,blocked_user_id', ignoreDuplicates: true }
      );
  }

  return NextResponse.json({ success: true });
}
