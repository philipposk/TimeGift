'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/utils/auth';
import Navbar from '@/components/navbar';
import FriendsClient from '@/components/friends-client';
import { doc, getDoc, collection, query, where, getDocs, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
        
        // Guest mode - allow viewing
        if (!currentUser) {
          setUser(null);
          setProfile(null);
          setFriendships([]);
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // Get user profile
        if (!db) {
          setProfile(null);
          setFriendships([]);
          return;
        }

        const profileDoc = await getDoc(doc(db, 'users', currentUser.id));
        const profileData = profileDoc.exists() ? { id: profileDoc.id, ...profileDoc.data() } : null;
        setProfile(profileData);

        // Get friendships (both where user is user_id or friend_id)
        const friendshipsAsUser = query(
          collection(db, 'friendships'),
          where('user_id', '==', currentUser.id)
        );
        const friendshipsAsFriend = query(
          collection(db, 'friendships'),
          where('friend_id', '==', currentUser.id)
        );

        const [userSnapshot, friendSnapshot] = await Promise.all([
          getDocs(friendshipsAsUser),
          getDocs(friendshipsAsFriend),
        ]);

        const allFriendships: any[] = [];

        // Process friendships where current user is user_id
        for (const docSnap of userSnapshot.docs) {
          const data = docSnap.data();
          const friendDoc = await getDoc(doc(db, 'users', data.friend_id));
          allFriendships.push({
            id: docSnap.id,
            ...data,
            friend: friendDoc.exists() ? { id: friendDoc.id, ...friendDoc.data() } : null,
          });
        }

        // Process friendships where current user is friend_id
        for (const docSnap of friendSnapshot.docs) {
          const data = docSnap.data();
          const userDoc = await getDoc(doc(db, 'users', data.user_id));
          allFriendships.push({
            id: docSnap.id,
            ...data,
            user: userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null,
          });
        }

        setFriendships(allFriendships);
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
