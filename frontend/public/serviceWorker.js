const CACHE_NAME = 'doctorfy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/favicon/favicon.svg',
  '/manifest.json',
  // Rutas críticas
  '/medical-chat',
  '/dashboard',
  '/medical-studies',
  '/nutrition',
  // Assets estáticos
  '/static/css/main.chunk.css',
  '/static/media/*'
];

// Rutas dinámicas que requieren Network First
const DYNAMIC_ROUTES = [
  '/medical-chat/',
  '/dashboard/',
  '/blog/',
  '/doctors/'
];

// Instalación del SW
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Estrategia de caché
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Network First para rutas dinámicas
  if (DYNAMIC_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache First para el resto
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then(response => {
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          });
      })
  );
}); 