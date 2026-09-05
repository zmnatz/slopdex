import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Sidebar } from "./Sidebar";

const filteredPokemon = [
  { name: "charmander", url: "https://pokeapi.co/api/v2/pokemon/4/" },
  { name: "charmeleon", url: "https://pokeapi.co/api/v2/pokemon/5/" },
  { name: "charizard", url: "https://pokeapi.co/api/v2/pokemon/6/" },
];

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  args: {
    filteredPokemon,
    selectedId: "6",
    variant: "permanent",
    open: true,
    onClose: () => {},
  },
  render: (args) => <Sidebar {...args} />,
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FilterByType: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const typeSelect = canvas.getByRole("combobox", { name: "Filter by type" });
    expect(typeSelect.textContent).not.toContain("Grass");

    await userEvent.click(typeSelect);

    const body = within(canvasElement.ownerDocument.body);
    const grass = await body.findByRole("option", { name: "Grass" });
    await userEvent.click(grass);

    await waitFor(() => expect(typeSelect.textContent).toContain("Grass"));
  },
};
