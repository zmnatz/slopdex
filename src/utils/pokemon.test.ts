import { describe, it, expect } from 'vitest'
import { pokemonIdFromUrl, pokemonName } from './pokemon'

describe('pokemonIdFromUrl', () => {
  it('extracts id from PokeAPI URL', () => {
    expect(pokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe('25')
  })

  it('extracts id from species URL', () => {
    expect(pokemonIdFromUrl('https://pokeapi.co/api/v2/pokemon-species/6/')).toBe('6')
  })
})

describe('pokemonName', () => {
  it('capitalizes first letter', () => {
    expect(pokemonName('pikachu')).toBe('Pikachu')
  })
})
