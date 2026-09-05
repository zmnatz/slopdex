import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { GameRoute } from "./GameRoute";

const meta = {
  title: "Routes/GameRoute",
  render: () => <GameRoute />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlayOneRound: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = await canvas.findByTestId("flip-card");

    expect(canvas.getByText("???")).toBeTruthy();
    expect(canvas.getByAltText("Mystery Pokémon")).toBeTruthy();
    const flavorEl = canvas.getByText(/Spits fire/);
    expect(window.getComputedStyle(flavorEl).filter).toContain("blur");

    await userEvent.click(card);

    await waitFor(() =>
      expect(window.getComputedStyle(canvas.getByText(/Spits fire/)).filter).not.toContain("blur")
    );
    expect(canvas.getByText("charizard")).toBeTruthy();
  },
};
