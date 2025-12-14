import { supabaseAdmin } from '@/lib/supabase';
import { sendSMSNotification } from './vonage';
import { sendWhatsAppNotification } from './whatsapp';

type JsonRecord = Record<string, any> | null;

interface NotificationContext {
  giftId: string;
  recipientId?: string | null;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  senderId: string;
  senderName?: string | null;
  message: string;
}

async function loadSettings() {
  const { data, error } = await supabaseAdmin
    .from('admin_settings')
    .select('setting_key, setting_value');

  if (error) {
    throw error;
  }

  return (data || []).reduce<Record<string, JsonRecord>>(
    (acc, current) => ({
      ...acc,
      [current.setting_key]: current.setting_value as JsonRecord,
    }),
    {}
  );
}

export async function notifyGiftCreated(context: NotificationContext) {
  const settings = await loadSettings();

  const notificationPrefs = (settings.notifications as JsonRecord) || {};
  const vonageConfig = (settings.vonage_api as JsonRecord) || {};
  const whatsappConfig = (settings.whatsapp_api as JsonRecord) || {};

  const channels: string[] = Array.isArray(notificationPrefs.channels)
    ? notificationPrefs.channels
    : ['in_app', 'sms'];

  const reminderCopy: string[] = Array.isArray(notificationPrefs.reminder_messages)
    ? notificationPrefs.reminder_messages
    : [
        'You have been summoned!',
        'Time to be redeemed!',
        'Someone awaits your gift of time!',
      ];

  const notificationTitle = 'You received a new TimeGift';
  const notificationBody = context.message;

  if (context.recipientId) {
    await supabaseAdmin.from('notifications').insert({
      user_id: context.recipientId,
      gift_id: context.giftId,
      type: 'gift_received',
      title: notificationTitle,
      message: notificationBody,
      sent_via: 'in_app',
    });
  }

  if (channels.includes('sms') && context.recipientPhone) {
    await sendSMSNotification(
      context.recipientPhone,
      `${context.senderName || 'Someone special'} says: ${context.message}`,
      vonageConfig?.api_key,
      vonageConfig?.api_secret,
      vonageConfig?.from_number || 'TimeGift'
    );
  }

  if (channels.includes('whatsapp') && context.recipientPhone) {
    await sendWhatsAppNotification(
      context.recipientPhone,
      `${context.senderName || 'Someone special'} sent you a TimeGift 🤍`,
      whatsappConfig?.api_key,
      whatsappConfig?.api_secret || vonageConfig?.api_secret,
      whatsappConfig?.from_number || vonageConfig?.whatsapp_number
    );
  }

  // Schedule reminder notifications by inserting placeholder entries
  if (context.recipientId && reminderCopy.length > 0) {
    await supabaseAdmin.from('notifications').insert({
      user_id: context.senderId,
      gift_id: context.giftId,
      type: 'reminder',
      title: 'Reminder scheduled',
      message: `We will remind you with messages such as "${reminderCopy[0]}" until your gift is accepted.`,
      sent_via: 'in_app',
    });
  }
}

export async function notifyGiftAccepted(
  context: NotificationContext & { scheduledDate?: string | null }
) {
  const formattedDate = context.scheduledDate
    ? new Date(context.scheduledDate).toLocaleString()
    : null;

  await supabaseAdmin.from('notifications').insert({
    user_id: context.senderId,
    gift_id: context.giftId,
    type: 'gift_accepted',
    title: 'Your TimeGift was accepted!',
    message: formattedDate
      ? `Scheduled for ${formattedDate}.`
      : 'The recipient accepted your gift.',
    sent_via: 'in_app',
  });
}

