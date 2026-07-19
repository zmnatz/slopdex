import type { PokemonData, SpeciesData, EvolutionChain } from './types'

const BASE = 'https://pokeapi.co/api/v2'

async function fetchWithRetry<T>(url: string, retries = 3, backoff = 300): Promise<T> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await new Promise(r => setTimeout(r, backoff))
        return fetchWithRetry(url, retries - 1, backoff * 2)
      }
      throw new Error(`HTTP ${response.status}`)
    }
    return await response.json()
  } catch (e) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, backoff))
      return fetchWithRetry(url, retries - 1, backoff * 2)
    }
    throw e
  }
}

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
  listAll: () =>
    fetchWithRetry<PokemonListResponse>(`${BASE}/pokemon?limit=1025`),

  getPokemon: (id: string) =>
    fetchWithRetry<PokemonData>(`${BASE}/pokemon/${id}`),

  getSpecies: (id: string) =>
    fetchWithRetry<SpeciesData>(`${BASE}/pokemon-species/${id}`),

  getEvolutionChain: (url: string) =>
    fetchWithRetry<EvolutionChain>(url),

  getTypeList: () =>
    fetchWithRetry<TypeListResponse>(`${BASE}/type`),

  getTypePokemon: (type: string) =>
    fetchWithRetry<TypeData>(`${BASE}/type/${type}`),
}
