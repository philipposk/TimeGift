'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/utils/auth';
import { Gift } from 'lucide-react';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await signOut();
        router.push('/');
      } catch (error) {
        console.error('Error signing out:', error);
        router.push('/');
      }
    };

    handleSignOut();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="text-center">
        <Gift className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Signing you out...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Thanks for using TimeGift!
        </p>
      </div>
    </div>
  );
}
