const CACHE_NAME = "nomitips-v1";
const STATIC_ASSETS = [
  "/",
  "/offline",
];

self.addEventListener("install", (event) => {
  const installEvent = event as ExtendableEvent;
  installEvent.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  const activateEvent = event as ExtendableEvent;
  activateEvent.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
});

self.addEventListener("fetch", (event) => {
  const fetchEvent = event as FetchEvent;
  const { request } = fetchEvent;

  if (request.method !== "GET") return;

  if (request.url.includes("/api/")) {
    fetchEvent.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: "Offline" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      })
    );
    return;
  }

  fetchEvent.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          if (request.destination === "document") {
            return caches.match("/offline");
          }
          return new Response("", { status: 503 });
        });
    })
  );
});
