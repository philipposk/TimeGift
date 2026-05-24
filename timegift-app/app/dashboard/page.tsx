'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase';
import Navbar from '@/components/navbar';
import DashboardClient from '@/components/dashboard-client';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [sentGifts, setSentGifts] = useState<any[]>([]);
  const [receivedGifts, setReceivedGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          setUser(null);
          setProfile(null);
          setSentGifts([]);
          setReceivedGifts([]);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        const supabase = getSupabaseBrowserClient();

        const [{ data: profileData }, { data: sent }, { data: received }] = await Promise.all([
          supabase.from('users').select('*').eq('id', currentUser.id).single(),
          supabase
            .from('gifts')
            .select('*')
            .eq('sender_id', currentUser.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('gifts')
            .select('*')
            .eq('recipient_id', currentUser.id)
            .order('created_at', { ascending: false }),
        ]);

        setProfile(profileData);
        setSentGifts(sent || []);
        setReceivedGifts(received || []);
      } catch (error) {
        console.error('Error loading dashboard:', error);
        setUser(null);
        setProfile(null);
        setSentGifts([]);
        setReceivedGifts([]);
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
    displayName: profile?.display_name,
    avatarUrl: profile?.avatar_url,
    isAdmin: profile?.is_admin,
  } : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar user={userData} />
      <DashboardClient
        profile={profile}
        sentGifts={sentGifts}
        receivedGifts={receivedGifts}
        isGuest={!user}
      />
    </div>
  );
}
