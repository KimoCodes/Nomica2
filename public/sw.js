const CACHE_VERSION = "v3";
const STATIC_CACHE = `nomitips-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `nomitips-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `nomitips-images-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  const installEvent = event as ExtendableEvent;
  installEvent.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  const activateEvent = event as ExtendableEvent;
  activateEvent.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key !== STATIC_CACHE &&
                key !== RUNTIME_CACHE &&
                key !== IMAGE_CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const fetchEvent = event as FetchEvent;
  const { request } = fetchEvent;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/socket.io") || url.pathname.startsWith("/api/socket")) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    fetchEvent.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && request.method === "GET") {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({ error: "Offline", offline: true }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  if (
    request.destination === "image" ||
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)
  ) {
    fetchEvent.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              return new Response("", { status: 408 });
            });
        });
      })
    );
    return;
  }

  if (
    request.destination === "style" ||
    request.destination === "script" ||
    url.pathname.match(/\.(css|js)$/i)
  ) {
    fetchEvent.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetching = fetch(request)
            .then((response) => {
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => cached);

          return cached || fetching;
        });
      })
    );
    return;
  }

  if (request.destination === "document" || request.mode === "navigate") {
    fetchEvent.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match("/offline");
          });
        })
    );
    return;
  }

  fetchEvent.respondWith(
    caches.match(request).then((cached) => {
      const fetching = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetching;
    })
  );
});
