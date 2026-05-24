import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { insertNotification } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Either party can mark a scheduled/accepted gift as completed.
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

  const isParty = gift.sender_id === user.id || gift.recipient_id === user.id;
  if (!isParty) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!['accepted', 'scheduled'].includes(gift.status)) {
    return NextResponse.json(
      { error: `Cannot complete gift in status ${gift.status}` },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const { error: updateErr } = await admin
    .from('gifts')
    .update({ status: 'completed', completed_at: now })
    .eq('id', giftId);
  if (updateErr) throw updateErr;

  // Notify the other party.
  const otherUserId = user.id === gift.sender_id ? gift.recipient_id : gift.sender_id;
  if (otherUserId) {
    await insertNotification({
      userId: otherUserId,
      giftId,
      type: 'gift_completed',
      title: 'TimeGift completed',
      message: 'Your shared time was marked as completed. Add a memory!',
    });
  }

  return NextResponse.json({ success: true });
}
