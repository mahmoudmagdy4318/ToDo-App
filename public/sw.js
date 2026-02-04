// Minimal service worker for MVP
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first for API, cache-first for static could be added later
self.addEventListener('fetch', (event) => {
  // For now, do nothing special; just pass through
});
