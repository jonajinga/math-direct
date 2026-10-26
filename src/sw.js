// Teach Direct service worker: the app works offline once it has been opened.
var STATIC_CACHE = "teach-direct-static-v11";

// Cached on install. scripts/check-pwa.mjs confirms every path exists in the
// build, since one missing file would fail the whole install.
var CORE_ASSETS = [
  "/",
  "/lessons/",
  "/practice/",
  "/stories/",
  "/records/",
  "/more/",
  "/guide/",
  "/guide/reading/",
  "/design/",
  "/sounds/",
  "/placement/",
  "/placement/math/",
  "/placement/reading/",
  "/search/",
  "/offline/",
  "/search-index.json",
  "/assets/css/global.css",
  "/assets/js/app.js",
  "/assets/js/progress.js",
  "/assets/js/visuals.js",
  "/assets/js/lesson-engine.js",
  "/assets/js/dot.js",
  "/assets/js/lessons-index.js",
  "/assets/js/records.js",
  "/assets/js/search.js",
  "/assets/fonts/source-sans-3-latin-400-normal.woff2",
  "/assets/fonts/source-sans-3-latin-600-normal.woff2",
  "/assets/fonts/source-sans-3-latin-700-normal.woff2",
  "/assets/fonts/lora-latin-600-normal.woff2",
  "/assets/fonts/lora-latin-700-normal.woff2",
  "/assets/fonts/comic-neue-latin-700-normal.woff2",
  "/assets/img/favicon.svg",
  "/assets/img/icon-192.png",
  "/assets/img/icon-512.png",
  "/manifest.json",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  var keep = [STATIC_CACHE];
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

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;

  // Assets: serve the saved copy and refresh it. Pages ask for styles and
  // scripts with a version tag, so a new build's files are fetched at once.
  // Only the newest copy of each file is kept; offline, any saved copy will do.
  if (url.pathname.match(/^\/assets\//)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(function (cache) {
        return cache.match(event.request).then(function (cached) {
          var fetched = fetch(event.request).then(function (response) {
            if (response.status === 200) {
              var copy = response.clone();
              cache.delete(event.request, { ignoreSearch: true }).then(function () { cache.put(event.request, copy); });
            }
            return response;
          }).catch(function () {
            return cached || cache.match(event.request, { ignoreSearch: true });
          });
          return cached || fetched;
        });
      })
    );
    return;
  }

  // Pages: the network first, then the saved copy, then the offline page.
  event.respondWith(
    fetch(event.request).then(function (response) {
      if (response.status === 200) {
        var clone = response.clone();
        caches.open(STATIC_CACHE).then(function (cache) { cache.put(event.request, clone); });
      }
      return response;
    }).catch(function () {
      return caches.match(event.request).then(function (cached) {
        return cached || caches.match("/offline/");
      });
    })
  );
});
