import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { insertNotification } from '@/lib/notify';
import { sendPushToUser } from '@/lib/push';
import { sendEmail, APP_URL } from '@/lib/mailer';
import OnThisDayEmail from '@/emails/on-this-day';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Once a day: find completed gifts whose completed_at month/day matches today
// and that have a memory_story or memory_photo_url. Surface to both parties.
async function run(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admin = getSupabaseServiceClient();

  const today = new Date();
  const month = today.getUTCMonth() + 1;
  const day = today.getUTCDate();
  const cutoffYear = today.getUTCFullYear() - 1;

  // Pull all completed gifts with memory data; filter by month/day in JS
  // (Postgres EXTRACT in a NOT-public RPC would be cleaner, but the volume
  // is tiny in early days).
  const { data: gifts } = await admin
    .from('gifts')
    .select('id, sender_id, recipient_id, memory_story, memory_photo_url, completed_at, message')
    .not('completed_at', 'is', null)
    .or('memory_story.not.is.null,memory_photo_url.not.is.null')
    .lte('completed_at', new Date(cutoffYear + 1, 0, 1).toISOString());

  let sent = 0;
  for (const g of gifts || []) {
    const c = new Date(g.completed_at as string);
    if (c.getUTCMonth() + 1 !== month || c.getUTCDate() !== day) continue;
    const yearsAgo = today.getUTCFullYear() - c.getUTCFullYear();
    if (yearsAgo < 1) continue;

    for (const userId of [g.sender_id, g.recipient_id]) {
      if (!userId) continue;
      const otherId = userId === g.sender_id ? g.recipient_id : g.sender_id;
      const { data: other } = await admin
        .from('users')
        .select('display_name, username')
        .eq('id', otherId)
        .maybeSingle();
      const otherName = other?.display_name || other?.username || 'them';
      const giftUrl = `${APP_URL}/gifts/${g.id}`;

      await insertNotification({
        userId,
        giftId: g.id,
        type: 'system',
        title: `${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago today`,
        message: `You and ${otherName}.`,
      });

      await sendPushToUser(userId, {
        title: `${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago today`,
        body: `You and ${otherName}.`,
        url: `/gifts/${g.id}`,
        tag: `onthisday:${g.id}`,
      });

      const { data: u } = await admin
        .from('users')
        .select('email')
        .eq('id', userId)
        .maybeSingle();
      if (u?.email) {
        await sendEmail({
          to: u.email,
          subject: `${yearsAgo} year${yearsAgo === 1 ? '' : 's'} ago today`,
          template: OnThisDayEmail({
            otherName,
            yearsAgo,
            story: g.memory_story || null,
            photoUrl: g.memory_photo_url || null,
            giftUrl,
          }),
        });
      }
      sent++;
    }
  }

  return NextResponse.json({ success: true, sent, considered: gifts?.length || 0 });
}

export async function GET(request: Request) { return run(request); }
export async function POST(request: Request) { return run(request); }
