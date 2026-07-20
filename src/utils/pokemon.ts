import type { PokemonMove, GameIndex } from './types'

export function pokemonIdFromUrl(url: string): string {
  return url.split('/')[6]
}

export function pokemonName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1)
}

export function uniqueMoveNames(moves: PokemonMove[]): string[] {
  return [...new Set(moves.map(m => m.move.name))].sort()
}

export function gameNames(gameIndices: GameIndex[]): string[] {
  return [...new Set(gameIndices.map(g => g.version.name))]
}
