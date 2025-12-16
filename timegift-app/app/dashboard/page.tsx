'use client';

// Note: Server-side auth with Firebase requires token verification
// For now, we'll handle auth client-side
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import Navbar from '@/components/navbar';
import DashboardClient from '@/components/dashboard-client';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';

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
        
        // Guest mode - allow viewing without auth
        if (!currentUser) {
          setUser(null);
          setProfile(null);
          setSentGifts([]);
          setReceivedGifts([]);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // Get user profile
        try {
          if (!db) {
            // Firebase not configured
            setProfile(null);
            setSentGifts([]);
            setReceivedGifts([]);
            return;
          }

          const profileDoc = await getDoc(doc(db, 'users', currentUser.id));
          const profileData = profileDoc.exists() ? { id: profileDoc.id, ...profileDoc.data() } : null;
          setProfile(profileData);

          // Get sent gifts
          const sentGiftsQuery = query(
            collection(db, 'gifts'),
            where('sender_id', '==', currentUser.id),
            orderBy('created_at', 'desc')
          );
          const sentSnapshot = await getDocs(sentGiftsQuery);
          const sent = sentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setSentGifts(sent);

          // Get received gifts
          const receivedGiftsQuery = query(
            collection(db, 'gifts'),
            where('recipient_id', '==', currentUser.id),
            orderBy('created_at', 'desc')
          );
          const receivedSnapshot = await getDocs(receivedGiftsQuery);
          const received = receivedSnapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data };
          });
          setReceivedGifts(received);
        } catch (dbError) {
          // If Firebase not configured, just show empty state
          console.log('Database not configured, showing guest mode');
          setProfile(null);
          setSentGifts([]);
          setReceivedGifts([]);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        // Don't redirect, just show guest mode
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
