const CACHE_NAME = "lia-v7";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./styles.css",
    "./app.js?v=3",
    "./manifest.json",
    "./assets/icon-192.png",
    "./assets/icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ARCHIVOS.map(path =>
                new Request(new URL(path, self.registration.scope), { cache: "reload" })
            )))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(
                names
                    .filter(name => name.startsWith("lia-") && name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME)
            .then(cache => cache.match(event.request))
            .then(response => response || fetch(event.request))
    );
});