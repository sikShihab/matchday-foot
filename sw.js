const CACHE_NAME = 'matchday-v1';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './manifest.json', './assets/logo-placeholder.svg'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('fetch', event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request)));
});
