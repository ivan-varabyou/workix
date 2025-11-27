/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

interface SyncEvent extends ExtendableEvent {
  tag: string;
  lastChance: boolean;
}

declare global {
  interface ServiceWorkerGlobalScope {
    addEventListener(type: 'sync', listener: (event: SyncEvent) => void): void;
  }
}

const CACHE_NAME = 'workix-v1';
const CACHE_URLS: string[] = [
  '/',
  '/index.html',
  '/styles.css',
  '/main.bundle.js',
  '/polyfills.bundle.js',
  '/api/health',
];

// Install event - cache resources
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app shell');
      return cache.addAll(CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network first for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful responses
          if (response && response.status === 200) {
            const responseClone: any = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then((response) => {
            return response || new Response('Offline - Resource not available', { status: 503 });
          });
        })
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const responseClone: any = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(
      (async () => {
        try {
          const response = await fetch('/api/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'sync-offline-data' }),
          });
          if (response.ok) {
            return response.json();
          }
          return null;
        } catch (error) {
          console.error('Sync failed:', error);
        }
      })()
    );
  }
});

// Push notifications
self.addEventListener('push', (event: PushEvent) => {
  const data: any = event.data?.json() ?? {};
  const title: any = data.title || 'Workix Notification';
  const options = {
    body: data.body,
    icon: '/assets/icon-192x192.png',
    badge: '/assets/badge-72x72.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

export {};
