import { describe, it, expect } from 'vitest'
import { flattenEvolutionChain } from './evolution'

const BASE = 'https://pokeapi.co/api/v2/pokemon-species'

describe('flattenEvolutionChain', () => {
  it('flattens a single-node chain', () => {
    const chain = {
      species: { name: 'pikachu', url: `${BASE}/25/` },
      evolves_to: [],
    }
    expect(flattenEvolutionChain(chain)).toEqual([
      { name: 'pikachu', id: '25' },
    ])
  })

  it('flattens a linear chain', () => {
    const chain = {
      species: { name: 'charmander', url: `${BASE}/4/` },
      evolves_to: [
        {
          species: { name: 'charmeleon', url: `${BASE}/5/` },
          evolves_to: [
            {
              species: { name: 'charizard', url: `${BASE}/6/` },
              evolves_to: [],
            },
          ],
        },
      ],
    }
    expect(flattenEvolutionChain(chain)).toEqual([
      { name: 'charmander', id: '4' },
      { name: 'charmeleon', id: '5' },
      { name: 'charizard', id: '6' },
    ])
  })

  it('handles branching evolutions', () => {
    const chain = {
      species: { name: 'eevee', url: `${BASE}/133/` },
      evolves_to: [
        {
          species: { name: 'vaporeon', url: `${BASE}/134/` },
          evolves_to: [],
        },
        {
          species: { name: 'jolteon', url: `${BASE}/135/` },
          evolves_to: [],
        },
        {
          species: { name: 'flareon', url: `${BASE}/136/` },
          evolves_to: [],
        },
      ],
    }
    expect(flattenEvolutionChain(chain)).toEqual([
      { name: 'eevee', id: '133' },
      { name: 'vaporeon', id: '134' },
      { name: 'jolteon', id: '135' },
      { name: 'flareon', id: '136' },
    ])
  })

  it('returns entry with undefined id for empty url', () => {
    const result = flattenEvolutionChain({ species: { name: '', url: '' }, evolves_to: [] })
    expect(result[0].name).toBe('')
    expect(result[0].id).toBeUndefined()
  })
})
