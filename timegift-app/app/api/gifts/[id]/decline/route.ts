import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { insertNotification } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

  const { data: me } = await admin.from('users').select('email, phone').eq('id', user.id).single();
  const isRecipient =
    gift.recipient_id === user.id ||
    (!!gift.recipient_email && gift.recipient_email === me?.email) ||
    (!!gift.recipient_phone && gift.recipient_phone === me?.phone);
  if (!isRecipient) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!['pending', 'accepted', 'scheduled'].includes(gift.status)) {
    return NextResponse.json(
      { error: `Cannot decline gift in status ${gift.status}` },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const { error: updateErr } = await admin
    .from('gifts')
    .update({ status: 'declined', declined_at: now, recipient_id: gift.recipient_id || user.id })
    .eq('id', giftId);
  if (updateErr) throw updateErr;

  await insertNotification({
    userId: gift.sender_id,
    giftId,
    type: 'gift_declined',
    title: 'TimeGift declined',
    message: 'The recipient declined your TimeGift.',
  });

  return NextResponse.json({ success: true });
}
