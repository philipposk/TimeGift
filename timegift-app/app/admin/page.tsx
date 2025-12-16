'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import Navbar from '@/components/navbar';
import AdminPanelClient from '@/components/admin-panel-client';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

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

        // Guest mode or non-admin - show message
        if (!profileData?.is_admin) {
          setUser(null);
          setProfile(null);
          setSettings([]);
          setLoading(false);
          return;
        }

        // Get admin settings
        if (!db) {
          setSettings([]);
          return;
        }
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

  // Show guest/non-admin message
  if (!user || !profile?.is_admin) {
    const userData = user ? {
      id: user.id,
      username: profile?.username,
      isAdmin: false,
    } : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <Navbar user={userData} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Admin Access Required
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              {!user 
                ? "Please sign in to access the admin panel."
                : "You need admin privileges to access this page."}
            </p>
            {!user ? (
              <Link
                href="/auth/signin"
                className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                Sign In
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-block px-8 py-4 text-lg font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    );
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
