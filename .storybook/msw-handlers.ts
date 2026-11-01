import { http, HttpResponse } from "msw";
import type { EvolutionChain, PokemonData, SpeciesData } from "../src/utils/types";

const ARTWORK_ROOT = "https://assets.pokemon.com/assets/cms2/img/pokedex";
const SPRITE_ROOT = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export interface MockPokemon {
  id: number;
  name: string;
  types: { slot: number; name: string }[];
  species: SpeciesData;
  pokeData: PokemonData;
}

function spriteUrl(id: number) {
  return `${SPRITE_ROOT}/${id}.png`;
}

function artworkUrl(id: number) {
  return `${ARTWORK_ROOT}/full/${String(id).padStart(3, "0")}.png`;
}

function makePokedata(id: number, name: string, types: { slot: number; name: string }[]): PokemonData {
  return {
    name,
    sprites: {
      front_default: spriteUrl(id),
      other: { "official-artwork": { front_default: artworkUrl(id) } },
    },
    types: types.map((t) => ({ slot: t.slot, type: { name: t.name } })),
    stats: [
      { base_stat: 45, stat: { name: "hp" } },
      { base_stat: 49, stat: { name: "attack" } },
      { base_stat: 49, stat: { name: "defense" } },
      { base_stat: 65, stat: { name: "special-attack" } },
      { base_stat: 65, stat: { name: "special-defense" } },
      { base_stat: 45, stat: { name: "speed" } },
    ],
    abilities: [
      { ability: { name: "overgrow" }, is_hidden: false, slot: 1 },
      { ability: { name: "chlorophyll" }, is_hidden: true, slot: 3 },
    ],
    height: 7,
    weight: 69,
    cries: { latest: "", legacy: "" },
    base_experience: 64,
    moves: [
      { move: { name: "tackle" } },
      { move: { name: "growth" } },
      { move: { name: "razor-leaf" } },
    ],
    game_indices: [
      { version: { name: "red" } },
      { version: { name: "blue" } },
      { version: { name: "yellow" } },
    ],
  };
}

function makeSpecies(
  name: { common: string; genus: string; flavor: string },
  generation: string,
  chainId: number
): SpeciesData {
  return {
    generation: { name: generation },
    evolution_chain: { url: `https://pokeapi.co/api/v2/evolution-chain/${chainId}/` },
    flavor_text_entries: [
      {
        flavor_text: name.flavor,
        language: { name: "en" },
        version: { name: "red" },
      },
    ],
    genera: [{ genus: name.genus, language: { name: "en" } }],
  };
}

/**
 * A typed pocket of the Pokédex (IDs spread across several generations) used
 * to serve the `/pokemon` list. Every listed monster also has explicit
 * species + evolution-chain data, so navigating from the sidebar resolves
 * hermetically with no real network access.
 */
