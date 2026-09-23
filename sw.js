const CACHE_NAME = "pemilihan-osis-v4";

const APP_FILES = [
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
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {

  const request = event.request;
  const url = new URL(request.url);

  /* JANGAN cache komunikasi Apps Script */
  if (
    url.hostname === "script.google.com" ||
    url.hostname.endsWith(".googleusercontent.com")
  ) {
    return;
  }

  /* Resource dari domain lain */
  if (url.origin !== self.location.origin) {
    return;
  }

  /* Halaman utama */
  if (request.mode === "navigate") {

    event.respondWith(
      fetch(request)
        .then(response => {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copy));

          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => {
              return cached || caches.match("./index.html");
            });
        })
    );

    return;
  }

  /* File aplikasi */
  event.respondWith(

    fetch(request)
      .then(response => {

        if (response && response.status === 200) {

          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, copy));
        }

        return response;
      })

      .catch(() => {

        return caches.match(request);
      })
  );
});
