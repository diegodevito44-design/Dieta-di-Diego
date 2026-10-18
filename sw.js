/* Dieta di Diego: uso senza internet. Cambia V per forzare un aggiornamento completo. */
var V = "dieta-v1";
var CORE = ["./", "index.html", "apple-touch-icon.png", "manifest.webmanifest"];
var HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(V).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") { return; }
  var url = new URL(req.url);
  if (url.origin !== self.location.origin && HOSTS.indexOf(url.hostname) < 0) { return; }
  e.respondWith(
    caches.open(V).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        var net = fetch(req).then(function (res) {
          if (res && (res.ok || res.type === "opaque")) { cache.put(req, res.clone()); }
          return res;
        }).catch(function () {
          return hit || (req.mode === "navigate" ? cache.match("index.html") : Response.error());
        });
        return hit || net;
      });
    })
  );
});
