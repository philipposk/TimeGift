import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { insertNotification } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface Payload {
  scheduledDate: string;
}

// Either party can propose a new datetime on a scheduled gift.
// (Simple model: instant update, no two-step propose/confirm.)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: giftId } = await context.params;
  if (!giftId) return NextResponse.json({ error: 'Gift ID required' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = (await request.json()) as Payload;
  if (!payload?.scheduledDate) {
    return NextResponse.json({ error: 'scheduledDate is required' }, { status: 400 });
  }
  const when = new Date(payload.scheduledDate);
  if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
    return NextResponse.json({ error: 'scheduledDate must be a future ISO timestamp' }, { status: 400 });
  }

  const admin = getSupabaseServiceClient();
  const { data: gift } = await admin.from('gifts').select('*').eq('id', giftId).single();
  if (!gift) return NextResponse.json({ error: 'Gift not found' }, { status: 404 });

  const isParty = gift.sender_id === user.id || gift.recipient_id === user.id;
  if (!isParty) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!['accepted', 'scheduled'].includes(gift.status)) {
    return NextResponse.json(
      { error: `Cannot reschedule gift in status ${gift.status}` },
      { status: 400 }
    );
  }

  const { error: updateErr } = await admin
    .from('gifts')
    .update({ status: 'scheduled', scheduled_datetime: when.toISOString() })
    .eq('id', giftId);
  if (updateErr) throw updateErr;

  const otherUserId = user.id === gift.sender_id ? gift.recipient_id : gift.sender_id;
  if (otherUserId) {
    await insertNotification({
      userId: otherUserId,
      giftId,
      type: 'gift_scheduled',
      title: 'TimeGift rescheduled',
      message: `New time: ${when.toLocaleString()}.`,
    });
  }

  return NextResponse.json({ success: true });
}
