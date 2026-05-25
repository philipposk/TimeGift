'use client';

import { useEffect, useState } from 'react';
import { Icon } from './icon';

// Small, dismissable banner that asks for push permission once the user is
// signed in. Disappears on permission granted, denied, or manual dismiss.

const DISMISS_KEY = 'tg.push.dismissed';

export function PushPrompt() {
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    if (localStorage.getItem(DISMISS_KEY) === '1') return;
    setShow(true);
  }, []);

  async function enable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setShow(false);
        localStorage.setItem(DISMISS_KEY, '1');
        return;
      }
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        console.warn('NEXT_PUBLIC_VAPID_PUBLIC_KEY missing - push subscribe skipped');
        setShow(false);
        return;
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const json: any = sub.toJSON();
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
          userAgent: navigator.userAgent,
        }),
      });
      setShow(false);
    } catch (e) {
      console.error('Push enable failed:', e);
    } finally {
      setBusy(false);
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        maxWidth: 340,
        background: '#fbf7ee',
        border: '1px solid var(--hairline)',
        borderRadius: 6,
        padding: 16,
        boxShadow: '0 14px 28px -16px rgba(60,40,20,0.35)',
        zIndex: 60,
      }}
    >
      <div className="row gap-3" style={{ alignItems: 'flex-start' }}>
        <Icon name="bell" size={18} />
        <div style={{ flex: 1 }}>
          <div className="serif" style={{ fontSize: 16, marginBottom: 4 }}>
            Get a nudge for your gifts.
          </div>
          <div className="meta" style={{ fontSize: 12.5 }}>
            We&apos;ll quietly remind you the day before something is scheduled. Nothing else.
          </div>
        </div>
      </div>
      <div className="row gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
        <button className="btn-quiet" onClick={dismiss} style={{ fontSize: 12.5 }}>
          Not now
        </button>
        <button className="btn" style={{ fontSize: 12.5, padding: '8px 14px' }} onClick={enable} disabled={busy}>
          {busy ? 'Working…' : 'Enable'}
        </button>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
