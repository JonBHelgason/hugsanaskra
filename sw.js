/* Þjónustuskrá (service worker): geymir appið í símanum svo það virki án nets.
   Þegar þú breytir index.html: hækkaðu VERSION um 1, annars sækir síminn gömlu útgáfuna. */
const VERSION = 'hugsanaskra-v3';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

/* Setja upp: sækja allar skrár í skyndiminni */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

/* Virkja: eyða gömlum útgáfum */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

/* Sækja: fyrst úr skyndiminni, annars af netinu */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
