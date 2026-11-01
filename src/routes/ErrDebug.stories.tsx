import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, within } from "storybook/test";
import { pokeApiFailureHandler } from "../../.storybook/msw-handlers";
import { previewQueryClient } from "../../.storybook/preview";
import { pokeApi } from "../utils/api";
import { AppPage } from "../test-utils/AppPage";
import { IndexRoute } from "./IndexRoute";

const meta = {
  title: "Debug/Err",
  render: () => (
    <AppPage initialEntry="/">
      <IndexRoute />
    </AppPage>
  ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ListError: Story = {
  play: async ({ canvasElement, msw }) => {
    const shell = within(canvasElement as HTMLElement);
    await shell.findByText("Select a Pokémon to examine");
    await msw.use(pokeApiFailureHandler);
    const axiosCache = (pokeApi as unknown as { _cache?: { clear: () => void } })._cache;
    console.log("AXIOS-CACHE-REACH:", typeof axiosCache);
    // clear axios cache via the module's client
    const mod: any = await import("../utils/api");
    const client: any = mod.pokemonClient;
    console.log("CLIENT-cache-clear?:", typeof client?.api?.cache?.clear);
    client?.api?.cache?.clear?.();
    previewQueryClient.removeQueries({ queryKey: ["pokemon", "list"] });
    const t = Date.now();
    try {
      await shell.findByText("Failed to load Pokédex.", undefined, { timeout: 6000 });
      console.log("AXIOS-CLEAR-WORKS ms:", Date.now() - t);
    } catch {
      console.log("AXIOS-CLEAR-NOPE ms:", Date.now() - t);
    }
    expect(true).toBe(true);
  },
};
