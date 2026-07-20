import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { AppLayout } from './routes/AppLayout'
import { IndexRoute } from './routes/IndexRoute'
import { PokemonDetailRoute } from './routes/PokemonDetailRoute'

const rootRoute = createRootRoute({
  component: AppLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexRoute,
})

const pokemonRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pokemon/$id',
  component: PokemonDetailRoute,
})

const routeTree = rootRoute.addChildren([indexRoute, pokemonRoute])

export const router = createRouter({
  routeTree,
  basepath: '/slopdex',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
