import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { MemoryRoute } from "./MemoryRoute";

const meta = {
  title: "Routes/MemoryRoute",
  render: () => <MemoryRoute />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dealt: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole("button", { name: "Start" }, { timeout: 10000 });
    expect(canvas.getAllByTestId("memory-card").length % 2).toBe(0);
    expect(canvas.getByRole("timer").textContent).toBe("0:00");
  },
};

export const StartedAndFlipped: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole("button", { name: "Start" }, { timeout: 10000 }));
    await userEvent.click(canvas.getAllByTestId("memory-card")[0]);
    await waitFor(() =>
      expect(canvas.getAllByRole("button", { name: /charizard|bulbasaur/ })).toBeTruthy(),
    );
    expect(canvas.getByRole("slider", { name: "Card size" })).toBeDisabled();
  },
};
