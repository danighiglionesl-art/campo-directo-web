// Service Worker Oficial de Campo Directo PWA
const CACHE_NAME = "campo-directo-v5";
const OFFLINE_URL = "/offline";

// Recursos estáticos iniciales a precachear
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/favicon.ico",
  "/icon-transparent-192x192.png?v=5",
  "/icon-transparent-512x512.png?v=5",
  "/android-chrome-512x512.png?v=5",
  "/apple-touch-icon.png?v=5",
  "/images/logo-transparent.png"
];

// Instalación: precachea recursos esenciales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activación: limpia cachés antiguas y toma el control inmediato
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Interceptor de peticiones de red
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Omitir peticiones que no sean GET (como envíos de formularios POST)
  if (request.method !== "GET") {
    return;
  }

  // 2. Network-Only para API, autenticación y Panel de Control (nunca cachear por PWA)
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/panel") ||
    url.hostname.includes("accounts.google.com")
  ) {
    return;
  }

  // 3. Peticiones de Navegación (HTML de páginas): Network-First con fallback a offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlineFallback = await caches.match(OFFLINE_URL);
          if (offlineFallback) {
            return offlineFallback;
          }
          return new Response("Estás sin conexión. Por favor reintenta al recuperar el acceso a internet.", {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        })
    );
    return;
  }

  // 4. Recursos estáticos (imágenes, fuentes, scripts de Next.js _next/static): Stale-While-Revalidate
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/_next/static/") ||
      url.pathname.startsWith("/images/") ||
      url.pathname.endsWith(".png") ||
      url.pathname.endsWith(".jpg") ||
      url.pathname.endsWith(".ico") ||
      url.pathname.endsWith(".svg"))
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Si falla la red, el recurso ya en caché o fallback
          });

        return cachedResponse || fetchPromise;
      })
    );
  }
});

// Manejo de mensajes (ej. skipWaiting para actualizaciones)
self.addEventListener("message", (event) => {
  if (event.data && event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});
