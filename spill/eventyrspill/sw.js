// Service worker: gjør at spillet kan spilles uten internett etter første gang.
// Øk versjonsnummeret når spillet oppdateres, så mobilen henter den nye versjonen.
const CACHE = 'eventyrspill-v0.31';
const FILER = ['./', 'index.html', 'manifest.json', 'ikoner/logo.png', 'ikoner/ikon-192.png', 'ikoner/ikon-512.png', 'ikoner/ikon-maskable-512.png', 'ikoner/apple-touch-icon.png', '../../ecoins/ecoins.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILER)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(navn => Promise.all(navn.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
// Nett først (så oppdateringer kommer med en gang), lagret kopi hvis man er uten nett
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return; // ikke ta med statistikk eller andre nettsider
  e.respondWith(
    fetch(e.request).then(svar => {
      const kopi = svar.clone();
      caches.open(CACHE).then(c => c.put(e.request, kopi));
      return svar;
    }).catch(() => caches.match(e.request).then(t => t || caches.match('index.html')))
  );
});
