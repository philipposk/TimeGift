'use client';

import { useEffect } from 'react';

// Registers the service worker as soon as the app boots. Idempotent across
// page navigations - the browser deduplicates.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (window.location.hostname === 'localhost' && process.env.NODE_ENV !== 'production') {
      // Don't register in dev unless explicitly testing PWA.
      return;
    }
    navigator.serviceWorker.register('/sw.js').catch((e) => {
      console.warn('SW register failed:', e);
    });
  }, []);
  return null;
}
