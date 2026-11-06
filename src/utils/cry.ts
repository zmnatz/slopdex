import type { PokemonData } from "./types";

const CRY_VOLUME = 0.3;

/** Play a Pokémon's cry. Returns the playing audio, or null if it has no cry. */
export function playCry(pokeData: PokemonData): HTMLAudioElement | null {
  const src = pokeData.cries.latest || pokeData.cries.legacy;
  if (!src) return null;
  const audio = new Audio(src);
  audio.volume = CRY_VOLUME;
  void audio.play().catch(() => {
    // A blocked or missing cry shouldn't interrupt play.
  });
  return audio;
}
