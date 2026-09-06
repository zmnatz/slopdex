import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { pokeApi } from "../utils/api";
import type { PokemonData } from "../utils/types";
import { useArtwork } from "./useArtwork";

vi.mock("../utils/api", () => ({
  pokeApi: {
    getPokemon: vi.fn(),
    getArtworkBase64: vi.fn(),
  },
}));

const getPokemonMock = vi.mocked(pokeApi.getPokemon);
const getArtworkMock = vi.mocked(pokeApi.getArtworkBase64);

const RAW_URL = "https://example.com/charizard-art.png";
const DATA_URL = "data:image/png;base64,QUJD";

const pokeData = {
  name: "charizard",
  sprites: {
    front_default: "https://example.com/charizard.png",
    other: { "official-artwork": { front_default: RAW_URL } },
  },
} as PokemonData;

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("useArtwork", () => {
  it("falls back to the raw artwork URL while the base64 fetch is pending", async () => {
    getPokemonMock.mockResolvedValue(pokeData);
    getArtworkMock.mockImplementation(() => new Promise(() => {}));
    const client = new QueryClient();
    const { result } = renderHook(() => useArtwork(6), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current).toBe(RAW_URL));
    expect(getArtworkMock).toHaveBeenCalledWith(RAW_URL);
  });

  it("returns the base64 data URL once ready", async () => {
    getPokemonMock.mockResolvedValue(pokeData);
    getArtworkMock.mockResolvedValue(DATA_URL);
    const client = new QueryClient();
    const { result } = renderHook(() => useArtwork(6), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current).toBe(DATA_URL));
  });

  it("uses the artwork query key with infinite stale/gc time", async () => {
    getPokemonMock.mockResolvedValue(pokeData);
    getArtworkMock.mockResolvedValue(DATA_URL);
    const client = new QueryClient();
    const { result } = renderHook(() => useArtwork("6"), { wrapper: wrapper(client) });
    await waitFor(() => expect(result.current).toBe(DATA_URL));
    const query = client.getQueryCache().find({ queryKey: ["artwork", "6"] });
    expect(query).toBeDefined();
    const options = query?.options as { staleTime?: number; gcTime?: number };
    expect(options.staleTime).toBe(Number.POSITIVE_INFINITY);
    expect(options.gcTime).toBe(Number.POSITIVE_INFINITY);
  });
});
