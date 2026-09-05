import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { charizardPokeData } from "../../.storybook/msw-handlers";
import type { PokemonMove } from "../utils/types";
import { MovesModal } from "./MovesModal";

function MovesModalHarness({ moves }: { moves: PokemonMove[] }) {
  const [open, setOpen] = useState(true);
  return open ? <MovesModal moves={moves} onClose={() => setOpen(false)} /> : null;
}

const meta = {
  title: "Components/MovesModal",
  component: MovesModal,
  args: { moves: charizardPokeData.moves, onClose: () => {} },
  render: (args) => <MovesModalHarness moves={args.moves} />,
} satisfies Meta<typeof MovesModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await body.findByText("Moves");
    expect(body.getByText("flamethrower")).toBeTruthy();
    expect(body.getByText("fire blast")).toBeTruthy();

    await userEvent.click(body.getByRole("button", { name: "Close" }));

    await waitFor(() => expect(body.queryByText("flamethrower")).toBeNull());
  },
};
