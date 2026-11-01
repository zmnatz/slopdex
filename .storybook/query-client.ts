import { QueryClient } from "@tanstack/react-query";

/**
 * The one QueryClient the whole storybook app tree shares. Tests reach into it
 * (via `previewQueryClient`) to drop cached queries mid-story — e.g. to force
 * an error-state re-fetch after swapping the MSW handlers. Retries stay off so
 * failure stories surface the error without exponential-backoff lag.
 */
export const previewQueryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Number.POSITIVE_INFINITY, retry: false },
  },
});
