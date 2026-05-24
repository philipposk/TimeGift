import { getSupabaseServiceClient } from '@/lib/supabase';
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
  claimUrl?: string | null;
}

async function loadSettings() {
  const admin = getSupabaseServiceClient();
  const { data, error } = await admin
    .from('admin_settings')
    .select('setting_key, setting_value');

  if (error) throw error;

  return (data || []).reduce<Record<string, JsonRecord>>(
    (acc, current) => ({
      ...acc,
      [current.setting_key]: current.setting_value as JsonRecord,
    }),
    {}
  );
}

export async function notifyGiftCreated(context: NotificationContext) {
  const admin = getSupabaseServiceClient();
  const settings = await loadSettings();

  const notificationPrefs = (settings.notifications as JsonRecord) || {};
  const vonageConfig = (settings.vonage_api as JsonRecord) || {};
  const whatsappConfig = (settings.whatsapp_api as JsonRecord) || {};

  const channels: string[] = Array.isArray(notificationPrefs.channels)
    ? notificationPrefs.channels
    : ['in_app', 'sms'];

  const notificationTitle = 'You received a new TimeGift';
  const notificationBody = context.message;
  const claimSnippet = context.claimUrl ? ` Claim: ${context.claimUrl}` : '';

  if (context.recipientId) {
    await admin.from('notifications').insert({
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
      `${context.senderName || 'Someone special'} sent you a TimeGift: "${context.message}".${claimSnippet}`,
      vonageConfig?.api_key,
      vonageConfig?.api_secret,
      vonageConfig?.from_number || 'TimeGift'
    );
  }

  if (channels.includes('whatsapp') && context.recipientPhone) {
    await sendWhatsAppNotification(
      context.recipientPhone,
      `${context.senderName || 'Someone special'} sent you a TimeGift.${claimSnippet}`,
      whatsappConfig?.api_key,
      whatsappConfig?.api_secret || vonageConfig?.api_secret,
      whatsappConfig?.from_number || vonageConfig?.whatsapp_number
    );
  }
}

export async function notifyGiftAccepted(
  context: NotificationContext & { scheduledDate?: string | null }
) {
  const admin = getSupabaseServiceClient();
  const formattedDate = context.scheduledDate
    ? new Date(context.scheduledDate).toLocaleString()
    : null;

  await admin.from('notifications').insert({
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
