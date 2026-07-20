import { describe, it, expect } from 'vitest'
import { pokemonIdFromUrl, pokemonName, uniqueMoveNames, gameNames } from './pokemon'

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

describe('uniqueMoveNames', () => {
  it('dedupes moves that appear across multiple version groups', () => {
    const moves = [
      { move: { name: 'tackle' } },
      { move: { name: 'tackle' } },
      { move: { name: 'growl' } },
    ]
    expect(uniqueMoveNames(moves)).toEqual(['growl', 'tackle'])
  })

  it('sorts alphabetically', () => {
    const moves = [
      { move: { name: 'thunderbolt' } },
      { move: { name: 'agility' } },
      { move: { name: 'quick-attack' } },
    ]
    expect(uniqueMoveNames(moves)).toEqual(['agility', 'quick-attack', 'thunderbolt'])
  })

  it('returns empty array for no moves', () => {
    expect(uniqueMoveNames([])).toEqual([])
  })
})

describe('gameNames', () => {
  it('extracts version names in PokeAPI order', () => {
    const gameIndices = [
      { version: { name: 'red' } },
      { version: { name: 'blue' } },
      { version: { name: 'yellow' } },
    ]
    expect(gameNames(gameIndices)).toEqual(['red', 'blue', 'yellow'])
  })

  it('dedupes repeated versions', () => {
    const gameIndices = [
      { version: { name: 'red' } },
      { version: { name: 'red' } },
    ]
    expect(gameNames(gameIndices)).toEqual(['red'])
  })

  it('returns empty array for no game indices', () => {
    expect(gameNames([])).toEqual([])
  })
})
