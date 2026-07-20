import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { pokeApi } from '../utils/api'
import { flattenEvolutionChain } from '../utils/evolution'

/**
 * Suspends the calling component until data is ready (via <Suspense>) and
 * throws on failure (caught by the nearest error boundary) — see AppLayout's
 * Suspense/ErrorBoundary pair around <Outlet>. pokemon+species use
 * useSuspenseQueries (not two separate useSuspenseQuery calls) so they keep
 * fetching in parallel: a suspended hook call stops the component function
 * before it reaches the next hook, which would otherwise serialize them.
 * The evolution chain genuinely depends on species resolving first, so it
 * suspends separately once speciesData is available.
 */
export function usePokemonDetail(id: string) {
  const [{ data: pokeData }, { data: speciesData }] = useSuspenseQueries({
    queries: [
      { queryKey: ['pokemon', id], queryFn: () => pokeApi.getPokemon(id), staleTime: Infinity },
      { queryKey: ['species', id], queryFn: () => pokeApi.getSpecies(id), staleTime: Infinity },
    ],
  })

  const { data: evolutionData } = useSuspenseQuery({
    queryKey: ['evolution', speciesData.evolution_chain.url],
    queryFn: () => pokeApi.getEvolutionChain(speciesData.evolution_chain.url),
    staleTime: Infinity,
  })

  return {
    pokeData,
    speciesData,
    evoChain: flattenEvolutionChain(evolutionData.chain),
  }
}
