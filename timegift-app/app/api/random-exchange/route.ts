import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// Match users for random time gift exchange
export async function POST(_request: Request) {
  try {
    // Get random exchange settings
    const settingsDoc = await adminDb.collection('admin_settings').doc('random_exchange').get();
    const exchangeConfig = settingsDoc.exists && settingsDoc.data()?.setting_value
      ? settingsDoc.data()!.setting_value
      : {
          enabled: true,
          match_similar_time: true
        };

    if (!exchangeConfig.enabled) {
      return NextResponse.json({ message: 'Random exchange is disabled' });
    }

    // Get all unmatched entries from the queue
    const queueSnapshot = await adminDb
      .collection('random_exchange_queue')
      .where('matched', '==', false)
      .orderBy('created_at', 'asc')
      .get();

    const queueEntries = queueSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (queueEntries.length < 2) {
      return NextResponse.json({ 
        message: 'Not enough users in queue for matching',
        queueSize: queueEntries.length
      });
    }

    let matchedPairs = 0;

    // Simple matching algorithm: pair users sequentially
    // In a production system, you'd want more sophisticated matching logic
    for (let i = 0; i < queueEntries.length - 1; i += 2) {
      const user1 = queueEntries[i];
      const user2 = queueEntries[i + 1];

      // Create mutual gifts
      await adminDb.collection('gifts').add({
        sender_id: user1.user_id,
        recipient_id: user2.user_id,
        message: 'A random act of kindness - sharing my time with you! 🎁',
        time_amount: user1.time_amount,
        original_time_amount: user1.time_amount,
        time_unit: user1.time_unit,
        purpose_type: user1.purpose_type,
        purpose_details: user1.purpose_details,
        status: 'pending',
        is_random_exchange: true,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      await adminDb.collection('gifts').add({
        sender_id: user2.user_id,
        recipient_id: user1.user_id,
        message: 'A random act of kindness - sharing my time with you! 🎁',
        time_amount: user2.time_amount,
        original_time_amount: user2.time_amount,
        time_unit: user2.time_unit,
        purpose_type: user2.purpose_type,
        purpose_details: user2.purpose_details,
        status: 'pending',
        is_random_exchange: true,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      });

      // Mark queue entries as matched
      await adminDb.collection('random_exchange_queue').doc(user1.id).update({
        matched: true,
        matched_with: user2.user_id,
        updated_at: Timestamp.now(),
      });

      await adminDb.collection('random_exchange_queue').doc(user2.id).update({
        matched: true,
        matched_with: user1.user_id,
        updated_at: Timestamp.now(),
      });

      matchedPairs++;
    }

    return NextResponse.json({
      success: true,
      matchedPairs,
      remainingInQueue: queueEntries.length % 2
    });
  } catch (error: any) {
    console.error('Random exchange error:', error);
    return NextResponse.json(
      { error: 'Failed to process random exchange', details: error.message },
      { status: 500 }
    );
  }
}
