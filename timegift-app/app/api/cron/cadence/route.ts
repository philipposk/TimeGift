import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { insertNotification } from '@/lib/notify';
import { sendPushToUser } from '@/lib/push';
import { sendEmail, APP_URL } from '@/lib/mailer';
import CadenceReminderEmail from '@/emails/cadence-reminder';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Sends one nudge per friendship that has cadence_days set and is overdue.
// Suppresses re-notify until cadence_warned_at is older than cadence_days/2.
async function run(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const admin = getSupabaseServiceClient();
  const now = new Date();

  const { data: rows, error } = await admin
    .from('friendships')
    .select('id, user_id, friend_id, cadence_days, last_gift_at, cadence_warned_at')
    .not('cadence_days', 'is', null)
    .eq('status', 'accepted');
  if (error) throw error;

  let sent = 0;
  for (const f of rows || []) {
    const cadence = f.cadence_days as number;
    const ref = f.last_gift_at ? new Date(f.last_gift_at) : null;
    const daysSince = ref ? Math.floor((now.getTime() - ref.getTime()) / 86400000) : 99999;
    if (daysSince < cadence) continue;

    if (f.cadence_warned_at) {
      const warnedAgo = Math.floor((now.getTime() - new Date(f.cadence_warned_at).getTime()) / 86400000);
      if (warnedAgo < Math.ceil(cadence / 2)) continue;
    }

    // The user who set the cadence is the requester (user_id) - we remind them about friend_id.
    const requesterId = f.user_id;
    const friendId = f.friend_id;
    const { data: friend } = await admin
      .from('users')
      .select('display_name, username')
      .eq('id', friendId)
      .maybeSingle();
    const friendName = friend?.display_name || friend?.username || 'your friend';

    await insertNotification({
      userId: requesterId,
      type: 'reminder',
      title: `${daysSince} days since ${friendName}`,
      message: 'Maybe an hour. Maybe a coffee. You asked us to remind you.',
    });

    await sendPushToUser(requesterId, {
      title: `${daysSince} days since ${friendName}`,
      body: 'Maybe an hour. Maybe a coffee.',
      url: '/create',
      tag: `cadence:${f.id}`,
    });

    const { data: requester } = await admin
      .from('users')
      .select('email')
      .eq('id', requesterId)
      .maybeSingle();
    if (requester?.email) {
      await sendEmail({
        to: requester.email,
        subject: `${daysSince} days since ${friendName}`,
        template: CadenceReminderEmail({
          friendName,
          daysQuiet: daysSince,
          createUrl: `${APP_URL}/create`,
        }),
      });
    }

    await admin.from('friendships').update({ cadence_warned_at: now.toISOString() }).eq('id', f.id);
    sent++;
  }

  return NextResponse.json({ success: true, sent, considered: rows?.length || 0 });
}

export async function GET(request: Request) { return run(request); }
export async function POST(request: Request) { return run(request); }
