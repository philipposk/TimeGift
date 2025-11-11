import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import Navbar from '@/components/navbar';
import FriendsClient from '@/components/friends-client';

export default async function FriendsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get friendships
  const { data: friendships } = await supabase
    .from('friendships')
    .select(`
      *,
      friend:friend_id(id, username, display_name, avatar_url, privacy_level),
      user:user_id(id, username, display_name, avatar_url, privacy_level)
    `)
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  const userData = {
    id: user.id,
    username: profile?.username,
    isAdmin: profile?.is_admin,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar user={userData} />
      <FriendsClient userId={user.id} friendships={friendships || []} />
    </div>
  );
}
