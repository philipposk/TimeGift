import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';
import { insertNotification } from '@/lib/notify';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET: list friendships (both directions) with the related user joined.
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [{ data: asUser }, { data: asFriend }] = await Promise.all([
    supabase
      .from('friendships')
      .select('*, friend:users!friendships_friend_id_fkey(id, username, display_name, avatar_url)')
      .eq('user_id', user.id),
    supabase
      .from('friendships')
      .select('*, user:users!friendships_user_id_fkey(id, username, display_name, avatar_url)')
      .eq('friend_id', user.id),
  ]);

  return NextResponse.json({
    friendships: [...(asUser || []), ...(asFriend || [])],
  });
}

interface CreatePayload {
  friendUsername?: string;
  friendUserId?: string;
}

// POST: send a friend request. Identify the friend by username or id.
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = (await request.json()) as CreatePayload;
  if (!payload.friendUsername && !payload.friendUserId) {
    return NextResponse.json(
      { error: 'friendUsername or friendUserId required' },
      { status: 400 }
    );
  }

  const admin = getSupabaseServiceClient();
  let friend;
  if (payload.friendUserId) {
    const { data } = await admin
      .from('users')
      .select('id, username, display_name')
      .eq('id', payload.friendUserId)
      .maybeSingle();
    friend = data;
  } else {
    const { data } = await admin
      .from('users')
      .select('id, username, display_name')
      .eq('username', payload.friendUsername!)
      .maybeSingle();
    friend = data;
  }

  if (!friend) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (friend.id === user.id) {
    return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 });
  }

  // If a friendship row exists in either direction, surface its state.
  const { data: existing } = await admin
    .from('friendships')
    .select('id, user_id, friend_id, status')
    .or(
      `and(user_id.eq.${user.id},friend_id.eq.${friend.id}),and(user_id.eq.${friend.id},friend_id.eq.${user.id})`
    )
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, friendship: existing, alreadyExisted: true });
  }

  // Create the request. The friend can accept it via PATCH below.
  const { data: created, error } = await supabase
    .from('friendships')
    .insert({ user_id: user.id, friend_id: friend.id, status: 'pending' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: requester } = await admin
    .from('users')
    .select('display_name, username')
    .eq('id', user.id)
    .single();

  await insertNotification({
    userId: friend.id,
    type: 'friend_request',
    title: 'New friend request',
    message: `${requester?.display_name || requester?.username || 'Someone'} wants to be friends.`,
  });

  return NextResponse.json({ success: true, friendship: created });
}

interface PatchPayload {
  friendshipId: string;
  action: 'accept' | 'reject' | 'block';
}

// PATCH: respond to a friend request (accept/reject) or block.
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload = (await request.json()) as PatchPayload;
  if (!payload?.friendshipId || !['accept', 'reject', 'block'].includes(payload.action)) {
    return NextResponse.json({ error: 'friendshipId + action required' }, { status: 400 });
  }

  const admin = getSupabaseServiceClient();
  const { data: row } = await admin
    .from('friendships')
    .select('*')
    .eq('id', payload.friendshipId)
    .single();
  if (!row) return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });

  // Only the friend (receiver of the pending request) can accept/reject.
  // Either party can block.
  if (payload.action === 'accept' || payload.action === 'reject') {
    if (row.friend_id !== user.id) {
      return NextResponse.json({ error: 'Only the request recipient can respond' }, { status: 403 });
    }
    if (row.status !== 'pending') {
      return NextResponse.json({ error: `Cannot ${payload.action} from status ${row.status}` }, { status: 400 });
    }

    if (payload.action === 'accept') {
      await admin.from('friendships').update({ status: 'accepted' }).eq('id', row.id);
      await insertNotification({
        userId: row.user_id,
        type: 'friend_accepted',
        title: 'Friend request accepted',
        message: 'You are now friends.',
      });
    } else {
      await admin.from('friendships').delete().eq('id', row.id);
    }
  } else {
    // block
    if (row.user_id !== user.id && row.friend_id !== user.id) {
      return NextResponse.json({ error: 'Not your friendship' }, { status: 403 });
    }
    const other = row.user_id === user.id ? row.friend_id : row.user_id;
    await admin.from('friendships').update({ status: 'blocked' }).eq('id', row.id);
    await admin
      .from('blocks')
      .upsert(
        { blocker_id: user.id, blocked_user_id: other, reason: 'friendship-blocked' },
        { onConflict: 'blocker_id,blocked_user_id', ignoreDuplicates: true }
      );
  }

  return NextResponse.json({ success: true });
}
