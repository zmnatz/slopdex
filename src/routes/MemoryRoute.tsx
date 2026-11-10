import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Slider from "@mui/material/Slider";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { MemoryCard } from "../components/MemoryCard";
import { readScreenAngle, useMemoryGame } from "../hooks/useMemoryGame";
import { LinkedIconButton } from "../utils/linkedComponents";
import {
  type Area,
  arrangeCards,
  CARD_GAP,
  CARD_SIZE_STEP,
  cardSideFor,
  defaultCardSize,
  formatElapsed,
  type GameState,
  type PlayerCount,
  MAX_CARD_SIZE,
  MIN_CARD_SIZE,
  quarterTurns,
  winners,
} from "../utils/memoryGame";

const SOLO_MATCH_COLOR = "#43a047";
const PLAYER_COLORS = ["#1e88e5", "#fb8c00"];
const playerName = (player: number) => `Player ${player + 1}`;

function Scoreboard({ game }: { game: GameState }) {
  return (
    <Box
      data-testid="scoreboard"
      sx={{ display: "flex", justifyContent: "center", gap: 2, py: 0.75, px: 1, flexShrink: 0 }}
    >
      {game.scores.map((score, player) => {
        const active = game.phase === "playing" && game.currentPlayer === player;
        return (
          <Box
            key={player}
            aria-current={active ? "true" : undefined}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontWeight: 900,
              color: active ? "#fff" : PLAYER_COLORS[player],
              bgcolor: active ? PLAYER_COLORS[player] : "transparent",
              border: `3px solid ${PLAYER_COLORS[player]}`,
              transition: "background-color 0.2s, color 0.2s",
            }}
          >
            <span>{playerName(player)}</span>
            <span aria-label={`${playerName(player)} score`}>{score}</span>
          </Box>
        );
      })}
    </Box>
  );
}

function finalMessage(game: GameState): string {
  const time = formatElapsed((game.finishedAt ?? 0) - (game.startedAt ?? 0));
  if (game.players === 1) return `All matched! ${time}`;
  const leaders = winners(game);
  return leaders.length === 1 ? `${playerName(leaders[0])} wins!` : "It's a tie!";
}

const CARD_SIZE_STORAGE_KEY = "slopdex.memory.cardSize";

function readSavedCardSize(): number | null {
  try {
    const saved = Number(localStorage.getItem(CARD_SIZE_STORAGE_KEY));
    return saved >= MIN_CARD_SIZE && saved <= MAX_CARD_SIZE ? saved : null;
  } catch {
    return null;
  }
}

function saveCardSize(size: number) {
  try {
    localStorage.setItem(CARD_SIZE_STORAGE_KEY, String(size));
  } catch {
    // Without storage the size just isn't remembered.
  }
}

function subscribeToScreenAngle(onChange: () => void) {
  const orientation = window.screen.orientation;
  orientation?.addEventListener("change", onChange);
  return () => orientation?.removeEventListener("change", onChange);
}

function useMeasuredArea() {
  const ref = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState<Area | null>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const { clientWidth: width, clientHeight: height } = element;
      setArea((prev) => {
        if (!width || !height) return null;
        return prev?.width === width && prev.height === height ? prev : { width, height };
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, area };
}

/** Isolated so its ticks don't re-render the Board. */
function Timer({ game }: { game: GameState | null }) {
  const startedAt = game?.startedAt ?? null;
  const finishedAt = game?.finishedAt ?? null;
  const [now, setNow] = useState(() => Date.now());
  const running = startedAt !== null && finishedAt === null;

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [running]);

  const elapsed = startedAt === null ? 0 : Math.max(0, (finishedAt ?? now) - startedAt);
  return (
    <Typography
      role="timer"
      aria-label="Time"
      sx={{
        fontWeight: 900,
        fontVariantNumeric: "tabular-nums",
        minWidth: "3.5em",
        textAlign: "right",
      }}
    >
      {formatElapsed(elapsed)}
    </Typography>
  );
}

function CenteredOverlay({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        "& > *": { pointerEvents: "auto" },
      }}
    >
      {children}
    </Box>
  );
}

