'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/utils/auth';

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    signOut()
      .catch((e) => console.error('Sign out error:', e))
      .finally(() => router.push('/'));
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="serif italic muted" style={{ fontSize: 22 }}>Signing you out…</div>
    </div>
  );
}
