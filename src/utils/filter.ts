import { GEN_RANGES } from './constants'
import { pokemonIdFromUrl } from './pokemon'

interface PokemonItem {
  name: string
  url: string
}

export interface FilterParams {
  searchTerm: string
  genFilter: string
}

export function applySearchFilter(list: PokemonItem[], searchTerm: string): PokemonItem[] {
  if (!searchTerm) return list
  return list.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
}

export function applyGenFilter(list: PokemonItem[], genFilter: string): PokemonItem[] {
  if (genFilter === 'all') return list
  const range = GEN_RANGES.find(r => r.name === genFilter)
  if (!range) return list
  return list.filter(p => {
    const id = parseInt(pokemonIdFromUrl(p.url))
    return id >= range.start && id <= range.end
  })
}

export function applyTypeFilter(
  list: PokemonItem[],
  typeFilter: string,
  typeUrls: Set<string> | undefined,
): PokemonItem[] {
  if (typeFilter === 'all' || !typeUrls) return list
  return list.filter(p => typeUrls.has(p.url))
}
