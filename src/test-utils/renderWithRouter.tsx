import type { ReactNode } from 'react'
import { render } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router'
import { theme } from '../theme'

/**
 * Renders `ui` as the root route of a throwaway router with in-memory
 * history, matching the real app's route shape (index + /pokemon/$id) so
 * components using <Link>/useParams resolve without needing the real router.
 *
 * Async: the router resolves its first match asynchronously, so a plain
 * synchronous `render()` would observe an empty tree. Awaiting `router.load()`
 * before rendering means the match is already resolved by the time this
 * returns, so callers can use ordinary `getBy*` queries afterward.
 */
export async function renderWithRouter(ui: ReactNode, initialPath = '/') {
  const rootRoute = createRootRoute({ component: () => ui })
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => null })
  const pokemonRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pokemon/$id',
    component: () => null,
  })
  const routeTree = rootRoute.addChildren([indexRoute, pokemonRoute])
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  })
  await router.load()

  const result = render(
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>,
  )

  return { ...result, router }
}
