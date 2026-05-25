import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { insertNotification } from '@/lib/notify';
import { sendPushToUser } from '@/lib/push';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Surfaces gifts whose legacy_visible_at has just passed: a note to the
// sender + recipient that the letter is now publicly visible (or, in MVP,
// just becomes a memory item flagged "legacy").
async function run(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admin = getSupabaseServiceClient();
  const now = new Date();

  const { data: gifts } = await admin
    .from('gifts')
    .select('id, sender_id, recipient_id, message')
    .not('legacy_visible_at', 'is', null)
    .lte('legacy_visible_at', now.toISOString())
    .eq('flagged_for_review', false)
    .limit(200);

  let notified = 0;
  for (const g of gifts || []) {
    for (const uid of [g.sender_id, g.recipient_id]) {
      if (!uid) continue;
      await insertNotification({
        userId: uid,
        giftId: g.id,
        type: 'system',
        title: 'A legacy letter has opened',
        message: 'A TimeGift you marked as a legacy is visible today.',
      });
      await sendPushToUser(uid, {
        title: 'A legacy letter has opened',
        body: 'A TimeGift you set aside is visible today.',
        url: `/gifts/${g.id}`,
        tag: `legacy:${g.id}`,
      });
      notified++;
    }
  }

  return NextResponse.json({ success: true, notified, considered: gifts?.length || 0 });
}

export async function GET(request: Request) { return run(request); }
export async function POST(request: Request) { return run(request); }
