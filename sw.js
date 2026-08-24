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
