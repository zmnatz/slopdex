import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { charizardPokeData } from "../../.storybook/msw-handlers";
import type { GameIndex } from "../utils/types";
import { GamesModal } from "./GamesModal";

function GamesModalHarness({ gameIndices }: { gameIndices: GameIndex[] }) {
  const [open, setOpen] = useState(true);
  return open ? <GamesModal gameIndices={gameIndices} onClose={() => setOpen(false)} /> : null;
}

const meta = {
  title: "Components/GamesModal",
  component: GamesModal,
  args: { gameIndices: charizardPokeData.game_indices, onClose: () => {} },
  render: (args) => <GamesModalHarness gameIndices={args.gameIndices} />,
} satisfies Meta<typeof GamesModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await body.findByText("Games");
    expect(body.getByText("red")).toBeTruthy();
    expect(body.getByText("yellow")).toBeTruthy();

    await userEvent.click(body.getByRole("button", { name: "Close" }));

    await waitFor(() => expect(body.queryByText("red")).toBeNull());
  },
};
