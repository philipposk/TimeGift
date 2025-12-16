import { NextResponse, NextRequest } from 'next/server';
import { getServerUser, adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Get reminders for user
export async function GET(request: NextRequest) {
  try {
    const user = await getServerUser(request);
    if (!user || !user.uid || !adminDb) {
      return NextResponse.json({ reminders: [] });
    }

    const now = Timestamp.now();
    const tomorrow = Timestamp.fromMillis(now.toMillis() + 24 * 60 * 60 * 1000);

    // Get scheduled gifts happening soon
    const scheduledGiftsQuery = adminDb
      .collection('gifts')
      .where('status', '==', 'scheduled')
      .where('scheduled_datetime', '>=', now)
      .where('scheduled_datetime', '<=', tomorrow);

    const scheduledSnapshot = await scheduledGiftsQuery.get();
    const scheduledGifts = scheduledSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get pending gifts that need attention
    const pendingGiftsQuery = adminDb
      .collection('gifts')
      .where('status', '==', 'pending')
      .where('recipient_id', '==', user.uid);

    const pendingSnapshot = await pendingGiftsQuery.get();
    const pendingGifts = pendingSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Get gifts that haven't been gifted to in a while
    const recentGiftsQuery = adminDb
      .collection('gifts')
      .where('sender_id', '==', user.uid)
      .orderBy('created_at', 'desc')
      .limit(10);

    const recentSnapshot = await recentGiftsQuery.get();
    const recentGifts = recentSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const reminders = [
      ...scheduledGifts.map(gift => ({
        type: 'scheduled',
        title: 'Upcoming Scheduled Time',
        message: `You have scheduled time with ${gift.recipient_email || 'someone'} tomorrow!`,
        giftId: gift.id,
        priority: 'high',
      })),
      ...pendingGifts.slice(0, 3).map(gift => ({
        type: 'pending',
        title: 'Pending Gift to Accept',
        message: `You have a pending gift: "${gift.message?.substring(0, 50)}..."`,
        giftId: gift.id,
        priority: 'medium',
      })),
    ];

    return NextResponse.json({ reminders });
  } catch (error: any) {
    console.error('Error getting reminders:', error);
    return NextResponse.json(
      { error: 'Failed to get reminders', details: error.message },
      { status: 500 }
    );
  }
}
