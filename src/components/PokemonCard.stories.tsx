import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, within } from "storybook/test";
import { charizardPokeData, charizardSpeciesData } from "../../.storybook/msw-handlers";
import { PokemonCard } from "./PokemonCard";

const meta = {
  title: "Components/PokemonCard",
  component: PokemonCard,
  args: {
    pokeData: charizardPokeData,
    speciesData: charizardSpeciesData,
    masked: false,
  },
  render: (args) => <PokemonCard {...args} />,
} satisfies Meta<typeof PokemonCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Masked: Story = {
  args: { masked: true },
};

export const FireTypeChip: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByText("fire").closest(".MuiChip-root");
    expect(chip).toBeTruthy();
    const chipRoot = chip as HTMLElement;
    expect(getComputedStyle(chipRoot).backgroundColor).toBe("rgb(238, 129, 48)");
    expect(chipRoot.textContent).toContain("🔥");
  },
};
