// Math Direct Service Worker — Offline Support
var STATIC_CACHE = "math-direct-static-v2";
var LESSON_CACHE = "math-direct-lessons-v1";

// Core assets cached on install
var CORE_ASSETS = [
  "/",
  "/lessons/",
  "/practice/",
  "/guide/",
  "/curriculum/",
  "/about/",
  "/offline/",
  "/assets/css/global.css",
  "/assets/js/theme.js",
  "/assets/js/nav.js",
  "/assets/js/lesson-engine.js",
  "/assets/js/progress.js",
  "/assets/js/practice-engine.js",
  "/manifest.json",
];

// Install: cache core assets
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", function (event) {
  var keep = [STATIC_CACHE, LESSON_CACHE];
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(
        names
          .filter(function (name) { return keep.indexOf(name) === -1; })
          .map(function (name) { return caches.delete(name); })
      );
    })
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);

  // Only handle same-origin GET requests
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  // Lesson pages: cache-first after first visit (they rarely change)
  if (url.pathname.match(/^\/lessons\/lesson-/)) {
    event.respondWith(
      caches.open(LESSON_CACHE).then(function (cache) {
        return cache.match(event.request).then(function (cached) {
          if (cached) return cached;
          return fetch(event.request).then(function (response) {
            if (response.status === 200) cache.put(event.request, response.clone());
            return response;
          });
        });
      }).catch(function () {
        return caches.match("/offline/");
      })
    );
    return;
  }

  // Static assets (CSS, JS, images): stale-while-revalidate
  if (url.pathname.match(/^\/assets\//)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.match(event.request).then(function (cached) {
          var fetched = fetch(event.request).then(function (response) {
            if (response.status === 200) cache.put(event.request, response.clone());
            return response;
          }).catch(function () { return cached; });
          return cached || fetched;
        });
      })
    );
    return;
  }

  // Pages: network-first, cache fallback, offline fallback
  event.respondWith(
    fetch(event.request).then(function (response) {
      if (response.status === 200) {
        var clone = response.clone();
        caches.open(STATIC_CACHE).then(function (cache) {
          cache.put(event.request, clone);
        });
      }
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        return cached || caches.match("/offline/");
      });
    })
  );
});
