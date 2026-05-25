'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from '@/utils/auth';
import { Brand } from './brand';
import { Avatar } from './avatar';
import { NotificationBell } from './notification-bell';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Ledger' },
  { href: '/create', label: 'Write' },
  { href: '/memories', label: 'Memories' },
  { href: '/friends', label: 'Friends' },
];

export function TopNav() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getCurrentUser().then((u) => setUser(u || null)).catch(() => setUser(null));
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
    } finally {
      setUser(null);
      router.push('/');
    }
  }

  return (
    <div
      style={{
        borderBottom: '1px solid var(--hairline-soft)',
        background: 'rgba(244, 239, 230, 0.85)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="nav">
        <Brand />
        <div className="nav-links">
          {NAV_ITEMS.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + '/');
            return (
              <Link key={n.href} href={n.href} className={'nav-link ' + (active ? 'active' : '')}>
                {n.label}
              </Link>
            );
          })}
          <span style={{ width: 1, height: 16, background: 'var(--hairline)' }} />
          {user ? (
            <>
              <NotificationBell />
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="row gap-3"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <span className="meta">{user.displayName || user.username || 'Me'}</span>
                  <Avatar name={user.displayName || user.username} size="sm" url={user.avatarUrl} />
                </button>
                {menuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 14px)',
                      right: 0,
                      width: 200,
                      background: '#fbf7ee',
                      border: '1px solid var(--hairline)',
                      borderRadius: 6,
                      boxShadow: '0 12px 32px -16px rgba(60,40,20,0.3)',
                      zIndex: 100,
                    }}
                  >
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--hairline-soft)' }}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/analytics"
                      onClick={() => setMenuOpen(false)}
                      style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--hairline-soft)' }}
                    >
                      Analytics
                    </Link>
                    {user.isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        style={{ display: 'block', padding: '12px 16px', borderBottom: '1px solid var(--hairline-soft)' }}
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--sans)',
                        fontSize: 14,
                        color: 'var(--ink)',
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="nav-link">Sign in</Link>
              <Link href="/auth/signup" className="btn" style={{ padding: '8px 14px', fontSize: 13 }}>
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
