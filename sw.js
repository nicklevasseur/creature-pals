// Keeps every file of the app on the device, so it runs with no internet. A new build changes VERSION.
const VERSION = "pals-5f07e0c22c11", FILES = ["./", "index.html", "manifest.webmanifest", "fonts/LICENSE", "fonts/fredoka-latin-500-normal.woff2", "fonts/fredoka-latin-700-normal.woff2", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "vendor/OrbitControls.js", "vendor/three.min.js"];
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request))));