export const MOCK_POKEMON: MockPokemon[] = [
  {
    id: 1,
    name: "bulbasaur",
    types: [{ slot: 1, name: "grass" }],
    species: makeSpecies(
      { common: "bulbasaur", genus: "Seed Pokémon", flavor: "A strange seed was planted on its back at birth." },
      "generation-i",
      1
    ),
    pokeData: makePokedata(1, "bulbasaur", [{ slot: 1, name: "grass" }]),
  },
  {
    id: 4,
    name: "charmander",
    types: [{ slot: 1, name: "fire" }],
    species: makeSpecies(
      { common: "charmander", genus: "Lizard Pokémon", flavor: "The flame on its tail shows the strength of its life force." },
      "generation-i",
      2
    ),
    pokeData: {
      ...makePokedata(4, "charmander", [{ slot: 1, name: "fire" }]),
      stats: [
        { base_stat: 39, stat: { name: "hp" } },
        { base_stat: 52, stat: { name: "attack" } },
        { base_stat: 43, stat: { name: "defense" } },
        { base_stat: 60, stat: { name: "special-attack" } },
        { base_stat: 50, stat: { name: "special-defense" } },
        { base_stat: 65, stat: { name: "speed" } },
      ],
      height: 6,
      weight: 85,
      base_experience: 62,
      moves: [
        { move: { name: "scratch" } },
        { move: { name: "ember" } },
        { move: { name: "flamethrower" } },
      ],
      abilities: [
        { ability: { name: "blaze" }, is_hidden: false, slot: 1 },
        { ability: { name: "solar-power" }, is_hidden: true, slot: 3 },
      ],
    },
  },
  {
    id: 6,
    name: "charizard",
    types: [
      { slot: 1, name: "fire" },
      { slot: 2, name: "flying" },
    ],
    species: makeSpecies(
      { common: "charizard", genus: "Flame Pokémon", flavor: "Spits fire that is hot enough to melt boulders." },
      "generation-i",
      2
    ),
    pokeData: {
      ...makePokedata(6, "charizard", [
        { slot: 1, name: "fire" },
        { slot: 2, name: "flying" },
      ]),
      stats: [
        { base_stat: 78, stat: { name: "hp" } },
        { base_stat: 84, stat: { name: "attack" } },
        { base_stat: 78, stat: { name: "defense" } },
        { base_stat: 109, stat: { name: "special-attack" } },
        { base_stat: 85, stat: { name: "special-defense" } },
        { base_stat: 100, stat: { name: "speed" } },
      ],
      height: 17,
      weight: 905,
      base_experience: 240,
      moves: [
        { move: { name: "fire-punch" } },
        { move: { name: "flamethrower" } },
        { move: { name: "fire-blast" } },
      ],
      abilities: [
        { ability: { name: "blaze" }, is_hidden: false, slot: 1 },
        { ability: { name: "solar-power" }, is_hidden: true, slot: 3 },
      ],
    },
  },
  {
    id: 25,
    name: "pikachu",
    types: [{ slot: 1, name: "electric" }],
    species: makeSpecies(
      { common: "pikachu", genus: "Mouse Pokémon", flavor: "When several of these POKéMON gather, their electricity could build and cause lightning storms." },
      "generation-i",
      1
    ),
    pokeData: makePokedata(25, "pikachu", [{ slot: 1, name: "electric" }]),
  },
  {
    id: 152,
    name: "chikorita",
    types: [{ slot: 1, name: "grass" }],
    species: makeSpecies(
      { common: "chikorita", genus: "Leaf Pokémon", flavor: "It uses the leaf on its head to determine the temperature and humidity." },
      "generation-ii",
      3
    ),
    pokeData: makePokedata(152, "chikorita", [{ slot: 1, name: "grass" }]),
  },
  {
    id: 155,
    name: "cyndaquil",
    types: [{ slot: 1, name: "fire" }],
    species: makeSpecies(
      { common: "cyndaquil", genus: "Fire Mouse Pokémon", flavor: "It has a timid nature. If it is startled, the flames on its back burn more vigorously." },
      "generation-ii",
      3
    ),
    pokeData: makePokedata(155, "cyndaquil", [{ slot: 1, name: "fire" }]),
  },
];

const POKEMON_BY_ID = new Map(MOCK_POKEMON.map((p) => [String(p.id), p]));
const POKEMON_BY_NAME = new Map(MOCK_POKEMON.map((p) => [p.name, p]));

/** Legacy named fixtures: canonical charizard/pikachu data other stories use. */
export const charizardPokeData = POKEMON_BY_NAME.get("charizard")!.pokeData;
export const charizardSpeciesData = POKEMON_BY_NAME.get("charizard")!.species;
export const pikachuPokeData = POKEMON_BY_NAME.get("pikachu")!.pokeData;
export const pikachuSpeciesData = POKEMON_BY_NAME.get("pikachu")!.species;

