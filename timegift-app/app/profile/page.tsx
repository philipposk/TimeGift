'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import Navbar from '@/components/navbar';
import ProfileClient from '@/components/profile-client';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        
        // Guest mode - allow viewing
        if (!currentUser) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // Get user profile
        try {
          if (!db) {
            setProfile(null);
            return;
          }
          const profileDoc = await getDoc(doc(db, 'users', currentUser.id));
          const profileData = profileDoc.exists() ? { id: profileDoc.id, ...profileDoc.data() } : null;
          setProfile(profileData);
        } catch (dbError) {
          console.log('Database not configured, showing guest mode');
          setProfile(null);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setUser(null);
        setProfile(null);
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
      <ProfileClient user={userData} profile={profile} isGuest={!user} />
    </div>
  );
}
