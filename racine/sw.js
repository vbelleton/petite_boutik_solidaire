// Ancien service worker de la racine (avant le passage sous /boutik/) : les téléphones qui
// avaient installé l'appli le rechargent ici, il vide ses caches et se désinstalle. Le nouveau
// service worker (/boutik/sw.js) prend le relais à la visite suivante.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.filter((k) => k.startsWith('ptb-') && !k.endsWith('v2')).map((k) => caches.delete(k)))
    await self.registration.unregister()
    const clients = await self.clients.matchAll({ type: 'window' })
    for (const c of clients) c.navigate(c.url)
  })())
})
