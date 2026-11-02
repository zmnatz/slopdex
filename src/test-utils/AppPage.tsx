import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppLayout } from "../routes/AppLayout";
import { PokemonDetailRoute } from "../routes/PokemonDetailRoute";

/**
 * Renders `children` as the index route of a real app-shaped router —
 * `AppLayout` (sidebar + Outlet + error boundary) at the root — so stories
 * about the composed home/sidebar experience exercise the actual navigation,
 * list fetching, and error handling, all served by the MSW mock layer.
 */
export function AppPage({
  children,
  initialEntry,
}: {
  children: ReactNode;
  initialEntry?: string;
}) {
  const contentRef = useRef<ReactNode>(children);
  useLayoutEffect(() => {
    contentRef.current = children;
  });

  const [router, setRouter] = useState<ReturnType<typeof createAppPageRouter> | null>(null);

  useEffect(() => {
    let active = true;
    const router = createAppPageRouter(() => contentRef.current, initialEntry);
    void router.load().then(() => {
      if (active) setRouter(router);
    });
    return () => {
      active = false;
    };
  }, [initialEntry]);

  if (!router) return null;
  return <RouterProvider router={router} />;
}

/** An `AppLayout`-rooted router that renders `content` at "/". */
function createAppPageRouter(
  content: () => ReactNode,
  initialEntry = "/",
): ReturnType<typeof createRouter> {
  const rootRoute = createRootRoute({
    component: AppLayout,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <>{content()}</>,
  });
  const pokemonRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/pokemon/$id",
    component: PokemonDetailRoute,
  });
  const gameRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/game",
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([indexRoute, pokemonRoute, gameRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });
}
