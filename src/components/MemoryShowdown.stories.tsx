import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, within } from "storybook/test";
import type { MemoryPokemon } from "../utils/memoryGame";
import type { PokemonData } from "../utils/types";
import { MemoryShowdown } from "./MemoryShowdown";

/** A stand-in artwork: a coloured blob with a face, so the motion is visible without PokeAPI. */
function blob(id: number, name: string, fill: string): MemoryPokemon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><ellipse cx="50" cy="58" rx="40" ry="36" fill="${fill}"/><circle cx="32" cy="50" r="6" fill="#222"/><circle cx="56" cy="50" r="6" fill="#222"/><path d="M30 70 Q44 80 58 70" stroke="#222" stroke-width="4" fill="none"/></svg>`;
  return {
    id,
    name,
    artworkSrc: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    pokeData: {} as PokemonData,
  };
}

const red = [blob(4, "charmander", "#f4511e"), blob(37, "vulpix", "#e57373")];
const blue = [
  blob(7, "squirtle", "#42a5f5"),
  blob(25, "pikachu", "#fdd835"),
  blob(1, "bulbasaur", "#66bb6a"),
];

const meta = {
  title: "Components/MemoryShowdown",
  component: MemoryShowdown,
  args: {
    teams: [red, blue],
    labels: ["Player 1", "Player 2"],
    colors: ["#1e88e5", "#fb8c00"],
    winners: [1],
    children: (
      <Box sx={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <Paper role="status" sx={{ p: 3, fontWeight: 900 }}>
          Player 2 wins!
        </Paper>
      </Box>
    ),
  },
  decorators: [
    (Story) => (
      <Box sx={{ position: "relative", width: "100%", height: 480 }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof MemoryShowdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlayerTwoWins: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("group", { name: "Player 2's team" })).toBeTruthy();
    await canvas.findByRole("status", undefined, { timeout: 5000 });
  },
};

export const Tie: Story = {
  args: { teams: [red, blue.slice(0, 2)], winners: [0, 1] },
};
