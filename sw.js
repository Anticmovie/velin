// VELÍN — service worker (v5): ŽÁDNÉ cachování appky (vždy čerstvá ze sítě) + web push.
// (appka je stejně always-online kvůli Supabase; offline cache působila stale/prázdné zobrazení)
// v5: notificationclick otevírá stránku z payloadu (url) — report provozu = index.html.
const CACHE = 'velin-v5';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))));  // smaž VŠECHNY staré cache
  self.clients.claim();
});
// bez fetch handleru -> prohlížeč načítá vždy z webu (žádná stará verze)
self.addEventListener('push', e => {
  let d = {}; try { d = e.data.json(); } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title || 'VELÍN — nová zpráva', {
    body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', tag: d.tag || 'velin', data: d
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || 'chat.html';
  const kotva = url.replace('index.html', '');   // index bývá v adrese jen jako "/velin/"
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) if (w.url.includes(url) || (kotva && w.url.endsWith(kotva))) return w.focus();
    return clients.openWindow(url);
  }));
});
