export interface PokemonListItem {
  name: string
  url: string
}

export interface PokemonType {
  slot: number
  type: {
    name: string
  }
}

export interface PokemonStat {
  base_stat: number
  stat: {
    name: string
  }
}

export interface PokemonAbility {
  ability: {
    name: string
  }
  is_hidden: boolean
  slot: number
}

export interface PokemonCry {
  latest: string
  legacy: string
}

export interface PokemonMove {
  move: { name: string }
}

export interface GameIndex {
  version: { name: string }
}

export interface FlavorTextEntry {
  flavor_text: string
  language: { name: string }
  version: { name: string }
}

export interface Genus {
  genus: string
  language: { name: string }
}

export interface PokemonData {
  name: string
  sprites: {
    front_default: string
    other: {
      'official-artwork': {
        front_default: string
      }
    }
  }
  types: PokemonType[]
  stats: PokemonStat[]
  abilities: PokemonAbility[]
  height: number
  weight: number
  cries: PokemonCry
  base_experience?: number
  moves: PokemonMove[]
  game_indices: GameIndex[]
}

export interface SpeciesData {
  generation: {
    name: string
  }
  evolution_chain: {
    url: string
  }
  flavor_text_entries: FlavorTextEntry[]
  genera: Genus[]
}

export interface EvolutionChain {
  chain: {
    species: { name: string; url: string }
    evolves_to: EvolutionNode[]
  }
}

export interface EvolutionNode {
  species: { name: string; url: string }
  evolves_to: EvolutionNode[]
}

export interface EvolutionStep {
  name: string
  id: string
}

export interface TypeData {
  pokemon: { pokemon: PokemonListItem }[]
}

export interface GenRange {
  name: string
  start: number
  end: number
}
