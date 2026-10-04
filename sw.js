// ACT & SPEAK — Service Worker (notifications push système)
// Aucune mise en cache de l'app : toujours le réseau, pour que tous les appareils
// chargent la dernière version déployée.

const SW_VERSION = 'v3-notifs-data-only';

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

/* ══ NOTIFICATIONS PUSH (FCM) ══
   L'app envoie des messages "data-only" : le service worker affiche lui-même
   la notification système (barre de notifications du téléphone), app fermée
   comme ouverte en arrière-plan. */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCg0iChSrt3yLXn0yd-RFPUy8YmKy0hX8Y",
  authDomain: "act-speak.firebaseapp.com",
  projectId: "act-speak",
  storageBucket: "act-speak.firebasestorage.app",
  messagingSenderId: "126056935392",
  appId: "1:126056935392:web:5eb731a61b08e8197f8585"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const d = payload.data || {};
  const title = d.title || (payload.notification && payload.notification.title) || 'ACT & SPEAK';
  const body = d.body || (payload.notification && payload.notification.body) || '';
  return self.registration.showNotification(title, {
    body: body,
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: (d.type || 'act-speak') + (d.convId ? '-' + d.convId : ''),
    renotify: true,
    vibrate: [200, 100, 200],
    data: d
  });
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
