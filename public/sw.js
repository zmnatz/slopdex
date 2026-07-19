const CACHE_NAME = 'pokedex-v2'

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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['/']))
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

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response

        const isSprite = url.origin === SPRITES_ORIGIN
        if (isSprite) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        } else {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return response
      }).catch(() => {
        return new Response('Offline', { status: 503 })
      })
    })
  )
})
