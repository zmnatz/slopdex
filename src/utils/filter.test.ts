import { describe, it, expect } from 'vitest'
import { applySearchFilter, applyGenFilter, applyTypeFilter } from './filter'

const pokemon = [
  { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
  { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
  { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
  { name: 'mewtwo', url: 'https://pokeapi.co/api/v2/pokemon/150/' },
  { name: 'mew', url: 'https://pokeapi.co/api/v2/pokemon/151/' },
  { name: 'celebi', url: 'https://pokeapi.co/api/v2/pokemon/251/' },
  { name: 'treecko', url: 'https://pokeapi.co/api/v2/pokemon/252/' },
]

describe('applySearchFilter', () => {
  it('returns all when search is empty', () => {
    expect(applySearchFilter(pokemon, '')).toHaveLength(7)
  })

  it('filters by name prefix', () => {
    expect(applySearchFilter(pokemon, 'char')).toHaveLength(2)
  })

  it('is case-insensitive', () => {
    expect(applySearchFilter(pokemon, 'CHAR')).toHaveLength(2)
  })

  it('returns empty for no match', () => {
    expect(applySearchFilter(pokemon, 'zzz')).toHaveLength(0)
  })
})

describe('applyGenFilter', () => {
  it('returns all when gen is "all"', () => {
    expect(applyGenFilter(pokemon, 'all')).toHaveLength(7)
  })

  it('filters Generation I (1-151)', () => {
    const result = applyGenFilter(pokemon, 'Generation I')
    expect(result.map(p => p.name)).toEqual([
      'pikachu', 'charmander', 'charizard', 'mewtwo', 'mew',
    ])
  })

  it('filters Generation II (152-251)', () => {
    expect(applyGenFilter(pokemon, 'Generation II')).toEqual([
      { name: 'celebi', url: 'https://pokeapi.co/api/v2/pokemon/251/' },
    ])
  })

  it('filters Generation III (252-386)', () => {
    expect(applyGenFilter(pokemon, 'Generation III')).toEqual([
      { name: 'treecko', url: 'https://pokeapi.co/api/v2/pokemon/252/' },
    ])
  })

  it('returns all for unknown generation (no range found)', () => {
    expect(applyGenFilter(pokemon, 'Generation X')).toHaveLength(7)
  })
})

describe('applyTypeFilter', () => {
  const electricUrls = new Set(['https://pokeapi.co/api/v2/pokemon/25/'])

  it('returns all when type is "all"', () => {
    expect(applyTypeFilter(pokemon, 'all', undefined)).toHaveLength(7)
  })

  it('filters by type URL set', () => {
    const result = applyTypeFilter(pokemon, 'electric', electricUrls)
    expect(result).toEqual([
      { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    ])
  })

  it('returns empty for no matching type', () => {
    const ghosts = new Set<string>()
    expect(applyTypeFilter(pokemon, 'ghost', ghosts)).toHaveLength(0)
  })
})
