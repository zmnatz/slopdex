import { PokemonClient, EvolutionClient } from 'pokenode-ts'
import type { PokemonData, SpeciesData, EvolutionChain } from './types'
import { pokemonIdFromUrl } from './pokemon'

// PokeAPI data is effectively static within a session; cache aggressively
// so revisiting a type filter or re-navigating doesn't re-hit the network.
const CACHE_OPTIONS = { ttl: 1000 * 60 * 30 }

const pokemonClient = new PokemonClient({ cacheOptions: CACHE_OPTIONS })
const evolutionClient = new EvolutionClient({ cacheOptions: CACHE_OPTIONS })

interface TypeResult {
  name: string
  url: string
}

interface TypeListResponse {
  results: TypeResult[]
}

interface PokemonListResponse {
  results: { name: string; url: string }[]
}

interface TypeData {
  pokemon: { pokemon: { name: string; url: string } }[]
}

export const pokeApi = {
  listAll: (): Promise<PokemonListResponse> => pokemonClient.listPokemons(0, 1025),

  // pokenode-ts's generated types are broader/more nullable than the fields
  // this app actually reads (see CONTEXT.md's Move/Game glossary entries) —
  // the facade narrows to our own domain types at this boundary.
  getPokemon: (id: string) =>
    pokemonClient.getPokemonById(Number(id)) as unknown as Promise<PokemonData>,

  getSpecies: (id: string) =>
    pokemonClient.getPokemonSpeciesById(Number(id)) as unknown as Promise<SpeciesData>,

  getEvolutionChain: (url: string) =>
    evolutionClient.getEvolutionChainById(
      Number(pokemonIdFromUrl(url)),
    ) as unknown as Promise<EvolutionChain>,

  getTypeList: (): Promise<TypeListResponse> => pokemonClient.listTypes(0, 100),

  getTypePokemon: (type: string) =>
    pokemonClient.getTypeByName(type) as unknown as Promise<TypeData>,
}
