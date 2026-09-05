import { http, HttpResponse } from "msw";
import type { PokemonData, SpeciesData } from "../src/utils/types";

const SPRITE = "https://assets.pokemon.com/assets/cms2/img/pokedex/full/006.png";
const ARTWORK = "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/006.png";

export const charizardPokeData: PokemonData = {
  name: "charizard",
  sprites: {
    front_default: SPRITE,
    other: { "official-artwork": { front_default: ARTWORK } },
  },
  types: [
    { slot: 1, type: { name: "fire" } },
    { slot: 2, type: { name: "flying" } },
  ],
  stats: [
    { base_stat: 78, stat: { name: "hp" } },
    { base_stat: 84, stat: { name: "attack" } },
    { base_stat: 78, stat: { name: "defense" } },
    { base_stat: 109, stat: { name: "special-attack" } },
    { base_stat: 85, stat: { name: "special-defense" } },
    { base_stat: 100, stat: { name: "speed" } },
  ],
  abilities: [
    { ability: { name: "blaze" }, is_hidden: false, slot: 1 },
    { ability: { name: "solar-power" }, is_hidden: true, slot: 3 },
  ],
  height: 17,
  weight: 905,
  cries: { latest: "", legacy: "" },
  base_experience: 240,
  moves: [
    { move: { name: "fire-punch" } },
    { move: { name: "flamethrower" } },
    { move: { name: "fire-blast" } },
  ],
  game_indices: [
    { version: { name: "red" } },
    { version: { name: "blue" } },
    { version: { name: "yellow" } },
  ],
};

export const pikachuPokeData: PokemonData = {
  name: "pikachu",
  sprites: {
    front_default: "https://assets.pokemon.com/assets/cms2/img/pokedex/full/025.png",
    other: {
      "official-artwork": {
        front_default: "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/025.png",
      },
    },
  },
  types: [
    { slot: 1, type: { name: "electric" } },
  ],
  stats: [
    { base_stat: 35, stat: { name: "hp" } },
    { base_stat: 55, stat: { name: "attack" } },
    { base_stat: 40, stat: { name: "defense" } },
    { base_stat: 50, stat: { name: "special-attack" } },
    { base_stat: 50, stat: { name: "special-defense" } },
    { base_stat: 90, stat: { name: "speed" } },
  ],
  abilities: [
    { ability: { name: "static" }, is_hidden: false, slot: 1 },
    { ability: { name: "lightning-rod" }, is_hidden: true, slot: 3 },
  ],
  height: 4,
  weight: 60,
  cries: { latest: "", legacy: "" },
  base_experience: 112,
  moves: [
    { move: { name: "thunder-shock" } },
    { move: { name: "quick-attack" } },
    { move: { name: "thunderbolt" } },
  ],
  game_indices: [
    { version: { name: "red" } },
    { version: { name: "blue" } },
    { version: { name: "yellow" } },
  ],
};

export const pikachuSpeciesData: SpeciesData = {
  generation: { name: "generation-i" },
  evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/10/" },
  flavor_text_entries: [
    {
      flavor_text:
        "When several of these POKéMON gather, their electricity could build and cause lightning storms.",
      language: { name: "en" },
      version: { name: "red" },
    },
  ],
  genera: [{ genus: "Mouse Pokémon", language: { name: "en" } }],
};

export const charizardSpeciesData: SpeciesData = {
  generation: { name: "generation-i" },
  evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/2/" },
  flavor_text_entries: [
    {
      flavor_text:
        "Spits fire that is hot enough to melt boulders.\nKnown to cause forest fires unintentionally.",
      language: { name: "en" },
      version: { name: "red" },
    },
  ],
  genera: [{ genus: "Flame Pokémon", language: { name: "en" } }],
};

const TYPE_LIST = {
  results: [
    { name: "grass", url: "https://pokeapi.co/api/v2/type/12/" },
    { name: "fire", url: "https://pokeapi.co/api/v2/type/10/" },
  ],
};

export const mswHandlers = [
  http.get("https://pokeapi.co/api/v2/type", () => HttpResponse.json(TYPE_LIST)),
  http.get("https://pokeapi.co/api/v2/pokemon/:id", ({ params }) =>
    HttpResponse.json({
      ...charizardPokeData,
      id: Number(params.id),
    })
  ),
  http.get("https://pokeapi.co/api/v2/pokemon-species/:id", ({ params }) =>
    HttpResponse.json({
      ...charizardSpeciesData,
      id: Number(params.id),
    })
  ),
];