const CACHE = "osis-pwa-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./config.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  // Jangan pernah meng-cache komunikasi API.
  // Apps Script harus selalu diambil langsung dari server.
  if (
    url.hostname.includes("script.google.com") ||
    url.hostname.includes("googleusercontent.com")
  ) {
    return;
  }

  // Hanya cache file dari GitHub Pages sendiri.
  if (url.origin !== location.origin) {
    return;
  }

  // Untuk HTML navigasi, selalu coba versi terbaru terlebih dahulu.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // File aplikasi: network first, cache sebagai cadangan.
  event.respondWith(
    fetch(request)
      .then(response => {
        const copy = response.clone();
        caches.open(CACHE).then(cache => {
          cache.put(request, copy);
        });
        return response;
      })
      .catch(() => caches.match(request))
  );
});
