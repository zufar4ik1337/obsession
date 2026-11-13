// Минимальный service worker: делает сайт устанавливаемым и кэширует файлы эмодзи и иконки.
const CACHE = "obsession-v14";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  // эмодзи и иконки почти не меняются: сначала из кэша
  if (/\/(em|icons)\//.test(url.pathname)) {
    e.respondWith(caches.open(CACHE).then(c => c.match(e.request).then(r => r || fetch(e.request).then(res => { if (res.ok) c.put(e.request, res.clone()); return res; }))));
    return;
  }
  // страница: всегда свежая из сети, кэш только если нет интернета
  e.respondWith(fetch(e.request).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; }).catch(() => caches.match(e.request)));
});
