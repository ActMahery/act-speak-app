// ACT & SPEAK — Service Worker v4 (notifications système fiables)
// Aucune mise en cache de l'app : toujours le réseau, pour que tous les appareils
// chargent la dernière version déployée.

const SW_VERSION = 'v5-badge-always';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

/* ══ NOTIFICATIONS PUSH ══
   Le service worker traite directement l'événement "push" (sans dépendre du SDK
   Firebase) : il affiche une vraie notification système dans la barre de
   notifications du téléphone, app fermée comme ouverte. Les messages envoyés par
   l'app sont de type "data-only" : { data: { title, body, type, convId } }. */
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (e) {}
  const d = payload.data || payload.notification || payload || {};
  const title = d.title || 'ACT & SPEAK';
  const body = d.body || '';

  event.waitUntil((async () => {
    await self.registration.showNotification(title, {
      body: body,
      icon: 'icon-192.png',
      badge: 'badge-96.png',
      tag: (d.type || 'act-speak') + (d.convId ? '-' + d.convId : ''),
      renotify: true,
      vibrate: [200, 100, 200],
      data: d
    });
  })());
});

// Au tap : ouvre l'app ou la ramène au premier plan.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
