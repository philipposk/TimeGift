import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Match users for random time gift exchange
export async function POST(request: Request) {
  try {
    // Get random exchange settings
    const { data: settings } = await supabaseAdmin
      .from('admin_settings')
      .select('setting_value')
      .eq('setting_key', 'random_exchange')
      .single();

    const exchangeConfig = settings?.setting_value || {
      enabled: true,
      match_similar_time: true
    };

    if (!exchangeConfig.enabled) {
      return NextResponse.json({ message: 'Random exchange is disabled' });
    }

    // Get all unmatched entries from the queue
    const { data: queueEntries, error } = await supabaseAdmin
      .from('random_exchange_queue')
      .select('*')
      .eq('matched', false)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!queueEntries || queueEntries.length < 2) {
      return NextResponse.json({ 
        message: 'Not enough users in queue for matching',
        queueSize: queueEntries?.length || 0
      });
    }

    let matchedPairs = 0;

    // Simple matching algorithm: pair users sequentially
    // In a production system, you'd want more sophisticated matching logic
    for (let i = 0; i < queueEntries.length - 1; i += 2) {
      const user1 = queueEntries[i];
      const user2 = queueEntries[i + 1];

      // Create mutual gifts
      await supabaseAdmin.from('gifts').insert([
        {
          sender_id: user1.user_id,
          recipient_id: user2.user_id,
          message: 'A random act of kindness - sharing my time with you! 🎁',
          time_amount: user1.time_amount,
          original_time_amount: user1.time_amount,
          time_unit: user1.time_unit,
          purpose_type: user1.purpose_type,
          purpose_details: user1.purpose_details,
          status: 'pending',
          is_random_exchange: true
        },
        {
          sender_id: user2.user_id,
          recipient_id: user1.user_id,
          message: 'A random act of kindness - sharing my time with you! 🎁',
          time_amount: user2.time_amount,
          original_time_amount: user2.time_amount,
          time_unit: user2.time_unit,
          purpose_type: user2.purpose_type,
          purpose_details: user2.purpose_details,
          status: 'pending',
          is_random_exchange: true
        }
      ]);

      // Mark queue entries as matched
      await supabaseAdmin
        .from('random_exchange_queue')
        .update({ matched: true, matched_with: user2.user_id })
        .eq('id', user1.id);

      await supabaseAdmin
        .from('random_exchange_queue')
        .update({ matched: true, matched_with: user1.user_id })
        .eq('id', user2.id);

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
