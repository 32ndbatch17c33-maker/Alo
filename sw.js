const CACHE_NAME = 'alo-studio-suite-v1';
const ASSETS_TO_CACHE = [
  './',
  './manifest.json',
  './icon-192.png',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght=0,600;0,900;1,600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// If your main html file is named index.html, update or append it to the assets list above.

// Installation Phase
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activation Phase - Clears older cache instances if present
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept Network Requests for Cache-First Strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Fallback catch verification for external style/script fetches
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Cache newly dynamic requests dynamically if applicable
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Filter to avoid caching POST requests or data URIs
          if (event.request.method === 'GET' && event.request.url.startsWith('http')) {
            cache.put(event.request, responseToCache);
          }
        });

        return networkResponse;
      });
    }).catch(() => {
      // Offline fallback handling if asset is completely missing
    })
  );
});
