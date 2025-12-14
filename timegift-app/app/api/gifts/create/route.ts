import { NextResponse, NextRequest } from 'next/server';
import { getServerUser, adminDb } from '@/lib/firebase-admin';
import { notifyGiftCreated } from '@/utils/notifications';
import { Timestamp } from 'firebase-admin/firestore';

interface CreateGiftPayload {
  recipientType: 'email' | 'phone';
  recipientEmail?: string;
  recipientPhone?: string;
  message: string;
  timeAmount: number;
  timeUnit: 'minutes' | 'hours' | 'days';
  purposeType: 'anything' | 'specific';
  purposeDetails?: string | null;
  availabilityData?: any;
  expiryDate?: string | null;
  isRandomExchange?: boolean;
  userId?: string; // Client sends this for now (will be replaced with token verification)
}

function minutesFromAmount(amount: number, unit: 'minutes' | 'hours' | 'days') {
  if (unit === 'hours') {
    return amount * 60;
  }
  if (unit === 'days') {
    return amount * 60 * 24;
  }
  return amount;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CreateGiftPayload;

    if (!payload.message || !payload.timeAmount || !payload.timeUnit) {
      return NextResponse.json(
        { error: 'Missing required gift fields' },
        { status: 400 }
      );
    }

    // Get user - for now accept userId from payload, later use token verification
    const user = await getServerUser(request) || (payload.userId ? { uid: payload.userId } : null);
    
    if (!user || !user.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.uid;
    const timeInMinutes = minutesFromAmount(payload.timeAmount, payload.timeUnit);

    // Find recipient by email or phone
    let recipientId: string | null = null;
    if (payload.recipientType === 'email' && payload.recipientEmail) {
      const usersRef = adminDb.collection('users');
      const querySnapshot = await usersRef.where('email', '==', payload.recipientEmail).limit(1).get();
      if (!querySnapshot.empty) {
        recipientId = querySnapshot.docs[0].id;
      }
    }

    if (payload.recipientType === 'phone' && payload.recipientPhone) {
      const usersRef = adminDb.collection('users');
      const querySnapshot = await usersRef.where('phone', '==', payload.recipientPhone).limit(1).get();
      if (!querySnapshot.empty) {
        recipientId = querySnapshot.docs[0].id;
      }
    }

    // Get sender profile
    const senderDoc = await adminDb.collection('users').doc(userId).get();
    const senderProfile = senderDoc.exists ? senderDoc.data() : null;

    // Create gift document
    const giftData = {
      sender_id: userId,
      recipient_id: recipientId,
      recipient_email: payload.recipientEmail || null,
      recipient_phone: payload.recipientPhone || null,
      message: payload.message,
      time_amount: timeInMinutes,
      original_time_amount: timeInMinutes,
      time_unit: payload.timeUnit,
      purpose_type: payload.purposeType,
      purpose_details: payload.purposeDetails || null,
      availability_data: payload.availabilityData || null,
      expiry_date: payload.expiryDate ? Timestamp.fromDate(new Date(payload.expiryDate)) : null,
      status: 'pending',
      is_random_exchange: payload.isRandomExchange ?? false,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    const giftRef = await adminDb.collection('gifts').add(giftData);
    const insertedGift = { id: giftRef.id, ...giftData };

    await notifyGiftCreated({
      giftId: insertedGift.id,
      recipientId,
      recipientEmail: insertedGift.recipient_email,
      recipientPhone: insertedGift.recipient_phone,
      senderId: userId,
      senderName:
        senderProfile?.display_name ||
        senderProfile?.username ||
        user.email ||
        'A friend',
      message: payload.message,
    });

    return NextResponse.json({ success: true, gift: insertedGift });
  } catch (error: any) {
    console.error('Error creating gift:', error);
    return NextResponse.json(
      { error: 'Failed to create gift', details: error.message },
      { status: 500 }
    );
  }
}