const EVOLUTION_CHAINS: Record<string, { chain: EvolutionChain["chain"] }> = {
  "1": {
    chain: {
      species: { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon-species/1/" },
      evolves_to: [
        {
          species: { name: "ivysaur", url: "https://pokeapi.co/api/v2/pokemon-species/2/" },
          evolves_to: [
            {
              species: { name: "venusaur", url: "https://pokeapi.co/api/v2/pokemon-species/3/" },
              evolves_to: [],
            },
          ],
        },
      ],
    },
  },
  "2": {
    chain: {
      species: { name: "charmander", url: "https://pokeapi.co/api/v2/pokemon-species/4/" },
      evolves_to: [
        {
          species: { name: "charmeleon", url: "https://pokeapi.co/api/v2/pokemon-species/5/" },
          evolves_to: [
            {
              species: { name: "charizard", url: "https://pokeapi.co/api/v2/pokemon-species/6/" },
              evolves_to: [],
            },
          ],
        },
      ],
    },
  },
  "3": {
    chain: {
      species: { name: "chikorita", url: "https://pokeapi.co/api/v2/pokemon-species/152/" },
      evolves_to: [
        {
          species: { name: "bayleef", url: "https://pokeapi.co/api/v2/pokemon-species/153/" },
          evolves_to: [],
        },
      ],
    },
  },
};

const TYPE_LIST = {
  results: [
    { name: "grass", url: "https://pokeapi.co/api/v2/type/12/" },
    { name: "fire", url: "https://pokeapi.co/api/v2/type/10/" },
    { name: "electric", url: "https://pokeapi.co/api/v2/type/13/" },
    { name: "flying", url: "https://pokeapi.co/api/v2/type/3/" },
  ],
};

/** `/type/:name` responses for the types used by the mock list. */
const TYPE_POKEMON: Record<string, { pokemon: { name: string; url: string }[] }> = {
  grass: {
    pokemon: [
      { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon/1/" },
      { name: "chikorita", url: "https://pokeapi.co/api/v2/pokemon/152/" },
    ],
  },
  fire: {
    pokemon: [
      { name: "charmander", url: "https://pokeapi.co/api/v2/pokemon/4/" },
      { name: "charizard", url: "https://pokeapi.co/api/v2/pokemon/6/" },
      { name: "cyndaquil", url: "https://pokeapi.co/api/v2/pokemon/155/" },
    ],
  },
  electric: {
    pokemon: [
      {
        name: "pikachu",
        url: "https://pokeapi.co/api/v2/pokemon/25/",
      },
    ],
  },
  flying: {
    pokemon: [
      {
        name: "charizard",
        url: "https://pokeapi.co/api/v2/pokemon/6/",
      },
    ],
  },
};

/**
 * 1x1 transparent PNG served for artwork/sprite image requests so image
 * fetching (both the raw-URL faces and the base64 artwork path) resolves
 * hermetically in Storybook browser tests with no real network.
 */
const TINY_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function tinyPngBuffer(): ArrayBuffer {
  const binary = atob(TINY_PNG_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

const tinyPngResponse = () =>
  HttpResponse.arrayBuffer(tinyPngBuffer(), { headers: { "Content-Type": "image/png" } });

/**
 * Static image hosts used by the app for artwork and sprites. MSW matches
 * these in the browser so every <img> resolves without the network.
 */
export const artworkImageHandler = http.get("https://assets.pokemon.com/*", tinyPngResponse);
export const spriteImageHandler = http.get(`${SPRITE_ROOT}/*`, tinyPngResponse);

export const pokemonListHandler = http.get("https://pokeapi.co/api/v2/pokemon", () =>
  HttpResponse.json({
    count: MOCK_POKEMON.length,
    next: null,
    previous: null,
    results: MOCK_POKEMON.map((p) => ({
      name: p.name,
      url: `https://pokeapi.co/api/v2/pokemon/${p.id}/`,
    })),
  })
);

/** `/pokemon/:id` that echoes the requested id into the mock's data. */
export const pokemonByIdHandler = http.get("https://pokeapi.co/api/v2/pokemon/:id", ({ params }) => {
  const found = POKEMON_BY_ID.get(params.id as string);
  const source = found ?? POKEMON_BY_NAME.get("charizard")!;
  return HttpResponse.json({
    ...source.pokeData,
    id: Number(params.id),
  });
});

export const pokemonSpeciesHandler = http.get(
  "https://pokeapi.co/api/v2/pokemon-species/:id",
  ({ params }) => {
    const found = POKEMON_BY_ID.get(params.id as string);
    const source = found ?? POKEMON_BY_NAME.get("charizard")!;
    return HttpResponse.json({
      ...source.species,
      id: Number(params.id),
    });
  }
);

export const evolutionChainHandler = http.get(
  "https://pokeapi.co/api/v2/evolution-chain/:id",
  ({ params }) => {
    const chain = EVOLUTION_CHAINS[params.id as string] ?? EVOLUTION_CHAINS["2"];
    return HttpResponse.json(chain);
  }
);

export const typeListHandler = http.get("https://pokeapi.co/api/v2/type", () =>
  HttpResponse.json(TYPE_LIST)
);

export const typeByIdHandler = http.get("https://pokeapi.co/api/v2/type/:name", ({ params }) => {
  const name = params.name as string;
  const match = TYPE_POKEMON[name];
  return HttpResponse.json(match ?? { pokemon: [] });
});

export const mswHandlers = [
  artworkImageHandler,
  spriteImageHandler,
  typeListHandler,
  typeByIdHandler,
  pokemonListHandler,
  pokemonByIdHandler,
  pokemonSpeciesHandler,
  evolutionChainHandler,
];

const failure = () => HttpResponse.json({ message: "mock failure" }, { status: 500 });

/** Catch-all that fails every PokeAPI request, list included. */
export const pokeApiFailureHandler = http.all("https://pokeapi.co/api/v2/*", failure);

/** Fails only the per-pokémon endpoints, so the list still loads for navigation. */
export const pokeApiDetailFailureHandlers = [
  http.get("https://pokeapi.co/api/v2/pokemon/:id", failure),
  http.get("https://pokeapi.co/api/v2/pokemon-species/:id", failure),
  http.get("https://pokeapi.co/api/v2/evolution-chain/:id", failure),
];