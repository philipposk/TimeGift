import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { sendSMSNotification } from '@/utils/notifications/vonage';
import { sendWhatsAppNotification } from '@/utils/notifications/whatsapp';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Daily reminder dispatcher. Sends in-app + SMS/WhatsApp reminders for:
//   1. Scheduled gifts happening in the next 24h.
//   2. Pending gifts older than 24h (recipient hasn't accepted yet).
// Auth: `Authorization: Bearer ${CRON_SECRET}` if CRON_SECRET is set.
async function run(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getSupabaseServiceClient();

  const { data: settingsRows } = await admin
    .from('admin_settings')
    .select('setting_key, setting_value');

  const settings = (settingsRows || []).reduce<Record<string, any>>((acc, r) => {
    acc[r.setting_key] = r.setting_value;
    return acc;
  }, {});

  const notificationPrefs = settings.notifications || {};
  const channels: string[] = Array.isArray(notificationPrefs.channels)
    ? notificationPrefs.channels
    : ['in_app', 'sms'];
  const reminderCopy: string[] = Array.isArray(notificationPrefs.reminder_messages)
    ? notificationPrefs.reminder_messages
    : ['You have been summoned!', 'Time to be redeemed!', 'Someone awaits your gift of time!'];

  const vonageConfig = settings.vonage_api || {};
  const whatsappConfig = settings.whatsapp_api || {};

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const { data: scheduled } = await admin
    .from('gifts')
    .select('id, recipient_id, recipient_email, recipient_phone, message, scheduled_datetime')
    .eq('status', 'scheduled')
    .gte('scheduled_datetime', now.toISOString())
    .lte('scheduled_datetime', in24h.toISOString());

  const { data: stalePending } = await admin
    .from('gifts')
    .select('id, recipient_id, recipient_email, recipient_phone, message')
    .eq('status', 'pending')
    .lte('created_at', dayAgo.toISOString());

  let sent = 0;

  for (const gift of scheduled || []) {
    const copy = reminderCopy[Math.floor(Math.random() * reminderCopy.length)];
    if (gift.recipient_id) {
      await admin.from('notifications').insert({
        user_id: gift.recipient_id,
        gift_id: gift.id,
        type: 'reminder',
        title: 'Scheduled TimeGift coming up',
        message: copy,
        sent_via: 'in_app',
      });
      sent++;
    }
    if (channels.includes('sms') && gift.recipient_phone) {
      await sendSMSNotification(
        gift.recipient_phone,
        `${copy} Your scheduled TimeGift is coming up soon.`,
        vonageConfig?.api_key,
        vonageConfig?.api_secret,
        vonageConfig?.from_number || 'TimeGift'
      );
    }
    if (channels.includes('whatsapp') && gift.recipient_phone) {
      await sendWhatsAppNotification(
        gift.recipient_phone,
        `${copy} Your scheduled TimeGift is coming up.`,
        whatsappConfig?.api_key,
        whatsappConfig?.api_secret || vonageConfig?.api_secret,
        whatsappConfig?.from_number || vonageConfig?.whatsapp_number
      );
    }
  }

  for (const gift of stalePending || []) {
    if (!gift.recipient_id) continue;
    const copy = reminderCopy[Math.floor(Math.random() * reminderCopy.length)];
    await admin.from('notifications').insert({
      user_id: gift.recipient_id,
      gift_id: gift.id,
      type: 'reminder',
      title: 'You have a TimeGift waiting',
      message: copy,
      sent_via: 'in_app',
    });
    sent++;
  }

  return NextResponse.json({
    success: true,
    scheduledCount: scheduled?.length || 0,
    stalePendingCount: stalePending?.length || 0,
    notificationsSent: sent,
  });
}

export async function GET(request: Request) { return run(request); }
export async function POST(request: Request) { return run(request); }
