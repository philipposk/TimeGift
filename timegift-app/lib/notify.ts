import { getSupabaseServiceClient } from '@/lib/supabase';

type NotificationType =
  | 'gift_received'
  | 'gift_accepted'
  | 'gift_scheduled'
  | 'gift_declined'
  | 'gift_cancelled'
  | 'gift_completed'
  | 'gift_decay_warning'
  | 'reminder'
  | 'friend_request'
  | 'friend_accepted'
  | 'system';

export async function insertNotification(args: {
  userId: string;
  giftId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  sentVia?: 'in_app' | 'email' | 'sms' | 'whatsapp' | 'viber' | 'messenger';
}): Promise<void> {
  const admin = getSupabaseServiceClient();
  await admin.from('notifications').insert({
    user_id: args.userId,
    gift_id: args.giftId ?? null,
    type: args.type,
    title: args.title,
    message: args.message,
    sent_via: args.sentVia ?? 'in_app',
  });
}
