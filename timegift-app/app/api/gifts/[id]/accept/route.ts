import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { notifyGiftAccepted } from '@/utils/notifications';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

interface AcceptPayload {
  scheduledDate?: string | null;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const giftId = params?.id;

  try {
    if (!giftId) {
      return NextResponse.json({ error: 'Gift ID is required' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json().catch(() => ({}))) as AcceptPayload;
    const userId = user.id;

    // Read gift with service client so the entitlement check works for
    // email/phone-only recipients (not yet linked by recipient_id).
    const admin = getSupabaseServiceClient();
    const { data: gift, error: giftErr } = await admin
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .single();
    if (giftErr || !gift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    const { data: recipientProfile } = await admin
      .from('users')
      .select('email, phone')
      .eq('id', userId)
      .single();

    const isRecipient =
      gift.recipient_id === userId ||
      (!!gift.recipient_email && gift.recipient_email === recipientProfile?.email) ||
      (!!gift.recipient_phone && gift.recipient_phone === recipientProfile?.phone);

    if (!isRecipient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const status = payload.scheduledDate ? 'scheduled' : 'accepted';

    const { data: updatedGift, error: updateErr } = await admin
      .from('gifts')
      .update({
        status,
        accepted_at: new Date().toISOString(),
        scheduled_datetime: payload.scheduledDate ? new Date(payload.scheduledDate).toISOString() : null,
        recipient_id: gift.recipient_id || userId,
      })
      .eq('id', giftId)
      .select()
      .single();

    if (updateErr || !updatedGift) {
      throw updateErr || new Error('Update failed');
    }

    const { data: senderProfile } = await admin
      .from('users')
      .select('display_name, username, email')
      .eq('id', updatedGift.sender_id)
      .single();

    await notifyGiftAccepted({
      giftId,
      recipientId: updatedGift.recipient_id,
      recipientEmail: updatedGift.recipient_email,
      recipientPhone: updatedGift.recipient_phone,
      senderId: updatedGift.sender_id,
      senderName:
        senderProfile?.display_name ||
        senderProfile?.username ||
        senderProfile?.email ||
        null,
      message: updatedGift.message,
      scheduledDate: payload.scheduledDate || null,
    });

    return NextResponse.json({ success: true, gift: updatedGift });
  } catch (error: any) {
    console.error('Error accepting gift:', error);
    return NextResponse.json(
      { error: 'Failed to accept gift', details: error.message },
      { status: 500 }
    );
  }
}
