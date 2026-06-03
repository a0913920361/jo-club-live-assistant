const CACHE_NAME = "jo-club-live-assistant-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.webmanifest",
  "./assets/storefront-night.jpg",
  "./assets/menu-light-meal-sets.jpg",
  "./assets/menu-coffee-dessert-drinks.jpg",
  "./assets/main-room.jpg",
  "./assets/activity-radar.svg",
  "./assets/line-qr.png",
  "./assets/opening-poster.jpg",
  "./assets/outdoor-pillar-sign.jpg",
  "./assets/private-table.jpg",
  "./assets/wall-brand-sign.jpg",
  "./data/jo-club-knowledge-base.json",
  "./docs/jo-club-assistant-knowledge-base-v1.md"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
