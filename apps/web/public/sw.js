const CACHE_NAME = 'uiforge-v1';
const STATIC_CACHE = 'uiforge-static-v1';
const DYNAMIC_CACHE = 'uiforge-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/projects',
  '/generate',
  '/templates',
  '/settings',
  '/_next/static/css/app.css',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
];

const API_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const STATIC_CACHE_DURATION = 365 * 24 * 60 * 60 * 1000; // 1 year

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle different URL patterns
  if (url.pathname.startsWith('/api/')) {
    // Network first for API calls with short cache
    event.respondWith(networkFirst(request, API_CACHE_NAME));
  } else if (url.pathname.startsWith('/_next/static/') ||
             url.pathname.startsWith('/logos/') ||
             url.pathname.includes('.woff') ||
             url.pathname.includes('.ttf')) {
    // Cache first for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE, STATIC_CACHE_DURATION));
  } else if (STATIC_ASSETS.includes(url.pathname)) {
    // Cache first for app shell
    event.respondWith(cacheFirst(request, STATIC_CACHE, STATIC_CACHE_DURATION));
  } else {
    // Network first for dynamic content
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Cache first strategy
async function cacheFirst(request, cacheName, cacheDuration) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached && isCacheValid(cached, cacheDuration)) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      cache.put(request, responseClone);
    }
    return response;
  } catch (error) {
    return cached || new Response('Offline', { status: 503 });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      cache.put(request, responseClone);
    }
    return response;
  } catch (error) {
    return cached || new Response('Offline', { status: 503 });
  }
}

// Check if cache is still valid
function isCacheValid(response, maxAge) {
  const date = response.headers.get('date');
  if (!date) return false;

  const responseDate = new Date(date);
  const now = new Date();
  return (now - responseDate) < maxAge;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      Promise.resolve()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logos/text-logo-64.webp',
      badge: '/favicon.ico',
      tag: data.tag || 'default',
      data: data.data,
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});
