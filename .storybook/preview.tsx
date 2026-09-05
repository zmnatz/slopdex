import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createMemoryHistory,
  createRoute,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { definePreview } from "@storybook/tanstack-react";
import addonMsw from "msw-storybook-addon";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FiltersProvider } from "../src/hooks/FiltersContext";
import { theme } from "../src/theme";
import { mswHandlers } from "./msw-handlers";
import "../src/index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Number.POSITIVE_INFINITY, retry: 3 },
  },
});

function createStoryRouter() {
  const rootRoute = createRootRoute({
    component: () => <>{storyRef.current}</>,
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
  const routeTree = rootRoute.addChildren([indexRoute, pokemonRoute, gameRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
}

const storyRef = { current: null as ReactNode | null };

function WithRouter({ children }: { children: ReactNode }) {
  storyRef.current = children;

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
  return <RouterProvider router={router} />;
}

export default definePreview({
  addons: [addonMsw()],
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <FiltersProvider>
            <WithRouter>
              <Story />
            </WithRouter>
          </FiltersProvider>
        </QueryClientProvider>
      </ThemeProvider>
    ),
  ],
  beforeEach: async ({ msw }) => {
    await msw.resetHandlers();
    await msw.use(...mswHandlers);
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: "todo",
    },
  },
});