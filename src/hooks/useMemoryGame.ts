import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { pokeApi } from "../utils/api";
import { playCry } from "../utils/cry";
import {
  type Area,
  canFlip,
  dealBoard,
  fitGrid,
  gameReducer,
  type GameState,
  MISMATCH_DELAY_MS,
  type MemoryPokemon,
  newGame,
  shuffle,
} from "../utils/memoryGame";
import { getArtworkUrl } from "../utils/pokemon";
import { TOTAL_POKEMON } from "./useGameRound";

const LOAD_CONCURRENCY = 6;
/** Failed Pokémon replaced before a deal gives up: more than this suggests an outage. */
const MAX_REPLACEMENTS = 5;

export function readScreenAngle(): number {
  return window.screen.orientation?.angle ?? 0;
}

async function loadOne(client: QueryClient, id: number): Promise<MemoryPokemon> {
  const stringId = String(id);
  const pokeData = await client.fetchQuery({
    queryKey: ["pokemon", stringId],
    queryFn: () => pokeApi.getPokemon(stringId),
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });
  // A Board keeps its own copy of the artwork, so these needn't stay cached
  // beyond the query client's default once the Board is gone.
  const artworkSrc = await client.fetchQuery({
    queryKey: ["artwork", stringId],
    queryFn: () => pokeApi.getArtworkBase64(getArtworkUrl(pokeData)),
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });
  return { id, name: pokeData.name, artworkSrc, pokeData };
}

/**
 * Load `count` Pokémon, starting from `kept`. One that fails to load is quietly
 * replaced by another random draw; rejects only after MAX_REPLACEMENTS failures.
 */
async function loadPokemon(
  client: QueryClient,
  count: number,
  kept: MemoryPokemon[],
): Promise<MemoryPokemon[]> {
  const keptIds = new Set(kept.map((p) => p.id));
  const allIds = Array.from({ length: TOTAL_POKEMON }, (_, i) => i + 1);
  const pool = shuffle(allIds.filter((id) => !keptIds.has(id)));
  const loaded = [...kept];
  let inFlight = 0;
  let failures = 0;

  const worker = async () => {
    while (loaded.length + inFlight < count) {
      if (failures > MAX_REPLACEMENTS) throw new Error("Too many Pokémon failed to load");
      const id = pool.pop();
      if (id === undefined) throw new Error("Ran out of Pokémon to draw");
      inFlight++;
      try {
        loaded.push(await loadOne(client, id));
      } catch {
        failures++;
      } finally {
        inFlight--;
      }
    }
  };

  await Promise.all(Array.from({ length: LOAD_CONCURRENCY }, worker));
  return loaded;
}

function pokemonOn(game: GameState | null): MemoryPokemon[] {
  if (!game) return [];
  return [...new Map(game.board.cards.map((c) => [c.pokemon.id, c.pokemon])).values()];
}

/**
 * One session of Memory Match: dealing Boards (once `area` is first known),
 * playing them, and the cries and mismatch delay that go with play.
 */
export function useMemoryGame(area: Area | null, cardSize: number) {
  const client = useQueryClient();
  const [game, setGame] = useState<GameState | null>(null);
  const [status, setStatus] = useState<"loading" | "idle" | "error">("loading");
  // Only the newest deal may land; a slider release can supersede one in flight.
  const latestDeal = useRef(0);
  const currentCry = useRef<HTMLAudioElement | null>(null);

  const deal = async (size: number, keep: MemoryPokemon[]) => {
    if (!area) return;
    const dealId = ++latestDeal.current;
    const grid = fitGrid(area, size);
    const pairs = (grid.cols * grid.rows) / 2;
    const orientation = { angle: readScreenAngle(), landscape: area.width > area.height };
    const kept = shuffle(keep).slice(0, pairs);

    if (kept.length < pairs) {
      setGame(null);
      setStatus("loading");
    }
    try {
      const pokemon = await loadPokemon(client, pairs, kept);
      if (dealId !== latestDeal.current) return;
      setGame(newGame(dealBoard(pokemon, grid, orientation)));
      setStatus("idle");
    } catch {
      if (dealId !== latestDeal.current) return;
      setGame(null);
      setStatus("error");
    }
  };

  const hasDealt = useRef(false);
  useEffect(() => {
    if (!area || hasDealt.current) return;
    hasDealt.current = true;
    void deal(cardSize, []);
    // Only the first measured area triggers a deal; later changes must not re-deal.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [area]);

  const mismatchPending = game?.flipped.length === 2;
  useEffect(() => {
    if (!mismatchPending) return;
    const timer = setTimeout(
      () => setGame((g) => g && gameReducer(g, { type: "settleMismatch" })),
      MISMATCH_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [mismatchPending]);

  useEffect(() => () => currentCry.current?.pause(), []);

  return {
    game,
    status,
    start: () => setGame((g) => g && gameReducer(g, { type: "start", now: Date.now() })),
    flip: (index: number) => {
      if (!game || !canFlip(game, index)) return;
      currentCry.current?.pause();
      currentCry.current = playCry(game.board.cards[index].pokemon.pokeData);
      setGame(gameReducer(game, { type: "flip", index, now: Date.now() }));
    },
    /** Deal a new Board at `size`, keeping as many of the current Pokémon as fit. */
    resize: (size: number) => void deal(size, pokemonOn(game)),
    /** Deal a Board of newly drawn Pokémon. */
    dealNew: () => void deal(cardSize, []),
  };
}
