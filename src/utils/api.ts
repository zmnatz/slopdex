import { EvolutionClient, PokemonClient } from "pokenode-ts";
import { pokemonIdFromUrl } from "./pokemon";
import type { EvolutionChain, PokemonData, SpeciesData } from "./types";

// PokeAPI data is effectively static within a session; cache aggressively
// so revisiting a type filter or re-navigating doesn't re-hit the network.
const CACHE_OPTIONS = { ttl: 1000 * 60 * 30 };

const pokemonClient = new PokemonClient({ cacheOptions: CACHE_OPTIONS });
const evolutionClient = new EvolutionClient({ cacheOptions: CACHE_OPTIONS });

interface TypeResult {
  name: string;
  url: string;
}

interface TypeListResponse {
  results: TypeResult[];
}

interface PokemonListResponse {
  results: { name: string; url: string }[];
}

interface TypeData {
  pokemon: { pokemon: { name: string; url: string } }[];
}

export const pokeApi = {
  listAll: (): Promise<PokemonListResponse> => pokemonClient.listPokemons(0, 1025),

  /**
   * Fetch an artwork image and return it as a base64 data URL, held in memory
   * so the game card reveals instantly with no network wait. Rejects on any
   * failure (HTTP error, empty blob, FileReader error) so React Query retries
   * apply.
   */
  getArtworkBase64: async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch artwork: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read artwork as data URL"));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  },

  // pokenode-ts's generated types are broader/more nullable than the fields
  // this app actually reads (see CONTEXT.md's Move/Game glossary entries) —
  // the facade narrows to our own domain types at this boundary.
  getPokemon: (id: string) =>
    pokemonClient.getPokemonById(Number(id)) as unknown as Promise<PokemonData>,

  getSpecies: (id: string) =>
    pokemonClient.getPokemonSpeciesById(Number(id)) as unknown as Promise<SpeciesData>,

  getEvolutionChain: (url: string) =>
    evolutionClient.getEvolutionChainById(
      Number(pokemonIdFromUrl(url))
    ) as unknown as Promise<EvolutionChain>,

  getTypeList: (): Promise<TypeListResponse> => pokemonClient.listTypes(0, 100),

  getTypePokemon: (type: string) =>
    pokemonClient.getTypeByName(type) as unknown as Promise<TypeData>,
};
