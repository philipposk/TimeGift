import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getSupabaseServiceClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/friends/search?q=foo
// Searches public/friends-visible users by username or display name. Excludes
// the current user, anyone the user has blocked, and 'closed' profiles unless
// already friends.
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const q = (new URL(request.url).searchParams.get('q') || '').trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const admin = getSupabaseServiceClient();
  const { data: hits } = await admin
    .from('users')
    .select('id, username, display_name, avatar_url, privacy_level')
    .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
    .neq('id', user.id)
    .limit(20);

  if (!hits || hits.length === 0) return NextResponse.json({ results: [] });

  // Filter out blocked (in either direction).
  const otherIds = hits.map((h) => h.id);
  const { data: blocks } = await admin
    .from('blocks')
    .select('blocker_id, blocked_user_id')
    .or(`blocker_id.eq.${user.id},blocked_user_id.eq.${user.id}`)
    .in('blocked_user_id', otherIds);

  const blocked = new Set<string>();
  for (const b of blocks || []) {
    if (b.blocker_id === user.id) blocked.add(b.blocked_user_id);
    else if (b.blocked_user_id === user.id) blocked.add(b.blocker_id);
  }

  // Filter out closed profiles that aren't already friends.
  const closedIds = hits.filter((h) => h.privacy_level === 'closed').map((h) => h.id);
  let friendIds = new Set<string>();
  if (closedIds.length > 0) {
    const { data: friends } = await admin
      .from('friendships')
      .select('user_id, friend_id')
      .eq('status', 'accepted')
      .or(
        `and(user_id.eq.${user.id},friend_id.in.(${closedIds.join(',')})),and(friend_id.eq.${user.id},user_id.in.(${closedIds.join(',')}))`
      );
    for (const f of friends || []) {
      friendIds.add(f.user_id === user.id ? f.friend_id : f.user_id);
    }
  }

  const filtered = hits
    .filter((h) => !blocked.has(h.id))
    .filter((h) => h.privacy_level !== 'closed' || friendIds.has(h.id))
    .map(({ privacy_level, ...rest }) => rest);

  return NextResponse.json({ results: filtered });
}
