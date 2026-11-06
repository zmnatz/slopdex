import { describe, expect, it } from "vite-plus/test";
import {
  arrangeCards,
  canFlip,
  cardSideFor,
  dealBoard,
  fitGrid,
  formatElapsed,
  gameReducer,
  MAX_PAIRS,
  newGame,
  quarterTurns,
  type GameState,
  type MemoryPokemon,
} from "./memoryGame";
import type { PokemonData } from "./types";

const pokemon = (id: number): MemoryPokemon => ({
  id,
  name: `p${id}`,
  artworkSrc: `data:${id}`,
  pokeData: {} as PokemonData,
});
const upright = { angle: 0, landscape: true };

function gameWith(ids: number[]): GameState {
  const board = dealBoard(ids.map(pokemon), { cols: ids.length, rows: 2 }, upright);
  // Unshuffled so tests can address cards directly: [a, a, b, b, ...].
  board.cards = ids.flatMap((id) => [
    { key: `${id}-a`, pokemon: pokemon(id) },
    { key: `${id}-b`, pokemon: pokemon(id) },
  ]);
  return gameReducer(newGame(board), { type: "start", now: 1000 });
}
const flip = (state: GameState, index: number, now = 2000) =>
  gameReducer(state, { type: "flip", index, now });

describe("fitGrid", () => {
  it("fits as many cards of the requested size as the area holds", () => {
    expect(fitGrid({ width: 460, height: 300 }, 100)).toEqual({ cols: 4, rows: 2 });
  });

  it("gets more cards from a smaller card size", () => {
    const area = { width: 800, height: 600 };
    const big = fitGrid(area, 200);
    const small = fitGrid(area, 100);
    expect(small.cols * small.rows).toBeGreaterThan(big.cols * big.rows);
  });

  it("always deals an even number of cards", () => {
    for (let width = 100; width < 1500; width += 37) {
      for (const size of [64, 80, 140, 200]) {
        const { cols, rows } = fitGrid({ width, height: 730 }, size);
        expect((cols * rows) % 2).toBe(0);
      }
    }
  });

  it("caps the Board and keeps it shaped like the area", () => {
    const { cols, rows } = fitGrid({ width: 3840, height: 2100 }, 64);
    expect(cols * rows).toBeLessThanOrEqual(MAX_PAIRS * 2);
    expect(cols).toBeGreaterThan(rows);
  });

  it("deals at least a 2×2 Board even when the card size exceeds the area", () => {
    expect(fitGrid({ width: 100, height: 100 }, 200)).toEqual({ cols: 2, rows: 2 });
  });

  it("drops the row or column that leaves the larger cards when the count is odd", () => {
    const area = { width: 700, height: 300 };
    const grid = fitGrid(area, 90);
    expect(grid).toEqual({ cols: 6, rows: 3 });
    expect(cardSideFor(area, grid)).toBeGreaterThanOrEqual(90);
  });
});

describe("dealBoard", () => {
  it("holds each Pokémon exactly twice", () => {
    const board = dealBoard([1, 2, 3].map(pokemon), { cols: 3, rows: 2 }, upright);
    const ids = board.cards.map((c) => c.pokemon.id).sort();
    expect(ids).toEqual([1, 1, 2, 2, 3, 3]);
    expect(new Set(board.cards.map((c) => c.key)).size).toBe(6);
  });
});

describe("gameReducer", () => {
  it("ignores flips until the game is started", () => {
    const board = dealBoard([pokemon(1), pokemon(2)], { cols: 2, rows: 2 }, upright);
    const ready = newGame(board);
    expect(canFlip(ready, 0)).toBe(false);
    expect(flip(ready, 0)).toBe(ready);
  });

  it("records when the timer started", () => {
    const state = gameWith([1, 2]);
    expect(state.phase).toBe("playing");
    expect(state.startedAt).toBe(1000);
  });

  it("does nothing on a second tap of the same card", () => {
    const once = flip(gameWith([1, 2]), 0);
    expect(flip(once, 0)).toBe(once);
  });

  it("keeps a matched Pair face up and no longer flippable", () => {
    const state = flip(flip(gameWith([1, 2]), 0), 1);
    expect(state.matchedIds).toEqual([1]);
    expect(state.flipped).toEqual([]);
    expect(canFlip(state, 0)).toBe(false);
    expect(canFlip(state, 2)).toBe(true);
  });

  it("holds a mismatch, ignoring other flips, until it is settled", () => {
    const mismatch = flip(flip(gameWith([1, 2, 3]), 0), 2);
    expect(mismatch.flipped).toEqual([0, 2]);
    expect(flip(mismatch, 4)).toBe(mismatch);
    const settled = gameReducer(mismatch, { type: "settleMismatch" });
    expect(settled.flipped).toEqual([]);
    expect(settled.matchedIds).toEqual([]);
  });

  it("finishes and stops the clock on the final match only", () => {
    let state = flip(flip(gameWith([1, 2]), 0), 1);
    expect(state.phase).toBe("playing");
    state = flip(flip(state, 2), 3, 9000);
    expect(state.phase).toBe("finished");
    expect(state.finishedAt).toBe(9000);
  });
});

describe("quarterTurns", () => {
  it("follows the device's rotation", () => {
    const dealt = { angle: 0, landscape: false };
    expect(quarterTurns(dealt, { angle: 90, landscape: true })).toBe(1);
    expect(quarterTurns(dealt, { angle: 270, landscape: true })).toBe(3);
    expect(quarterTurns({ angle: 90, landscape: true }, { angle: 270, landscape: true })).toBe(2);
    expect(quarterTurns({ angle: 270, landscape: true }, { angle: 0, landscape: false })).toBe(1);
  });

  it("turns clockwise for a window reshaped past square, and undoes it on the way back", () => {
    const dealt = { angle: 0, landscape: true };
    expect(quarterTurns(dealt, { angle: 0, landscape: false })).toBe(3);
    expect(quarterTurns(dealt, { angle: 0, landscape: true })).toBe(0);
  });
});

describe("arrangeCards", () => {
  // Dealt as:  0 1 2
  //            3 4 5
  const grid = { cols: 3, rows: 2 };

  it("leaves an unturned Board as dealt", () => {
    expect(arrangeCards(grid, 0)).toEqual({ cols: 3, rows: 2, order: [0, 1, 2, 3, 4, 5] });
  });

  it("rotates counter-clockwise, so the top-right card becomes top-left", () => {
    expect(arrangeCards(grid, 1)).toEqual({ cols: 2, rows: 3, order: [2, 5, 1, 4, 0, 3] });
  });

  it("rotates a half turn", () => {
    expect(arrangeCards(grid, 2)).toEqual({ cols: 3, rows: 2, order: [5, 4, 3, 2, 1, 0] });
  });

  it("rotates clockwise as three counter-clockwise turns", () => {
    expect(arrangeCards(grid, 3)).toEqual({ cols: 2, rows: 3, order: [3, 0, 4, 1, 5, 2] });
  });
});

describe("formatElapsed", () => {
  it("formats as m:ss", () => {
    expect(formatElapsed(0)).toBe("0:00");
    expect(formatElapsed(9999)).toBe("0:09");
    expect(formatElapsed(154000)).toBe("2:34");
    expect(formatElapsed(3725000)).toBe("62:05");
  });
});
