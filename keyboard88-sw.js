// Choose a cache name
const cacheName = 'cache-v20210527';
// List the files to precache
const precacheResources = [
  'keyboard88.html',
  // 'modules/bootstrap/bootstrap.min.css',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css',
  'keyboard-core.css',
  'keyboard88.css',
  'noteTable.js',
  'noteValues.js',
  'waveTables.js',
  'webKeyboard.js',
  'keyboard88-manifest.json',
  'webMusicKeyboard88.png',
];

// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener('install', (event) => {
  console.log('Service worker install event!');
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precacheResources)));
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activate event!');
});

// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
self.addEventListener('fetch', (event) => {
  console.log('Fetch intercepted for:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    }),
  );
});