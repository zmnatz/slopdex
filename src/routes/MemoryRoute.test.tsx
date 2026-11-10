import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { renderWithRouter } from "../test-utils/renderWithRouter";
import { MISMATCH_DELAY_MS } from "../utils/memoryGame";
import { MemoryRoute } from "./MemoryRoute";

const { getPokemon, getArtworkBase64, audioInstances } = vi.hoisted(() => ({
  getPokemon: vi.fn(),
  getArtworkBase64: vi.fn(),
  audioInstances: [] as { src: string; volume: number; paused: boolean }[],
}));

vi.mock("../utils/api", () => ({ pokeApi: { getPokemon, getArtworkBase64 } }));

vi.stubGlobal(
  "Audio",
  class {
    volume = 1;
    paused = false;
    src: string;
    constructor(src: string) {
      this.src = src;
      audioInstances.push(this);
    }
    play() {
      return Promise.resolve();
    }
    pause() {
      this.paused = true;
    }
  },
);

const pokemonData = (id: string) => ({
  name: `mon-${id}`,
  sprites: {
    front_default: `art-${id}`,
    other: { "official-artwork": { front_default: `art-${id}` } },
  },
  cries: { latest: `cry-${id}`, legacy: "" },
});

function setBoardArea(width: number, height: number) {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(width);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(height);
}

/** Dealt cards, each knowing which Pokémon it hides (from its artwork). */
function cards() {
  return screen.getAllByTestId("memory-card").map((element) => ({
    element,
    art: element.querySelector("img")?.getAttribute("src") ?? "",
  }));
}

function pairedCards() {
  const all = cards();
  const first = all[0];
  const partner = all.find((c) => c !== first && c.art === first.art);
  const other = all.find((c) => c.art !== first.art);
  if (!partner || !other) throw new Error("expected at least two Pairs");
  return { first, partner, other };
}

async function renderDealt() {
  await renderWithRouter(<MemoryRoute />, "/memory");
  return screen.findByRole("button", { name: "Start" }, { timeout: 5000 });
}

beforeEach(() => {
  localStorage.clear();
  audioInstances.length = 0;
  setBoardArea(400, 400); // 2×2 at the default card size: two Pairs.
  getPokemon.mockReset().mockImplementation(async (id: string) => pokemonData(id));
  getArtworkBase64.mockReset().mockImplementation(async (url: string) => `data:${url}`);
});

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(window.screen, "orientation");
});

