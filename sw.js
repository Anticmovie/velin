// VELÍN Chat — service worker (PWA offline shell + web push)
const CACHE = 'velin-v1';
const SHELL = ['chat.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// network-first pro appku, fallback cache (data jde vždy z Supabase přímo)
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (u.origin !== location.origin) return; // Supabase apod. nechme projít
  e.respondWith(fetch(e.request).then(r => {
    const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp).catch(() => {})); return r;
  }).catch(() => caches.match(e.request)));
});
// web push (aktivuje se ve F web-push fázi)
self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title || 'VELÍN — nová zpráva', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || 'velin', data: d
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(ws => {
    for (const w of ws) if (w.url.includes('chat.html')) return w.focus();
    return clients.openWindow('chat.html');
  }));
});
