import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { AppLayout } from "./routes/AppLayout";
import { GameRoute } from "./routes/GameRoute";
import { IndexRoute } from "./routes/IndexRoute";
import { MemoryRoute } from "./routes/MemoryRoute";
import { PokemonDetailRoute } from "./routes/PokemonDetailRoute";

const rootRoute = createRootRoute();

// Pathless: everything with the sidebar hangs off this. Memory Match is full
// screen, so it sits beside this layout rather than inside it.
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/",
  component: IndexRoute,
});

const pokemonRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/pokemon/$id",
  component: PokemonDetailRoute,
});

const gameRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/game",
  component: GameRoute,
});

const memoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/memory",
  component: MemoryRoute,
});

const routeTree = rootRoute.addChildren([
  appLayoutRoute.addChildren([indexRoute, pokemonRoute, gameRoute]),
  memoryRoute,
]);

export const router = createRouter({
  routeTree,
  basepath: "/slopdex",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