describe("MemoryRoute", () => {
  it("deals every Pokémon as a Pair, face down, with the timer at 0:00", async () => {
    await renderDealt();
    const dealt = cards();
    expect(dealt).toHaveLength(4);
    expect(new Set(dealt.map((c) => c.art)).size).toBe(2);
    expect(screen.getAllByLabelText(/face down/)).toHaveLength(4);
    expect(screen.getByRole("timer").textContent).toBe("0:00");
  });

  it("shows only artwork on a flipped card, not a name or types", async () => {
    fireEvent.click(await renderDealt());
    fireEvent.click(cards()[0].element);
    const card = cards()[0].element;
    expect(card.textContent).toBe("");
    expect(card.querySelector("img")).toBeTruthy();
  });

  it("does not let cards flip before Start", async () => {
    await renderDealt();
    fireEvent.click(cards()[0].element);
    expect(screen.getAllByLabelText(/face down/)).toHaveLength(4);
    expect(audioInstances).toHaveLength(0);
  });

  it("locks the slider on Start", async () => {
    const startButton = await renderDealt();
    const slider = screen.getByRole("slider", { name: "Card size" }) as HTMLInputElement;
    expect(slider.disabled).toBe(false);
    fireEvent.click(startButton);
    expect(slider.disabled).toBe(true);
  });

  it("keeps a matched Pair face up", async () => {
    fireEvent.click(await renderDealt());
    const { first, partner } = pairedCards();
    fireEvent.click(first.element);
    fireEvent.click(partner.element);
    expect(screen.getAllByLabelText(/matched/)).toHaveLength(2);
    expect((first.element as HTMLButtonElement).disabled).toBe(true);
  });

  it("flips a mismatch back after the delay", async () => {
    fireEvent.click(await renderDealt());
    const { first, other } = pairedCards();
    fireEvent.click(first.element);
    fireEvent.click(other.element);
    expect(screen.getAllByLabelText(/face down/)).toHaveLength(2);
    await waitFor(() => expect(screen.getAllByLabelText(/face down/)).toHaveLength(4), {
      timeout: MISMATCH_DELAY_MS + 500,
    });
  });

  it("plays a cry on each flip at the shared volume, cutting off the previous one", async () => {
    fireEvent.click(await renderDealt());
    const { first, partner } = pairedCards();
    fireEvent.click(first.element);
    expect(audioInstances).toHaveLength(1);
    expect(audioInstances[0].volume).toBe(0.3);
    fireEvent.click(partner.element);
    expect(audioInstances).toHaveLength(2);
    expect(audioInstances[0].paused).toBe(true);
  });

  it("finishes after the last match, then Play Again deals a new Board and unlocks the slider", async () => {
    fireEvent.click(await renderDealt());
    const dealtBefore = cards();
    for (const art of new Set(dealtBefore.map((c) => c.art))) {
      for (const card of dealtBefore.filter((c) => c.art === art)) fireEvent.click(card.element);
    }
    const status = await screen.findByRole("status");
    expect(status.textContent).toMatch(/All matched! 0:0\d/);

    fireEvent.click(screen.getByRole("button", { name: "Play Again" }));
    await screen.findByRole("button", { name: "Start" });
    expect(screen.getByRole("timer").textContent).toBe("0:00");
    expect((screen.getByRole("slider") as HTMLInputElement).disabled).toBe(false);
  });

  it("quietly replaces a Pokémon that fails to load", async () => {
    getPokemon.mockImplementationOnce(async () => {
      throw new Error("boom");
    });
    await renderDealt();
    expect(cards()).toHaveLength(4);
    expect(screen.queryByText(/Couldn't load/)).toBeNull();
  }, 5000);

  it("shows Try again when too many Pokémon fail, and recovers", async () => {
    getPokemon.mockRejectedValue(new Error("offline"));
    await renderWithRouter(<MemoryRoute />, "/memory");
    const retry = await screen.findByRole("button", { name: "Try again" }, { timeout: 8000 });
    expect(screen.getByText("Couldn't load the cards")).toBeTruthy();

    getPokemon.mockImplementation(async (id: string) => pokemonData(id));
    fireEvent.click(retry);
    await screen.findByRole("button", { name: "Start" }, { timeout: 8000 });
  }, 20000);

  it("re-deals at the new size when the slider is released, remembering the size", async () => {
    setBoardArea(760, 400);
    await renderDealt();
    const before = cards().length;
    const slider = screen.getByRole("slider", { name: "Card size" });
    await act(async () => {
      fireEvent.change(slider, { target: { value: 64 } });
    });
    await waitFor(() => expect(cards().length).toBeGreaterThan(before));
    expect(localStorage.getItem("slopdex.memory.cardSize")).toBe("64");
  });

  it("rearranges the same cards when the device turns, without a new Board", async () => {
    setBoardArea(760, 400);
    let angle = 0;
    const listeners = new Set<() => void>();
    Object.defineProperty(window.screen, "orientation", {
      configurable: true,
      value: {
        get angle() {
          return angle;
        },
        addEventListener: (_: string, fn: () => void) => listeners.add(fn),
        removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
      },
    });

    const startButton = await renderDealt();
    fireEvent.click(startButton);
    const before = cards().map((c) => c.art);
    const board = screen.getByTestId("memory-board");
    const columns = () => getComputedStyle(board).gridTemplateColumns.match(/repeat\((\d+)/)?.[1];
    const dealtCols = columns();

    fireEvent.click(cards()[0].element);
    act(() => {
      angle = 90;
      listeners.forEach((fn) => fn());
    });

    expect(columns()).not.toBe(dealtCols);
    expect(
      cards()
        .map((c) => c.art)
        .sort(),
    ).toEqual([...before].sort());
    expect(screen.getByRole("button", { name: /^Card \d+, mon-/ })).toBeTruthy();
  });

  it("plays two players: turns alternate on a mismatch, matches score, and the final score shows", async () => {
    const startButton = await renderDealt();
    fireEvent.click(screen.getByRole("button", { name: "2 players" }));
    expect(screen.getByLabelText("Player 1 score").textContent).toBe("0");
    fireEvent.click(startButton);

    const active = () =>
      within(screen.getByTestId("scoreboard"))
        .getAllByText(/^Player \d$/)
        .find((el) => el.parentElement?.getAttribute("aria-current") === "true")?.textContent;
    expect(active()).toBe("Player 1");

    const { first, other } = pairedCards();
    fireEvent.click(first.element);
    fireEvent.click(other.element);
    await waitFor(() => expect(active()).toBe("Player 2"), { timeout: MISMATCH_DELAY_MS + 500 });
    expect(screen.getByRole("button", { name: "2 players" }).getAttribute("aria-pressed")).toBe(
      "true",
    );

    const all = cards();
    for (const art of new Set(all.map((c) => c.art))) {
      for (const card of all.filter((c) => c.art === art)) fireEvent.click(card.element);
    }
    const status = await screen.findByRole("status");
    expect(status.textContent).toMatch(/Player 2 wins!/);
    expect(status.textContent).toMatch(/Final score: 0 – 2/);
  });
});
