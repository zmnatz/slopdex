import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useCallback, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  charizardPokeData,
  charizardSpeciesData,
  pikachuPokeData,
  pikachuSpeciesData,
} from "../../.storybook/msw-handlers";
import type { PokemonData, SpeciesData } from "../utils/types";
import { GameIdentityCard } from "./GameIdentityCard";

const ROUNDS: { pokemonId: number; pokeData: PokemonData; speciesData: SpeciesData }[] = [
  { pokemonId: 25, pokeData: pikachuPokeData, speciesData: pikachuSpeciesData },
  { pokemonId: 6, pokeData: charizardPokeData, speciesData: charizardSpeciesData },
  { pokemonId: 25, pokeData: pikachuPokeData, speciesData: pikachuSpeciesData },
];

/**
 * Drives the same transition sequencing as `GameRoute.drawPokemon`: flip to
 * the Poké Ball face, swap in the next Pokémon halfway through the spin, then
 * flip back. Lets Storybook's play functions and viewers see the full
 * Pokémon-to-Pokémon transition on one card.
 */
function TransitionHarness() {
  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const round = ROUNDS[index % ROUNDS.length];

  const drawNext = useCallback(() => {
    setFlipping(true);
    setTimeout(() => {
      setIndex((i) => i + 1);
    }, 300);
    setTimeout(() => setFlipping(false), 620);
  }, []);

  return (
    <Box sx={{ width: "100%", maxWidth: 500, mx: "auto" }}>
      <GameIdentityCard
        pokemonId={round.pokemonId}
        pokeData={round.pokeData}
        speciesData={round.speciesData}
        flipping={flipping}
        onNext={drawNext}
      />
      <Box sx={{ textAlign: "center" }}>
        <Button variant="contained" onClick={drawNext} disabled={flipping}>
          Draw next Pokémon
        </Button>
      </Box>
    </Box>
  );
}

const meta = {
  title: "Components/GameIdentityCard/Transition",
  component: GameIdentityCard,
  render: () => <TransitionHarness />,
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const NextRoundTransition: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = await canvas.findByTestId("flip-card");
    const flavorStyle = (text: RegExp) => window.getComputedStyle(canvas.getByText(text)).filter;

    // Round 1: pikachu, masked for guessing (flavor text blurred).
    expect(flavorStyle(/When several of these/)).toContain("blur");

    // Reveal the first Pokémon — the blur lifts.
    await userEvent.click(card);
    await waitFor(() => expect(flavorStyle(/When several of these/)).not.toContain("blur"));

    // Draw the next Pokémon — the full flip transition plays out.
    await userEvent.click(canvas.getByRole("button", { name: /Draw next Pokémon/ }));

    // The transition lands on the next Pokémon (charizard), masked again for a
    // new round, so its flavor stays blurred until the player reveals it.
    await waitFor(() => {
      expect(canvas.getByText(/Spits fire/)).toBeTruthy();
      expect(flavorStyle(/Spits fire/)).toContain("blur");
    });
  },
};
