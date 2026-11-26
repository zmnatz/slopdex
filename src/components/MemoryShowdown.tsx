import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { SHOWDOWN_MS, type MemoryPokemon } from "../utils/memoryGame";

/** Waits for the final card to finish flipping before the teams come out. */
const LEAD_IN_MS = 400;
const FIGHT_MS = 1800;
const RESULT_MS = 600;
/** More than this many per side would crowd the stage; the rest are counted. */
const SHOWN_PER_TEAM = 6;

/**
 * Charge from off-stage, then lunge at the other side three times. `dir` is 1
 * for the left side. Distances are in % of the side's half of the stage, so
 * 50% would carry its centre to the stage's centre: the sides meet a bit short.
 */
const charge = (dir: 1 | -1) => keyframes`
  0% { transform: translateX(${dir * -100}%); opacity: 0; }
  22% { transform: translateX(0); opacity: 1; }
  34% { transform: translateX(${dir * 30}%); }
  42% { transform: translateX(${dir * -4}%); }
  56% { transform: translateX(${dir * 30}%); }
  64% { transform: translateX(${dir * -4}%); }
  80% { transform: translateX(${dir * 36}%); }
  100% { transform: translateX(0); }
`;
const CHARGE = { 1: charge(1), [-1]: charge(-1) };

/** A burst at the centre each time the sides collide. */
const impact = keyframes`
  0%, 30% { opacity: 0; transform: scale(0.3); }
  34% { opacity: 1; transform: scale(1); }
  42%, 52% { opacity: 0; transform: scale(1.4); }
  56% { opacity: 1; transform: scale(1); }
  64%, 76% { opacity: 0; transform: scale(1.4); }
  80% { opacity: 1; transform: scale(1.3); }
  100% { opacity: 0; transform: scale(1.8); }
`;

const win = keyframes`
  0% { transform: none; }
  40% { transform: translateY(-28px) scale(1.15); }
  70% { transform: translateY(0) scale(1.08); }
  100% { transform: translateY(-10px) scale(1.12); }
`;
const lose = (dir: 1 | -1) => keyframes`
  0% { transform: none; opacity: 1; filter: none; }
  100% { transform: translateY(40px) rotate(${dir * -25}deg); opacity: 0.35; filter: grayscale(1); }
`;
const LOSE = { 1: lose(1), [-1]: lose(-1) };
const tie = keyframes`
  0%, 100% { transform: none; }
  50% { transform: translateY(-16px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function Team({
  label,
  color,
  team,
  dir,
  outcome,
}: {
  label: string;
  color: string;
  team: MemoryPokemon[];
  dir: 1 | -1;
  outcome: "win" | "lose" | "tie";
}) {
  const result = outcome === "win" ? win : outcome === "lose" ? LOSE[dir] : tie;
  const extra = team.length - SHOWN_PER_TEAM;
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        animation: `${CHARGE[dir]} ${FIGHT_MS}ms ease-in-out ${LEAD_IN_MS}ms both`,
      }}
    >
      <Box
        role="group"
        aria-label={`${label}'s team`}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          animation: `${result} ${RESULT_MS}ms ease-out ${LEAD_IN_MS + FIGHT_MS}ms both`,
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: 22, color, textShadow: "0 2px 6px #000" }}>
          {label}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, team.length))}, auto)`,
            justifyItems: "center",
            gap: 1,
          }}
        >
          {team.slice(0, SHOWN_PER_TEAM).map((pokemon) => (
            <Box
              key={pokemon.id}
              component="img"
              src={pokemon.artworkSrc}
              alt={pokemon.name}
              draggable={false}
              sx={{
                width: "clamp(56px, 14vmin, 160px)",
                height: "clamp(56px, 14vmin, 160px)",
                objectFit: "contain",
                filter: `drop-shadow(0 0 10px ${color})`,
                // Official artwork mostly faces left, so the left side turns to face its opponent.
                transform: dir === 1 ? "scaleX(-1)" : undefined,
              }}
            />
          ))}
        </Box>
        {extra > 0 && (
          <Typography sx={{ fontWeight: 700, color: "#fff" }}>+{extra} more</Typography>
        )}
      </Box>
    </Box>
  );
}

/**
 * The end of a 2-player game: each player's team charges the other and they
 * clash, then the winners leap and the losers fall. `children` (the result)
 * appears once it's over, SHOWDOWN_MS after the final match.
 */
export function MemoryShowdown({
  teams,
  labels,
  colors,
  winners,
  children,
}: {
  teams: MemoryPokemon[][];
  labels: string[];
  colors: string[];
  /** The player(s) with the highest score: both on a tie. */
  winners: number[];
  children: React.ReactNode;
}) {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [over, setOver] = useState(reducedMotion);

  useEffect(() => {
    if (over) return;
    const timer = setTimeout(() => setOver(true), SHOWDOWN_MS);
    return () => clearTimeout(timer);
  }, [over]);

  const outcome = (player: number) =>
    winners.length > 1 ? "tie" : winners[0] === player ? "win" : "lose";

  return (
    <>
      {!reducedMotion && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            bgcolor: "rgba(10, 10, 24, 0.78)",
            animation: `${fadeIn} ${LEAD_IN_MS}ms ease-out both`,
          }}
        >
          {[0, 1].map((player) => (
            <Team
              key={player}
              label={labels[player]}
              color={colors[player]}
              team={teams[player]}
              dir={player === 0 ? 1 : -1}
              outcome={outcome(player)}
            />
          ))}
          <Box
            aria-hidden
            sx={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 160,
              height: 160,
              ml: "-80px",
              mt: "-80px",
              borderRadius: "50%",
              background: "radial-gradient(circle, #fff 0%, #ffeb3b 35%, rgba(255,152,0,0) 70%)",
              animation: `${impact} ${FIGHT_MS}ms ease-in-out ${LEAD_IN_MS}ms both`,
              pointerEvents: "none",
            }}
          />
        </Box>
      )}
      {over && children}
    </>
  );
}
