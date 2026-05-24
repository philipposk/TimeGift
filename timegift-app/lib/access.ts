import { getSupabaseServiceClient } from '@/lib/supabase';

// Are these two users friends (status='accepted', either direction)?
export async function areFriends(userA: string, userB: string): Promise<boolean> {
  if (!userA || !userB || userA === userB) return false;
  const admin = getSupabaseServiceClient();
  const { count } = await admin
    .from('friendships')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'accepted')
    .or(
      `and(user_id.eq.${userA},friend_id.eq.${userB}),and(user_id.eq.${userB},friend_id.eq.${userA})`
    );
  return (count ?? 0) > 0;
}

// Is recipient blocking sender? Check both user-id and email/phone matches.
export async function isBlocked(args: {
  senderId: string;
  recipientId?: string | null;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
}): Promise<boolean> {
  const admin = getSupabaseServiceClient();

  // Block by recipient -> sender's user id.
  if (args.recipientId) {
    const { count } = await admin
      .from('blocks')
      .select('*', { count: 'exact', head: true })
      .eq('blocker_id', args.recipientId)
      .eq('blocked_user_id', args.senderId);
    if ((count ?? 0) > 0) return true;
  }

  // Block by email/phone (recipient not yet a user, but they previously
  // registered a block while signed in).
  const { data: sender } = await admin
    .from('users')
    .select('email, phone')
    .eq('id', args.senderId)
    .single();

  if (sender?.email) {
    const { count } = await admin
      .from('blocks')
      .select('*', { count: 'exact', head: true })
      .eq('blocked_email', sender.email);
    if ((count ?? 0) > 0) return true;
  }
  if (sender?.phone) {
    const { count } = await admin
      .from('blocks')
      .select('*', { count: 'exact', head: true })
      .eq('blocked_phone', sender.phone);
    if ((count ?? 0) > 0) return true;
  }

  return false;
}

// Can sender send a gift to this recipient given their privacy + stranger
// settings?
// - public: anyone can send
// - friends: must be friends
// - closed: only self (so always no for others)
// - accept_stranger_gifts overrides to allow strangers on any setting
export async function canReceiveGift(args: {
  senderId: string;
  recipientId?: string | null;
}): Promise<{ allowed: boolean; reason?: string }> {
  if (!args.recipientId) {
    // No recipient_id => not a registered user yet. Always allowed (claim flow).
    return { allowed: true };
  }
  if (args.recipientId === args.senderId) {
    return { allowed: false, reason: 'Cannot send a gift to yourself' };
  }

  const admin = getSupabaseServiceClient();
  const { data: recipient } = await admin
    .from('users')
    .select('privacy_level, accept_stranger_gifts')
    .eq('id', args.recipientId)
    .single();

  if (!recipient) return { allowed: false, reason: 'Recipient not found' };

  if (recipient.accept_stranger_gifts) return { allowed: true };

  if (recipient.privacy_level === 'public') return { allowed: true };

  if (recipient.privacy_level === 'closed') {
    return { allowed: false, reason: 'Recipient is not accepting gifts' };
  }

  // friends
  const friends = await areFriends(args.senderId, args.recipientId);
  if (!friends) {
    return { allowed: false, reason: 'Recipient only accepts gifts from friends' };
  }

  return { allowed: true };
}
