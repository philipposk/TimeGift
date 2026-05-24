'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/navbar';
import FriendsClient from '@/components/friends-client';

export default function FriendsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [friendships, setFriendships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          setUser(null);
          setProfile(null);
          setFriendships([]);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        const supabase = getSupabaseBrowserClient();

        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        setProfile(profileData);

        // Pull friendships in both directions with the related user joined.
        const [{ data: asUser }, { data: asFriend }] = await Promise.all([
          supabase
            .from('friendships')
            .select('*, friend:users!friendships_friend_id_fkey(*)')
            .eq('user_id', currentUser.id),
          supabase
            .from('friendships')
            .select('*, user:users!friendships_user_id_fkey(*)')
            .eq('friend_id', currentUser.id),
        ]);

        setFriendships([...(asUser || []), ...(asFriend || [])]);
      } catch (error) {
        console.error('Error loading friends:', error);
        setUser(null);
        setProfile(null);
        setFriendships([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const userData = user ? {
    id: user.id,
    username: profile?.username,
    isAdmin: profile?.is_admin,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar user={userData} />
      <FriendsClient userId={user?.id || null} friendships={friendships} isGuest={!user} />
    </div>
  );
}
