import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { charizardPokeData, charizardSpeciesData } from "../../.storybook/msw-handlers";
import type { EvolutionStep } from "../utils/types";
import { DetailView } from "./DetailView";

const evoChain: EvolutionStep[] = [
  { name: "charmander", id: "4" },
  { name: "charmeleon", id: "5" },
  { name: "charizard", id: "6" },
];

const meta = {
  title: "Components/DetailView",
  component: DetailView,
  args: {
    pokeData: charizardPokeData,
    speciesData: charizardSpeciesData,
    evoChain,
  },
  render: (args) => <DetailView {...args} />,
} satisfies Meta<typeof DetailView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OpenMoves: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(canvas.getByRole("button", { name: "View Moves" }));
    const movesDialog = await body.findByRole("dialog");
    expect(within(movesDialog).getByText("Moves")).toBeTruthy();
    expect(within(movesDialog).getByText("flamethrower")).toBeTruthy();
    await userEvent.click(within(movesDialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(body.queryByText("flamethrower")).toBeNull());

    await userEvent.click(canvas.getByRole("button", { name: "View Games" }));
    const gamesDialog = await body.findByRole("dialog");
    expect(within(gamesDialog).getByText("Games")).toBeTruthy();
    expect(within(gamesDialog).getByText("red")).toBeTruthy();
    await userEvent.click(within(gamesDialog).getByRole("button", { name: "Close" }));
    await waitFor(() => expect(body.queryByText("red")).toBeNull());
  },
};
