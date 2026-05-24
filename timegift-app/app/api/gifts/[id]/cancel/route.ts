import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { insertNotification } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Sender-side cancel. Only allowed while not yet completed.
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: giftId } = await context.params;
  if (!giftId) return NextResponse.json({ error: 'Gift ID required' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = getSupabaseServiceClient();
  const { data: gift } = await admin.from('gifts').select('*').eq('id', giftId).single();
  if (!gift) return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
  if (gift.sender_id !== user.id) {
    return NextResponse.json({ error: 'Only the sender can cancel' }, { status: 403 });
  }
  if (['completed', 'expired', 'cancelled', 'declined'].includes(gift.status)) {
    return NextResponse.json(
      { error: `Cannot cancel gift in status ${gift.status}` },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const { error: updateErr } = await admin
    .from('gifts')
    .update({ status: 'cancelled', cancelled_at: now })
    .eq('id', giftId);
  if (updateErr) throw updateErr;

  if (gift.recipient_id) {
    await insertNotification({
      userId: gift.recipient_id,
      giftId,
      type: 'gift_cancelled',
      title: 'TimeGift cancelled',
      message: 'The sender cancelled their TimeGift.',
    });
  }

  return NextResponse.json({ success: true });
}
