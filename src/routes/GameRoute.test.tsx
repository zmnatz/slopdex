import { act, fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithRouter } from "../test-utils/renderWithRouter";
import type { PokemonData, SpeciesData } from "../utils/types";
import { GameRoute } from "./GameRoute";

const { useGameRoundMock, buildQueueMock, refillQueueMock, usePrefetchBatchMock } = vi.hoisted(
  () => ({
    useGameRoundMock: vi.fn(),
    buildQueueMock: vi.fn(() => [94]),
    refillQueueMock: vi.fn(() => [25]),
    usePrefetchBatchMock: vi.fn(),
  })
);

vi.mock("../hooks/useGameRound", () => ({
  useGameRound: useGameRoundMock,
  buildQueue: buildQueueMock,
  refillQueue: refillQueueMock,
  usePrefetchBatch: usePrefetchBatchMock,
}));

vi.stubGlobal(
  "Audio",
  class {
    volume = 1;
    play() {
      return Promise.resolve();
    }
  }
);

const mockPokemon: PokemonData = {
  name: "gengar",
  sprites: {
    front_default: "https://example.com/gengar.png",
    other: { "official-artwork": { front_default: "https://example.com/gengar-art.png" } },
  },
  types: [{ slot: 1, type: { name: "ghost" } }],
  stats: [{ base_stat: 130, stat: { name: "special-attack" } }],
  abilities: [{ ability: { name: "cursed-body" }, is_hidden: false, slot: 1 }],
  height: 15,
  weight: 405,
  cries: { latest: "https://example.com/gengar.ogg", legacy: "" },
  base_experience: 225,
  moves: [{ move: { name: "shadow-ball" } }],
  game_indices: [{ version: { name: "red" } }],
};

const mockSpecies: SpeciesData = {
  generation: { name: "generation-i" },
  evolution_chain: { url: "" },
  flavor_text_entries: [
    {
      flavor_text: "It steals heat from its surroundings.",
      language: { name: "en" },
      version: { name: "red" },
    },
  ],
  genera: [{ genus: "Shadow Pokémon", language: { name: "en" } }],
};

function renderGame() {
  return renderWithRouter(<GameRoute />);
}

beforeEach(() => {
  useGameRoundMock.mockReturnValue({
    pokeData: mockPokemon,
    speciesData: mockSpecies,
    isPending: false,
  });
  buildQueueMock.mockReturnValue([94]);
  refillQueueMock.mockReturnValue([25]);
});

describe("GameRoute", () => {
  it("renders the clue side: mystery silhouette, ??? name, clues visible", async () => {
    await renderGame();
    expect(screen.getByRole("heading", { name: /who's that pokémon/i })).toBeTruthy();
    expect(screen.getByAltText("Mystery Pokémon")).toBeTruthy();
    expect(screen.getByText("???")).toBeTruthy();
    expect(screen.getByText("Shadow Pokémon")).toBeTruthy();
  });

  it("reveals the answer when the card is clicked while masked", async () => {
    await renderGame();
    expect(screen.getByAltText("Mystery Pokémon")).toBeTruthy();
    fireEvent.click(screen.getByTestId("flip-card"));
    expect(screen.getByText("gengar")).toBeTruthy();
  });

  it("does not reveal when a control in the details card is clicked", async () => {
    await renderGame();
    fireEvent.click(screen.getByRole("button", { name: "View Moves" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("???")).toBeTruthy();
  });

  it("draws a fresh round by clicking the revealed card, flipping the whole card over", async () => {
    vi.useFakeTimers();
    try {
      await renderGame();
      const card = screen.getByTestId("flip-card");
      fireEvent.click(card);
      expect(screen.getByText("gengar")).toBeTruthy();
      fireEvent.click(card);
      act(() => vi.advanceTimersByTime(700));
      expect(screen.getByText("???")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});