export function MemoryRoute() {
  const { ref: boardAreaRef, area } = useMeasuredArea();
  const [cardSize, setCardSize] = useState(
    () =>
      readSavedCardSize() ??
      defaultCardSize({ width: window.innerWidth, height: window.innerHeight }),
  );
  const committedSize = useRef(cardSize);
  const { game, status, players, setPlayers, start, flip, resize, dealNew } = useMemoryGame(
    area,
    cardSize,
  );
  const screenAngle = useSyncExternalStore(subscribeToScreenAngle, readScreenAngle);

  const commitCardSize = (size: number) => {
    if (size === committedSize.current) return;
    committedSize.current = size;
    saveCardSize(size);
    resize(size);
  };

  const board = game?.board;
  const arrangement =
    board && area
      ? arrangeCards(
          board,
          quarterTurns(board.orientation, {
            angle: screenAngle,
            landscape: area.width > area.height,
          }),
        )
      : null;
  const side = arrangement && area ? cardSideFor(area, arrangement) : 0;
  const locked = game !== null && game.phase !== "ready";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100dvh",
        background: "radial-gradient(circle, #ffffff 0%, #dcdcdc 100%)",
      }}
    >
      <Box
        component="header"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexShrink: 0,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          minHeight: 48,
          pt: "env(safe-area-inset-top)",
          pl: "max(8px, env(safe-area-inset-left))",
          pr: "max(16px, env(safe-area-inset-right))",
        }}
      >
        <LinkedIconButton to="/" aria-label="Back to Pokédex" color="inherit">
          <ArrowBackRoundedIcon />
        </LinkedIconButton>
        <ToggleButtonGroup
          exclusive
          size="small"
          aria-label="Players"
          value={players}
          disabled={locked}
          onChange={(_, value: PlayerCount | null) => value && setPlayers(value)}
          sx={{
            "& .MuiToggleButton-root": {
              color: "inherit",
              borderColor: "currentColor",
              px: 1.25,
              py: 0.25,
              fontWeight: 700,
              "&.Mui-selected": { color: "inherit", bgcolor: "rgba(255,255,255,0.3)" },
              "&.Mui-disabled": { color: "inherit", opacity: 0.5 },
            },
          }}
        >
          <ToggleButton value={1} aria-label="1 player">
            1P
          </ToggleButton>
          <ToggleButton value={2} aria-label="2 players">
            2P
          </ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0 }}>
          <Slider
            aria-label="Card size"
            size="small"
            min={MIN_CARD_SIZE}
            max={MAX_CARD_SIZE}
            step={CARD_SIZE_STEP}
            value={cardSize}
            disabled={locked}
            onChange={(_, value) => setCardSize(value as number)}
            onChangeCommitted={(_, value) => commitCardSize(value as number)}
            sx={{
              maxWidth: 320,
              color: "inherit",
              "&.Mui-disabled": { color: "inherit", opacity: 0.4 },
            }}
          />
        </Box>
        <Timer game={game} />
      </Box>

      {game && game.players === 2 && <Scoreboard game={game} />}

      <Box sx={{ flex: 1, minHeight: 0, position: "relative", p: 1 }}>
        <Box
          ref={boardAreaRef}
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {board && arrangement && (
            <Box
              data-testid="memory-board"
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${arrangement.cols}, ${side}px)`,
                gap: `${CARD_GAP}px`,
              }}
            >
              {arrangement.order.map((cardIndex) => {
                const card = board.cards[cardIndex];
                const matched = game.matchedIds.includes(card.pokemon.id);
                return (
                  <MemoryCard
                    key={card.key}
                    index={cardIndex}
                    position={cardIndex + 1}
                    name={card.pokemon.name}
                    artworkSrc={card.pokemon.artworkSrc}
                    side={side}
                    matched={matched}
                    matchColor={
                      game.players === 2
                        ? PLAYER_COLORS[game.matchedBy[card.pokemon.id] ?? 0]
                        : SOLO_MATCH_COLOR
                    }
                    faceUp={matched || game.flipped.includes(cardIndex)}
                    disabled={game.phase !== "playing" || matched}
                    onFlip={flip}
                  />
                );
              })}
            </Box>
          )}
        </Box>

        {status === "loading" && (
          <CenteredOverlay>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <CircularProgress color="primary" size={50} />
              <Typography sx={{ color: "#666", fontWeight: "bold" }}>Dealing cards...</Typography>
            </Box>
          </CenteredOverlay>
        )}

        {status === "error" && (
          <CenteredOverlay>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Typography sx={{ fontSize: 22, color: "#888", fontWeight: 300 }}>
                Couldn&apos;t load the cards
              </Typography>
              <Button variant="outlined" color="secondary" onClick={dealNew}>
                Try again
              </Button>
            </Box>
          </CenteredOverlay>
        )}

        {game?.phase === "ready" && (
          <CenteredOverlay>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={start}
              sx={{ fontWeight: 900, fontSize: 24, px: 5, py: 1.5, boxShadow: 6 }}
            >
              Start
            </Button>
          </CenteredOverlay>
        )}

        {game?.phase === "finished" && (
          <CenteredOverlay>
            {/* Delayed so the final card finishes flipping first. */}
            <Fade in timeout={300} style={{ transitionDelay: "450ms" }}>
              <Paper
                role="status"
                elevation={8}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  px: 5,
                  py: 3,
                  borderRadius: 3,
                }}
              >
                <Typography variant="h5" component="p" sx={{ fontWeight: 900 }}>
                  {finalMessage(game)}
                </Typography>
                {game.players === 2 && (
                  <Typography sx={{ fontWeight: 700, fontSize: 20 }}>
                    Final score: {game.scores[0]} – {game.scores[1]}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={dealNew}
                  sx={{ fontWeight: 900 }}
                >
                  Play Again
                </Button>
              </Paper>
            </Fade>
          </CenteredOverlay>
        )}
      </Box>
    </Box>
  );
}
