import { useQuery } from "@tanstack/react-query";
import { pokeApi } from "../utils/api";
import { getArtworkUrl } from "../utils/pokemon";

/**
 * Return the official artwork for a Pokémon as an in-memory base64 data URL
 * when the artwork query has resolved, else fall back to the raw artwork URL
 * from the Pokémon data so the card still renders while fetching.
 *
 * Query key `["artwork", id]` with infinite stale/gc time: session-scoped,
 * ~6 entries held for the current + prefetched game rounds.
 */
export function useArtwork(id: number | string): string {
  const stringId = String(id);
  const { data: pokeData } = useQuery({
    queryKey: ["pokemon", stringId],
    queryFn: () => pokeApi.getPokemon(stringId),
    staleTime: Number.POSITIVE_INFINITY,
  });
  const artworkUrl = pokeData ? getArtworkUrl(pokeData) : undefined;
  const { data: base64 } = useQuery({
    queryKey: ["artwork", stringId],
    queryFn: () => pokeApi.getArtworkBase64(artworkUrl ?? ""),
    enabled: Boolean(artworkUrl),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  });
  return base64 ?? artworkUrl ?? "";
}
