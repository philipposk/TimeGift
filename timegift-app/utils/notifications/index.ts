import { getSupabaseServiceClient } from '@/lib/supabase';
import { sendSMSNotification } from './vonage';
import { sendWhatsAppNotification } from './whatsapp';
import { sendEmail, buildIcs, APP_URL } from '@/lib/mailer';
import { sendPushToUser } from '@/lib/push';
import GiftReceivedEmail from '@/emails/gift-received';
import GiftAcceptedEmail from '@/emails/gift-accepted';
import { formatDuration } from '@/lib/time-format';

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
  amountMinutes?: number;
  purpose?: string | null;
}

async function loadSettings() {
  const admin = getSupabaseServiceClient();
  const { data, error } = await admin
    .from('admin_settings')
    .select('setting_key, setting_value');
  if (error) throw error;
  return (data || []).reduce<Record<string, JsonRecord>>(
    (acc, current) => ({ ...acc, [current.setting_key]: current.setting_value as JsonRecord }),
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
    : ['in_app', 'sms', 'email'];

  const amountLabel = context.amountMinutes
    ? formatDuration(context.amountMinutes)
    : '';
  const purpose = context.purpose || 'anything you want';
  const senderName = context.senderName || 'Someone special';

  // In-app
  if (context.recipientId) {
    await admin.from('notifications').insert({
      user_id: context.recipientId,
      gift_id: context.giftId,
      type: 'gift_received',
      title: 'You received a new TimeGift',
      message: context.message,
      sent_via: 'in_app',
    });
    // Push
    await sendPushToUser(context.recipientId, {
      title: `${senderName} sent you a TimeGift`,
      body: amountLabel ? `${amountLabel} - "${context.message.slice(0, 90)}"` : context.message.slice(0, 120),
      url: `/gifts/${context.giftId}`,
      tag: `gift:${context.giftId}`,
    });
  }

  // Email
  if (channels.includes('email') && context.recipientEmail) {
    const claimUrl = context.claimUrl || `${APP_URL}/gifts/${context.giftId}`;
    await sendEmail({
      to: context.recipientEmail,
      subject: `${senderName} sent you a TimeGift`,
      template: GiftReceivedEmail({
        senderName,
        amountLabel,
        purpose,
        message: context.message,
        claimUrl,
      }),
    });
  }

  // SMS
  if (channels.includes('sms') && context.recipientPhone) {
    const claimSnippet = context.claimUrl ? ` Claim: ${context.claimUrl}` : '';
    await sendSMSNotification(
      context.recipientPhone,
      `${senderName} sent you a TimeGift: "${context.message.slice(0, 90)}".${claimSnippet}`,
      vonageConfig?.api_key,
      vonageConfig?.api_secret,
      vonageConfig?.from_number || 'TimeGift'
    );
  }

  if (channels.includes('whatsapp') && context.recipientPhone) {
    const claimSnippet = context.claimUrl ? ` ${context.claimUrl}` : '';
    await sendWhatsAppNotification(
      context.recipientPhone,
      `${senderName} sent you a TimeGift.${claimSnippet}`,
      whatsappConfig?.api_key,
      whatsappConfig?.api_secret || vonageConfig?.api_secret,
      whatsappConfig?.from_number || vonageConfig?.whatsapp_number
    );
  }
}

export async function notifyGiftAccepted(
  context: NotificationContext & {
    scheduledDate?: string | null;
    recipientName?: string | null;
  }
) {
  const admin = getSupabaseServiceClient();
  const formattedDate = context.scheduledDate
    ? new Date(context.scheduledDate).toLocaleString()
    : null;

  // In-app
  await admin.from('notifications').insert({
    user_id: context.senderId,
    gift_id: context.giftId,
    type: 'gift_accepted',
    title: 'Your TimeGift was accepted!',
    message: formattedDate ? `Scheduled for ${formattedDate}.` : 'The recipient accepted your gift.',
    sent_via: 'in_app',
  });

  // Push
  await sendPushToUser(context.senderId, {
    title: 'TimeGift accepted',
    body: formattedDate ? `Scheduled for ${formattedDate}.` : 'The recipient accepted your gift.',
    url: `/gifts/${context.giftId}`,
    tag: `gift:${context.giftId}:accept`,
  });

  // Email + .ics
  const { data: sender } = await admin
    .from('users')
    .select('email, display_name, username')
    .eq('id', context.senderId)
    .single();

  if (sender?.email) {
    const giftUrl = `${APP_URL}/gifts/${context.giftId}`;
    const attachments: { filename: string; content: string }[] = [];
    if (context.scheduledDate && context.amountMinutes) {
      const ics = buildIcs({
        uid: context.giftId,
        start: new Date(context.scheduledDate),
        durationMinutes: context.amountMinutes,
        title: `TimeGift with ${context.recipientName || 'your friend'}`,
        description: context.message,
        organizerEmail: sender.email,
        organizerName: sender.display_name || sender.username || 'Timegift',
        attendees: context.recipientEmail ? [{ email: context.recipientEmail, name: context.recipientName || undefined }] : undefined,
        url: giftUrl,
      });
      attachments.push({ filename: 'timegift.ics', content: ics });
    }
    await sendEmail({
      to: sender.email,
      subject: 'Your TimeGift was accepted',
      template: GiftAcceptedEmail({
        recipientName: context.recipientName || 'Your recipient',
        amountLabel: context.amountMinutes ? formatDuration(context.amountMinutes) : '',
        scheduledDateLabel: formattedDate,
        giftUrl,
      }),
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  }
}
