import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { insertNotification } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Auto-complete scheduled gifts 24h past their scheduled_datetime. Sends a
// notification to both parties prompting them to add a memory.
async function run(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseServiceClient();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: gifts, error } = await admin
    .from('gifts')
    .select('id, sender_id, recipient_id')
    .eq('status', 'scheduled')
    .lte('scheduled_datetime', cutoff);

  if (error) throw error;

  let completed = 0;
  for (const gift of gifts || []) {
    const { error: updateErr } = await admin
      .from('gifts')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', gift.id);
    if (updateErr) continue;
    completed++;

    for (const uid of [gift.sender_id, gift.recipient_id]) {
      if (!uid) continue;
      await insertNotification({
        userId: uid,
        giftId: gift.id,
        type: 'gift_completed',
        title: 'TimeGift auto-completed',
        message: 'Your scheduled time has passed. Add a memory to remember it!',
      });
    }
  }

  return NextResponse.json({ success: true, completed, total: gifts?.length || 0 });
}

export async function GET(request: Request) { return run(request); }
export async function POST(request: Request) { return run(request); }
