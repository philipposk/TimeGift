/* Timegift service worker
 * - handles push notifications
 * - basic offline fallback for the app shell
 */

const CACHE = 'tg-shell-v1';
const SHELL = ['/'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for API + nav; cache fallback for the shell only.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.url.includes('/api/')) return;
  event.respondWith(
    fetch(req).catch(() => caches.match(req).then((r) => r || caches.match('/')))
  );
});

self.addEventListener('push', (event) => {
  let payload = { title: 'Timegift', body: 'You have a new update.', url: '/dashboard' };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch (e) {
    // fall back to defaults
  }
  const options = {
    body: payload.body,
    icon: '/icon',
    badge: '/icon',
    data: { url: payload.url || '/dashboard' },
    tag: payload.tag || undefined,
    renotify: !!payload.tag,
  };
  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((all) => {
      for (const c of all) {
        if ('focus' in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
