import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { charizardPokeData } from "../../.storybook/msw-handlers";
import { PokemonIdentity } from "./PokemonIdentity";

const meta = {
  title: "Components/PokemonIdentity",
  component: PokemonIdentity,
  args: { pokeData: charizardPokeData, masked: false },
  render: (args) => <PokemonIdentity {...args} />,
} satisfies Meta<typeof PokemonIdentity>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unmasked: Story = {};

export const Masked: Story = {
  args: { masked: true },
};
