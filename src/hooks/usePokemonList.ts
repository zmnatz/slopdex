import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pokeApi } from '../utils/api'
import { applySearchFilter, applyGenFilter, applyTypeFilter } from '../utils/filter'
import { useFilters } from './FiltersContext'

interface PokemonListItem {
  name: string
  url: string
}

interface PokemonListResult {
  results: PokemonListItem[]
}

export function usePokemonList() {
  const { searchTerm, genFilter, typeFilter } = useFilters()

  const listQuery = useQuery<PokemonListResult>({
    queryKey: ['pokemon', 'list'],
    queryFn: pokeApi.listAll,
    staleTime: Infinity,
  })

  const typePokemonQuery = useQuery({
    queryKey: ['types', typeFilter],
    queryFn: () => pokeApi.getTypePokemon(typeFilter),
    staleTime: Infinity,
    enabled: typeFilter !== 'all',
    select: (data: { pokemon: { pokemon: PokemonListItem }[] }) =>
      new Set(data.pokemon.map(p => p.pokemon.url)),
  })

  const filteredPokemon = useMemo(() => {
    if (!listQuery.data) return []
    let result = [...listQuery.data.results]
    result = applySearchFilter(result, searchTerm)
    result = applyGenFilter(result, genFilter)
    result = applyTypeFilter(result, typeFilter, typePokemonQuery.data)
    return result
  }, [listQuery.data, searchTerm, genFilter, typeFilter, typePokemonQuery.data])

  return {
    filteredPokemon,
    error: listQuery.error ? 'Failed to load Pokédex.' : null,
  }
}
