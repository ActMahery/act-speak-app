// ACT & SPEAK — Service Worker minimal (Session 7 v2.0)
// Objectif : garantir que TOUS les appareils (PC, mobile, APK) chargent toujours
// la dernière version déployée, sans jamais servir une version mise en cache.
// Aucune mise en cache de l'app elle-même — uniquement ce qui est nécessaire pour
// que le navigateur considère le site comme une PWA installable.

const SW_VERSION = 'v' + Date.now(); // change à chaque déploiement, forcé par le commentaire ci-dessous

// S'active immédiatement dès qu'une nouvelle version est détectée, sans attendre
// la fermeture de tous les onglets ouverts.
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Prend le contrôle immédiatement de toutes les pages ouvertes, et supprime
// tout cache résiduel d'une ancienne version du Service Worker (si présent).
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Ne met RIEN en cache — toujours réseau, jamais de version figée.
// (Un vrai mode hors-ligne pourra être ajouté plus tard si besoin, avec une
// stratégie "network-first + fallback cache" explicite plutôt que ce mode neutre.)
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});

/* ══ NOTIFICATIONS PUSH (FCM) — reçoit et affiche les notifications même
   quand l'app est complètement fermée. N'affecte pas le comportement
   "toujours réseau" ci-dessus : ce sont deux mécanismes indépendants. ══ */
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

// Affiche la notification système quand un message FCM arrive alors que
// l'app n'est pas au premier plan.
messaging.onBackgroundMessage(payload => {
  const title = (payload.notification && payload.notification.title) || 'ACT & SPEAK';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});

// Au tap sur la notification : ouvre l'app (ou la ramène au premier plan
// si elle est déjà ouverte dans un onglet/fenêtre existant).
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('/');
    })
  );
});
