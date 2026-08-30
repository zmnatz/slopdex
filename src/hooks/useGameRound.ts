import { useQuery, useQueryClient } from "@tanstack/react-query";
import { pokeApi } from "../utils/api";

/**
 * Total Pokémon in the dex (matches pokeApi.listAll's cap). The game draws
 * uniformly from this pool on every round, ignoring the sidebar's filters.
 */
/**
 * Prefetch a batch of Pokémon into the React Query cache without returning
 * results. Safe to call repeatedly — React Query skips already-cached keys.
 * Returns the cached data for the given IDs if available.
 */
export function usePrefetchBatch(ids: number[]) {
  const client = useQueryClient();
  for (const id of ids) {
    client.prefetchQuery({
      queryKey: ["pokemon", String(id)],
      queryFn: () => pokeApi.getPokemon(String(id)),
      staleTime: Number.POSITIVE_INFINITY,
    });
    client.prefetchQuery({
      queryKey: ["species", String(id)],
      queryFn: () => pokeApi.getSpecies(String(id)),
      staleTime: Number.POSITIVE_INFINITY,
    });
  }
}

export const TOTAL_POKEMON = 1025;

export const QUEUE_SIZE = 1000;

/**
 * Build the initial shuffled queue. No repeats until the queue cycles, giving
 * every Pokémon an equal chance and avoiding immediate duplicates.
 */
export function buildQueue(): number[] {
  const ids = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, QUEUE_SIZE);
}

/**
 * Append another shuffled batch to an existing queue so the player can keep
 * drawing indefinitely without depleting the deck.
 */
export function refillQueue(queue: number[]): number[] {
  const ids = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return [...queue, ...ids];
}

/**
 * Fetch the two pieces a round needs — pokemon + species — but never the
 * evolution chain (the game hides it as a clue leak, so fetching it would be
 * pure waste). Same query keys as usePokemonDetail so the cache is shared;
 * AppLayout's useIsFetching predicate treats these as detail fetches, which
 * drives its top progress bar.
 */
export function useGameRound(id: number) {
  const pokemonQuery = useQuery({
    queryKey: ["pokemon", String(id)],
    queryFn: () => pokeApi.getPokemon(String(id)),
    staleTime: Number.POSITIVE_INFINITY,
  });
  const speciesQuery = useQuery({
    queryKey: ["species", String(id)],
    queryFn: () => pokeApi.getSpecies(String(id)),
    staleTime: Number.POSITIVE_INFINITY,
  });

  return {
    id,
    pokeData: pokemonQuery.data,
    speciesData: speciesQuery.data,
    isPending: pokemonQuery.isPending || speciesQuery.isPending,
  };
}
