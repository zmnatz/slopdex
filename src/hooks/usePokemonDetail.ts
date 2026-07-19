import { useQuery } from '@tanstack/react-query'
import { pokeApi } from '../utils/api'
import { flattenEvolutionChain } from '../utils/evolution'

export function usePokemonDetail(id: string | null) {
  const pokemonQuery = useQuery({
    queryKey: ['pokemon', id],
    queryFn: () => pokeApi.getPokemon(id!),
    enabled: !!id,
    staleTime: Infinity,
  })

  const speciesQuery = useQuery({
    queryKey: ['species', id],
    queryFn: () => pokeApi.getSpecies(id!),
    enabled: !!id,
    staleTime: Infinity,
  })

  const evolutionQuery = useQuery({
    queryKey: ['evolution', speciesQuery.data?.evolution_chain?.url],
    queryFn: () => pokeApi.getEvolutionChain(speciesQuery.data!.evolution_chain.url),
    enabled: !!speciesQuery.data?.evolution_chain?.url,
    staleTime: Infinity,
  })

  const evoChain = evolutionQuery.data
    ? flattenEvolutionChain(evolutionQuery.data.chain)
    : []

  return {
    pokeData: pokemonQuery.data ?? null,
    speciesData: speciesQuery.data ?? null,
    evoChain,
    loading: pokemonQuery.isLoading || speciesQuery.isLoading,
    error:
      pokemonQuery.error || speciesQuery.error
        ? 'Failed to load Pokémon data'
        : null,
  }
}
