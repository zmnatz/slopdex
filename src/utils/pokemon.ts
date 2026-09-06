import type { GameIndex, PokemonData, PokemonMove } from "./types";

export function pokemonIdFromUrl(url: string): string {
  return url.split("/")[6];
}

/**
 * Single resolver for a Pokémon's display artwork: official artwork when
 * present, falling back to the default front sprite. Game and detail cards
 * share this so the base64 hook and the raw-URL faces never diverge.
 */
export function getArtworkUrl(pokeData: PokemonData): string {
  return pokeData.sprites.other["official-artwork"].front_default || pokeData.sprites.front_default;
}

export function pokemonName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function uniqueMoveNames(moves: PokemonMove[]): string[] {
  return [...new Set(moves.map((m) => m.move.name))].sort();
}

export function gameNames(gameIndices: GameIndex[]): string[] {
  return [...new Set(gameIndices.map((g) => g.version.name))];
}
