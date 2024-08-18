// Variable to store and update the cache name
const cacheName = 'cacheAssets-v2';

/*
 *
 * ON Install Event
 * 
*/
self.addEventListener('install', (event) => {
  console.log('[SW] Install: ', event);

  self.skipWaiting();

  event.waitUntil(
    caches.open(cacheName)
      .then((cache) => {
        cache.addAll([
          '/',
          '/manifest.json',
          '/index.html',
          '/css/style.css',
          '/scripts/main.js',
          '/scripts/weatherDb.js',
          '/scripts/weatherIndexedDb.js',
          '/scripts/notifications.js',
          '/pages/bookmark.html',
          '/pages/profile.html',
          '/assets/app-icons/favicon-196.png',
          '/assets/app-icons/manifest-icon-192.maskable.png',
          '/assets/icons/bookmark-icon.svg',
          '/assets/icons/forecast-icon.svg',
          '/assets/icons/home-icon.svg',
          '/assets/icons/humidity-icon.svg',
          '/assets/icons/location-2955.svg',
          '/assets/icons/search-icon.svg',
          '/assets/icons/temperature-icon.svg',
          '/assets/icons/uv-icon.svg',
          '/assets/icons/weather-icon-example.svg',
          '/assets/icons/wind-icon.svg',
        ]);
      })
      .catch((error) => {
        console.log('Cache Failed: ', error);
      })
  );
});

/*
 *
 * ON Activate Event
 * 
*/
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate: ', event);

  event.waitUntil(clients.claim());

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        cacheNames.forEach((item) => {
          if(item !== cacheName) {
            caches.delete(item);
          }
        });
      })
  );
});

/*
 *
 * ON Fetch Event
 * 
*/
self.addEventListener('fetch', (event) => {
  // Cache Strategy: Stale While Revalidate
  if(event.request.method === 'GET') {
    event.respondWith(
      caches.open(cacheName)
        .then((cache) => {
          return cache.match(event.request)
            .then((cachedResponse) => {
              const fetchedResponse = fetch(event.request)
                .then((networkResponse) => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                })
                .catch(() => {
                  console.log('Fetch Failed');
                })
              return cachedResponse || fetchedResponse;
            })
        })
    );
  }
});