import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { charizardPokeData, charizardSpeciesData } from "../../.storybook/msw-handlers";
import { GameIdentityCard } from "./GameIdentityCard";

const meta = {
  title: "Components/GameIdentityCard",
  component: GameIdentityCard,
  args: {
    pokemonId: 6,
    pokeData: charizardPokeData,
    speciesData: charizardSpeciesData,
    flipping: false,
    onNext: () => {},
  },
  render: (args) => <GameIdentityCard {...args} />,
} satisfies Meta<typeof GameIdentityCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const flavorEl = (canvas: ReturnType<typeof within>) => canvas.getByText(/Spits fire/);
const flavorFilter = (canvas: ReturnType<typeof within>) =>
  window.getComputedStyle(flavorEl(canvas)).filter;

export const Masked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByTestId("flip-card");
    expect(canvas.getByText("???")).toBeTruthy();
    expect(canvas.getByAltText("Mystery Pokémon")).toBeTruthy();
    expect(flavorFilter(canvas)).toContain("blur");
  },
};

export const FlipToReveal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = await canvas.findByTestId("flip-card");
    expect(canvas.getByText("charizard")).toBeTruthy();
    expect(flavorFilter(canvas)).toContain("blur");

    await userEvent.click(card);

    await waitFor(() => expect(flavorFilter(canvas)).not.toContain("blur"));
  },
};
