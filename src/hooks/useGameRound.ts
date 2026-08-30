import { useQuery } from "@tanstack/react-query";
import { pokeApi } from "../utils/api";

/**
 * Total Pokémon in the dex (matches pokeApi.listAll's cap). The game draws
 * uniformly from this pool on every round, ignoring the sidebar's filters.
 */
export const TOTAL_POKEMON = 1025;

export function randomPokemonId(): number {
  return Math.floor(Math.random() * TOTAL_POKEMON) + 1;
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
