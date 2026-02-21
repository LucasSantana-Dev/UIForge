// Service Worker for Asset Caching
const CACHE_NAME = 'uiforge-assets-v1';
const LOGO_CACHE = 'uiforge-logos-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/_next/static/css/app.css',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
];

// Logo assets to cache
const LOGO_ASSETS = [
  '/logos/text-logo.webp',
  '/logos/text-logo-256.webp',
  '/logos/text-logo-128.webp',
  '/logos/text-logo-64.webp',
  '/logos/text-logo-optimized.png',
  '/logos/text-logo-256.png',
  '/logos/text-logo-128.png',
  '/logos/text-logo-64.png',
  '/logos/anvil-logo.webp',
  '/logos/anvil-logo-256.webp',
  '/logos/anvil-logo-128.webp',
  '/logos/anvil-logo-64.webp',
  '/logos/anvil-logo-optimized.png',
  '/logos/anvil-logo-256.png',
  '/logos/anvil-logo-128.png',
  '/logos/anvil-logo-64.png',
  '/favicon.ico'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => caches.open(LOGO_CACHE))
      .then((cache) => cache.addAll(LOGO_ASSETS))
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle logo assets specifically
  if (url.pathname.startsWith('/logos/') || url.pathname === '/favicon.ico') {
    event.respondWith(
      caches.match(LOGO_CACHE)
        .then((cacheResponse) => {
          if (cacheResponse) {
            return cacheResponse;
          }
          
          // If not in cache, fetch from network and cache
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(LOGO_CACHE)
                  .then((cache) => cache.put(request, responseClone));
              }
              return response;
            });
        })
    );
    return;
  }

  // Handle other static assets
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(
      caches.match(CACHE_NAME)
        .then((cacheResponse) => {
          if (cacheResponse) {
            return cacheResponse;
          }
          
          return fetch(request);
        })
    );
    return;
  }

  // For all other requests, use network-first strategy
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful GET requests
        if (response.ok && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));
        }
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== LOGO_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  if (event.tag === 'logo-sync') {
    event.waitUntil(
      caches.open(LOGO_CACHE)
        .then((cache) => cache.addAll(LOGO_ASSETS))
    );
  }
});

// Push notification for cache updates
self.addEventListener('push', (event) => {
  if (event.data?.type === 'CACHE_UPDATE') {
    event.waitUntil(
      caches.open(LOGO_CACHE)
        .then((cache) => cache.addAll(LOGO_ASSETS))
        .then(() => {
          return self.registration.showNotification('Assets Updated', {
            body: 'Logo assets have been updated with latest optimizations',
            icon: '/logos/text-logo-64.webp'
          });
        })
    );
  }
});

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_CACHE_STATS') {
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.keys()),
      caches.open(LOGO_CACHE).then(cache => cache.keys())
    ]).then(([staticKeys, logoKeys]) => {
      event.ports[0].postMessage({
        type: 'CACHE_STATS',
        staticAssets: staticKeys.length,
        logoAssets: logoKeys.length,
        timestamp: Date.now()
      });
    });
  }
});