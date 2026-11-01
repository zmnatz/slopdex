import type { Meta, StoryObj } from "@storybook/tanstack-react";
import { expect, userEvent, within } from "storybook/test";
import { pokeApiDetailFailureHandlers, pokeApiFailureHandler } from "../../.storybook/msw-handlers";
import { previewQueryClient } from "../../.storybook/preview";
import { AppPage } from "../test-utils/AppPage";
import { clearPokeApiCache } from "../utils/api";
import { IndexRoute } from "./IndexRoute";

const meta = {
  title: "Routes/IndexRoute",
  render: () => <IndexRoute />,
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** The sidebar drawer is portalled to <body>; the app shell lives in the canvas. */
function queries(canvasElement: HTMLElement) {
  const shell = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  return { shell, page };
}

async function openSidebar(canvasElement: HTMLElement) {
  const { shell } = queries(canvasElement);
  await userEvent.click(await shell.findByRole("button", { name: "Open menu" }));
}

/**
 * The full app (sidebar + home content) on "/", rendered entirely from the
 * MSW mock layer — the pokémon list, generation groups, type filters, and
 * sprite avatars all resolve with zero network access.
 */
export const HomeFullPage: Story = {
  render: () => (
    <AppPage initialEntry="/">
      <IndexRoute />
    </AppPage>
  ),
  play: async ({ canvasElement }) => {
    const { shell, page } = queries(canvasElement);
    expect(shell.getByText("Select a Pokémon to examine")).toBeTruthy();

    // On narrow viewports the sidebar is a drawer behind the hamburger menu —
    // open it the way a user would, so the mocked list rows become visible.
    await openSidebar(canvasElement);

    // The sidebar resolves the mocked /pokemon list without the network.
    await page.findByRole("link", { name: /charizard/i });
    expect(page.getByRole("link", { name: /bulbasaur/i })).toBeTruthy();
    expect(page.getByRole("link", { name: /pikachu/i })).toBeTruthy();
    expect(page.getByRole("link", { name: /chikorita/i })).toBeTruthy();

    // Rows are grouped into generation accordions.
    expect(page.getAllByText("Generation I")[0]).toBeTruthy();
    expect(page.getAllByText("Generation II")[0]).toBeTruthy();
  },
};

/**
 * Selecting a row in the sidebar navigates the whole app to that pokémon's
 * detail page, which resolves from mock data (pokemon + species + evolution)
 * and marks the selected row active.
 */
export const HomeSelectPokemon: Story = {
  render: () => (
    <AppPage initialEntry="/">
      <IndexRoute />
    </AppPage>
  ),
  play: async ({ canvasElement }) => {
    const { shell, page } = queries(canvasElement);
    await openSidebar(canvasElement);
    const charizardLink = await page.findByRole("link", { name: /charizard/i });
    await userEvent.click(charizardLink);

    // Detail content resolved entirely from the mock layer.
    expect(await shell.findByRole("heading", { name: "charizard" })).toBeTruthy();
    expect(shell.getByText("Flame Pokémon")).toBeTruthy();
    expect(shell.getByText(/Spits fire/)).toBeTruthy();

    // The selected sidebar row is marked active (reopen the drawer to see it).
    await openSidebar(canvasElement);
    const selected = page.getAllByRole("link", { name: /charizard/i });
    expect(selected.some((el) => el.className.includes("Mui-selected"))).toBe(true);
  },
};

/**
 * Forcing the mock layer to fail every PokeAPI request replaces the main
 * content with the muted "Failed to load Pokédex." message.
 */
export const HomeListError: Story = {
  render: () => (
    <AppPage initialEntry="/">
      <IndexRoute />
    </AppPage>
  ),
  play: async ({ canvasElement, msw }) => {
    const { shell } = queries(canvasElement);

    // Swap the whole mock layer for the failure handler, drop the axios cache
    // (it would keep serving the real list), then refetch the mounted list
    // query. Clearing the react-query cache instead would detach the observer
    // the sidebar is subscribed to, and nothing would re-fetch.
    await msw.use(pokeApiFailureHandler);
    await clearPokeApiCache();
    await previewQueryClient.refetchQueries({ queryKey: ["pokemon", "list"] });
    await shell.findByText("Failed to load Pokédex.");

    // A list failure takes over the main area, so the home content is gone.
    expect(shell.queryByText("Select a Pokémon to examine")).toBeNull();
  },
};

/**
 * Clicking into a detail page while the API is failing throws inside
 * usePokemonDetail and hits AppLayout's error boundary, showing the
 * "Try again" fallback.
 */
export const HomeDetailError: Story = {
  render: () => (
    <AppPage initialEntry="/">
      <IndexRoute />
    </AppPage>
  ),
  play: async ({ canvasElement, msw }) => {
    const { shell, page } = queries(canvasElement);
    await openSidebar(canvasElement);
    const charizardLink = await page.findByRole("link", { name: /charizard/i });

    // Fail only the per-pokémon endpoints. Nothing for this pokémon has been
    // fetched yet, and clearing the list would make it fail too and take over
    // the main area before the detail route can render.
    await msw.use(...pokeApiDetailFailureHandlers);
    await userEvent.click(charizardLink);

    await shell.findByText("Failed to load Pokémon data.");
    expect(shell.getByRole("button", { name: "Try again" })).toBeTruthy();
  },
};
