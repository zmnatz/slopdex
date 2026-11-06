import type { PokemonData } from "./types";

export const MIN_CARD_SIZE = 64;
export const MAX_CARD_SIZE = 200;
export const CARD_SIZE_STEP = 4;
export const CARD_GAP = 8;
export const MAX_PAIRS = 30;
export const MISMATCH_DELAY_MS = 1000;

const MIN_GRID_SIDE = 2;

export interface Area {
  width: number;
  height: number;
}

export interface Grid {
  cols: number;
  rows: number;
}

/** A Pokémon ready to be dealt: everything a card needs is already in memory. */
export interface MemoryPokemon {
  id: number;
  name: string;
  artworkSrc: string;
  pokeData: PokemonData;
}

export interface MemoryCardData {
  /** Unique per card; the two cards of a Pair share `pokemon` but not `key`. */
  key: string;
  pokemon: MemoryPokemon;
}

/** How the screen was held when a Board was dealt; rotation is measured from it. */
export interface DealOrientation {
  angle: number;
  landscape: boolean;
}

export interface Board extends Grid {
  cards: MemoryCardData[];
  orientation: DealOrientation;
}

export type Phase = "ready" | "playing" | "finished";

export interface GameState {
  board: Board;
  phase: Phase;
  /** Indexes into `board.cards` of the unresolved face-up cards (at most two). */
  flipped: number[];
  matchedIds: number[];
  startedAt: number | null;
  finishedAt: number | null;
}

export type GameAction =
  | { type: "start"; now: number }
  | { type: "flip"; index: number; now: number }
  | { type: "settleMismatch" };

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** The largest square card that fits `grid` inside `area`, in whole pixels. */
export function cardSideFor(area: Area, grid: Grid): number {
  const sideFor = (space: number, count: number) => (space - CARD_GAP * (count - 1)) / count;
  return Math.max(
    0,
    Math.floor(Math.min(sideFor(area.width, grid.cols), sideFor(area.height, grid.rows))),
  );
}

/**
 * The grid a Board is dealt on: as many `cardSize` cards as fit in `area`, then
 * trimmed to at most MAX_PAIRS and to an even card count. Each trim removes the
 * row or column that leaves the larger cards, so the Board keeps filling `area`.
 */
export function fitGrid(area: Area, cardSize: number): Grid {
  const fit = (space: number) =>
    Math.max(MIN_GRID_SIDE, Math.floor((space + CARD_GAP) / (cardSize + CARD_GAP)));
  let grid: Grid = { cols: fit(area.width), rows: fit(area.height) };

  const isDealable = ({ cols, rows }: Grid) =>
    cols * rows <= MAX_PAIRS * 2 && (cols * rows) % 2 === 0;

  while (!isDealable(grid)) {
    const fewerCols: Grid = { cols: grid.cols - 1, rows: grid.rows };
    const fewerRows: Grid = { cols: grid.cols, rows: grid.rows - 1 };
    if (fewerCols.cols < MIN_GRID_SIDE) grid = fewerRows;
    else if (fewerRows.rows < MIN_GRID_SIDE) grid = fewerCols;
    else
      grid = cardSideFor(area, fewerCols) >= cardSideFor(area, fewerRows) ? fewerCols : fewerRows;
  }
  return grid;
}

/** Deal a shuffled Board holding each Pokémon exactly twice. */
export function dealBoard(
  pokemon: readonly MemoryPokemon[],
  grid: Grid,
  orientation: DealOrientation,
): Board {
  const cards = pokemon.flatMap((p) => [
    { key: `${p.id}-a`, pokemon: p },
    { key: `${p.id}-b`, pokemon: p },
  ]);
  return { ...grid, cards: shuffle(cards), orientation };
}

export function newGame(board: Board): GameState {
  return { board, phase: "ready", flipped: [], matchedIds: [], startedAt: null, finishedAt: null };
}

export function canFlip(state: GameState, index: number): boolean {
  return (
    state.phase === "playing" &&
    state.flipped.length < 2 &&
    !state.flipped.includes(index) &&
    !state.matchedIds.includes(state.board.cards[index].pokemon.id)
  );
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "start":
      if (state.phase !== "ready") return state;
      return { ...state, phase: "playing", startedAt: action.now };

    case "flip": {
      if (!canFlip(state, action.index)) return state;
      const flipped = [...state.flipped, action.index];
      if (flipped.length < 2) return { ...state, flipped };

      const [first, second] = flipped.map((i) => state.board.cards[i].pokemon.id);
      if (first !== second) return { ...state, flipped };

      const matchedIds = [...state.matchedIds, first];
      const finished = matchedIds.length * 2 === state.board.cards.length;
      return {
        ...state,
        flipped: [],
        matchedIds,
        phase: finished ? "finished" : "playing",
        finishedAt: finished ? action.now : null,
      };
    }

    case "settleMismatch":
      return state.flipped.length === 2 ? { ...state, flipped: [] } : state;
  }
}

/**
 * Counter-clockwise quarter-turns to apply to a Board so its cards stay in the
 * same physical spots as the device turns. The screen's angle says exactly how
 * far a device has turned; a desktop window's angle never changes, so reshaping
 * the window past square is treated as one clockwise turn, undone on the way back.
 */
export function quarterTurns(dealt: DealOrientation, current: DealOrientation): number {
  const deviceTurns = ((Math.round((current.angle - dealt.angle) / 90) % 4) + 4) % 4;
  if (deviceTurns !== 0) return deviceTurns;
  return current.landscape === dealt.landscape ? 0 : 3;
}

export interface Arrangement extends Grid {
  /** Card indexes in on-screen reading order. */
  order: number[];
}

/** Lay out a dealt grid after `turns` counter-clockwise quarter-turns. */
export function arrangeCards({ cols, rows }: Grid, turns: number): Arrangement {
  const displayCols = turns % 2 === 0 ? cols : rows;
  const displayRows = turns % 2 === 0 ? rows : cols;
  const order = new Array<number>(cols * rows);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let r = row;
      let c = col;
      let side = cols;
      let otherSide = rows;
      for (let turn = 0; turn < turns; turn++) {
        [r, c] = [side - 1 - c, r];
        [side, otherSide] = [otherSide, side];
      }
      order[r * displayCols + c] = row * cols + col;
    }
  }
  return { cols: displayCols, rows: displayRows, order };
}

export function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function defaultCardSize(viewport: Area): number {
  return Math.min(viewport.width, viewport.height) < 600 ? 80 : 140;
}
