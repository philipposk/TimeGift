import webpush, { PushSubscription as WebPushSubscription } from 'web-push';
import { getSupabaseServiceClient } from '@/lib/supabase';

let configured = false;
function ensureConfigured() {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:hello@timegift.fly.dev';
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

// Send a push to every subscription for one user. Auto-prunes subscriptions
// returning HTTP 404/410 (subscription expired).
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!ensureConfigured()) return 0;
  const admin = getSupabaseServiceClient();
  const { data: subs } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);
  if (!subs || subs.length === 0) return 0;

  let sent = 0;
  for (const s of subs) {
    const sub: WebPushSubscription = {
      endpoint: s.endpoint,
      keys: { p256dh: s.p256dh, auth: s.auth },
    };
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload));
      sent++;
    } catch (err: any) {
      const status = err?.statusCode;
      if (status === 404 || status === 410) {
        await admin.from('push_subscriptions').delete().eq('id', s.id);
      } else {
        console.error('Push send failed:', err?.message || err);
      }
    }
  }
  return sent;
}
