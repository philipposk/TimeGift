'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import Navbar from '@/components/navbar';
import AdminPanelClient from '@/components/admin-panel-client';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/auth/signin');
          return;
        }

        setUser(currentUser);

        // Get user profile
        const profileDoc = await getDoc(doc(db, 'users', currentUser.id));
        const profileData = profileDoc.exists() ? { id: profileDoc.id, ...profileDoc.data() } : null;
        setProfile(profileData);

        if (!profileData?.is_admin) {
          router.push('/dashboard');
          return;
        }

        // Get admin settings
        const settingsQuery = query(collection(db, 'admin_settings'), orderBy('setting_key'));
        const settingsSnapshot = await getDocs(settingsQuery);
        const settingsData = settingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading admin page:', error);
        router.push('/auth/signin');
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

  if (!user || !profile?.is_admin) {
    return null;
  }

  const userData = {
    id: user.id,
    username: profile?.username,
    isAdmin: profile?.is_admin,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <Navbar user={userData} />
      <AdminPanelClient settings={settings} />
    </div>
  );
}
