import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { FiltersProvider } from "../src/hooks/FiltersContext";
import { theme } from "../src/theme";
import { previewQueryClient } from "./query-client";

/** The story being rendered, handed to the router's root route through context. */
const StoryContent = createContext<ReactNode>(null);

function StoryOutlet() {
  return <>{useContext(StoryContent)}</>;
}

function createStoryRouter() {
  const rootRoute = createRootRoute({
    component: StoryOutlet,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => null,
  });
  const pokemonRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/pokemon/$id",
    component: () => null,
  });
  const gameRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/game",
    component: () => null,
  });
  const memoryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/memory",
    component: () => null,
  });
  const routeTree = rootRoute.addChildren([indexRoute, pokemonRoute, gameRoute, memoryRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
}

function WithRouter({ children }: { children: ReactNode }) {
  const [router, setRouter] = useState<ReturnType<typeof createStoryRouter> | null>(null);

  useEffect(() => {
    let active = true;
    const router = createStoryRouter();
    void router.load().then(() => {
      if (active) setRouter(router);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!router) return null;
  return (
    <StoryContent.Provider value={children}>
      <RouterProvider router={router} />
    </StoryContent.Provider>
  );
}

/** Theme, query client, filters, and router around every story. */
export function StoryProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={previewQueryClient}>
        <FiltersProvider>
          <WithRouter>{children}</WithRouter>
        </FiltersProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
