'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from './icon';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  gift_id: string | null;
  created_at: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch('/api/notifications?limit=15');
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.notifications || []);
      setUnread(data.unreadCount ?? 0);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, []);

  // Click outside to close.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    });
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="row gap-2"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--muted)',
          padding: 4,
          position: 'relative',
        }}
        aria-label="Notifications"
      >
        <Icon name="bell" size={18} />
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              right: -2,
              minWidth: 16,
              height: 16,
              padding: '0 4px',
              background: 'var(--accent)',
              color: '#fdf8ed',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 14px)',
            right: 0,
            width: 360,
            maxHeight: 480,
            overflowY: 'auto',
            background: '#fbf7ee',
            border: '1px solid var(--hairline)',
            borderRadius: 6,
            boxShadow: '0 12px 32px -16px rgba(60,40,20,0.3)',
            zIndex: 100,
          }}
        >
          <div className="row between" style={{ padding: '14px 16px', borderBottom: '1px solid var(--hairline-soft)' }}>
            <span className="eyebrow">Notifications</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="btn-quiet" style={{ fontSize: 12 }}>
                Mark all read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="center" style={{ padding: 32 }}>
              <div className="serif italic muted" style={{ fontSize: 16 }}>Nothing new.</div>
            </div>
          ) : (
            items.map((n) => (
              <Link
                key={n.id}
                href={n.gift_id ? `/gifts/${n.gift_id}` : '/dashboard'}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--hairline-soft)',
                  background: n.is_read ? 'transparent' : 'rgba(168,80,30,0.04)',
                }}
              >
                <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
                  {!n.is_read && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <div style={{ flex: 1, marginLeft: n.is_read ? 14 : 0 }}>
                    <div className="serif" style={{ fontSize: 15, color: 'var(--ink)' }}>{n.title}</div>
                    <div className="meta" style={{ marginTop: 2 }}>{n.message}</div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
