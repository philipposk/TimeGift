import { NextResponse, NextRequest } from 'next/server';
import { getServerUser, adminDb } from '@/lib/firebase-admin';
import { notifyGiftAccepted } from '@/utils/notifications';
import { Timestamp } from 'firebase-admin/firestore';

interface AcceptPayload {
  scheduledDate?: string | null;
  userId?: string; // Client sends this for now
}

export async function POST(
  request: NextRequest,
  { params }: any
) {
  const giftId = params.id;

  try {
    if (!giftId) {
      return NextResponse.json({ error: 'Gift ID is required' }, { status: 400 });
    }

    const payload = (await request.json()) as AcceptPayload;
    
    // Get user - for now accept userId from payload, later use token verification
    const user = await getServerUser(request) || (payload.userId ? { uid: payload.userId } : null);
    
    if (!user || !user.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.uid;

    // Get gift
    const giftDoc = await adminDb.collection('gifts').doc(giftId).get();
    if (!giftDoc.exists) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    const gift = { id: giftDoc.id, ...giftDoc.data() };

    // Ensure the current user is entitled to accept the gift
    const recipientProfileDoc = await adminDb.collection('users').doc(userId).get();
    const recipientProfile = recipientProfileDoc.exists ? recipientProfileDoc.data() : null;

    const isRecipient =
      gift.recipient_id === userId ||
      (!!gift.recipient_email && gift.recipient_email === recipientProfile?.email) ||
      (!!gift.recipient_phone && gift.recipient_phone === recipientProfile?.phone);

    if (!isRecipient) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const status = payload.scheduledDate ? 'scheduled' : 'accepted';

    // Update gift
    const updateData: any = {
      status,
      accepted_at: Timestamp.now(),
      scheduled_datetime: payload.scheduledDate ? Timestamp.fromDate(new Date(payload.scheduledDate)) : null,
      recipient_id: gift.recipient_id || userId,
      updated_at: Timestamp.now(),
    };

    await adminDb.collection('gifts').doc(giftId).update(updateData);
    const updatedGift = { ...gift, ...updateData };

    await notifyGiftAccepted({
      giftId,
      recipientId: updatedGift.recipient_id,
      recipientEmail: updatedGift.recipient_email,
      recipientPhone: updatedGift.recipient_phone,
      senderId: updatedGift.sender_id,
      senderName: null,
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

