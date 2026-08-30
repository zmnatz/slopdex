const CACHE_NAME = 'pokedex-v3'

const POKEAPI_ORIGIN = 'https://pokeapi.co'
const SPRITES_ORIGIN = 'https://raw.githubusercontent.com'

function isCacheable(url) {
  const origin = url.origin
  return (
    origin === location.origin ||
    origin === POKEAPI_ORIGIN ||
    origin === SPRITES_ORIGIN
  )
}

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    // Relative to the SW script URL (/slopdex/sw.js) → precaches /slopdex/
    // (index.html). An absolute '/' would fetch the user-site root instead.
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['./']))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (!isCacheable(url)) return

  // Same-origin loads (the app shell and its assets) prefer the network so
  // deployed updates actually arrive; the cache only serves as an offline
  // fallback. PokeAPI and sprites stay cache-first.
  const isSameOrigin = url.origin === location.origin

  if (isSameOrigin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(event.request)
          return cached || new Response('Offline', { status: 503 })
        })
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response

        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      }).catch(() => new Response('Offline', { status: 503 }))
    })
  )
})