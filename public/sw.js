// Service worker de la P'tite Boutik : rend le site installable et lisible hors connexion.
// Règle d'or : le contenu doit toujours être à jour. Les pages sont donc demandées au réseau
// d'abord, et le cache ne sert qu'en secours (pas de réseau). Les données (Firestore, photos
// du Worker) ne passent jamais par ici.
const VERSION = 'v1'
const SHELL = `ptb-shell-${VERSION}`
const ASSETS = `ptb-assets-${VERSION}`
const STATIC = `ptb-static-${VERSION}`

// Réservé à l'admin ou trop lourd (suppression de fond des photos) : jamais mis en cache
const SKIP = /^\/admin|ort-wasm|\/ort\.[\w.]*bundle|\.wasm$|\.onnx$/i

// Les fichiers /assets/ changent de nom à chaque mise en ligne : on garde les plus récents seulement
async function trim(cacheName, max) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)))
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.addAll(['/', '/icons/icon-192.png'])).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('ptb-') && !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return   // Firestore, Worker, Cloudinary, Google : réseau direct
  if (SKIP.test(url.pathname)) return

  // Pages : réseau d'abord, cache en secours
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(SHELL).then((c) => c.put('/', copy)) }
          return res
        })
        .catch(() => caches.match('/').then((r) => r || Response.error()))
    )
    return
  }

  // Fichiers /assets/ : leur nom change à chaque version, on peut les garder tels quels
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(ASSETS).then((c) => c.put(req, copy)).then(() => trim(ASSETS, 30)) }
        return res
      }))
    )
    return
  }

  // Images, icônes, manifeste : on sert le cache tout de suite et on le rafraîchit en arrière-plan
  event.respondWith(
    caches.open(STATIC).then((cache) =>
      cache.match(req).then((hit) => {
        const refresh = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res }).catch(() => hit)
        return hit || refresh
      })
    )
  )
})
