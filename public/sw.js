// Service Worker pour Faroty Payment Platform
// Ce fichier doit être placé dans /public/sw.js

const CACHE_NAME = 'faroty-v1';
const RUNTIME_CACHE = 'faroty-runtime';
const STATIC_ASSETS = [
  '/',
  '/offline.html',
];

// Installation du service worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Failed to cache some assets:', err);
        // Ne pas échouer sur les erreurs de cache
      });
    })
  );
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie de cache - Network first pour les API, Cache first pour les assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-HTTP(S)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - Network first
  if (url.pathname.includes('/api/') || url.pathname.includes('/auth/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cloner et cacher la réponse
          const clonedResponse = response.clone();
          if (response.status === 200) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback au cache en cas d'erreur réseau
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets - Cache first
  if (
    request.method === 'GET' &&
    (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/) ||
      url.pathname.includes('/_next/'))
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const clonedResponse = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        });
      })
    );
    return;
  }

  // HTML pages - Network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          if (response.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            if (response) {
              return response;
            }
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Default strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Gestion des messages depuis le client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync (optionnel)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  console.log('[SW] Syncing transactions...');
  try {
    // Implémenter la logique de sync si nécessaire
    console.log('[SW] Transactions synced');
  } catch (error) {
    console.error('[SW] Failed to sync transactions:', error);
  }
}

// Push notifications (optionnel)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'notification',
      requireInteraction: data.requireInteraction || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Faroty', options)
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Chercher si un onglet Faroty est déjà ouvert
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Sinon, ouvrir un nouvel onglet
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
