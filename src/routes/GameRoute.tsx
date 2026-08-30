import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { DetailBody, DetailCard } from "../components/DetailView";
import { GameIdentityCard } from "../components/GameIdentityCard";
import { randomPokemonId, useGameRound } from "../hooks/useGameRound";
import type { PokemonData, SpeciesData } from "../utils/types";

interface Round {
  id: number;
  pokeData: PokemonData;
  speciesData: SpeciesData;
}

function playCry(pokeData: PokemonData) {
  const src = pokeData.cries.latest || pokeData.cries.legacy;
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = 0.3;
  void audio.play();
}

export function GameRoute() {
  const [targetId, setTargetId] = useState(() => randomPokemonId());
  const [round, setRound] = useState<Round | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const { pokeData, speciesData } = useGameRound(targetId);

  // Commit a fetched round once its data is ready. The card flips over to its
  // back mid-turn and the new round commits hidden behind it, so the previous
  // answer never lingers on screen. The app-level LinearProgress bar covers
  // any wait if the fetch is slow.
  useEffect(() => {
    if (pokeData && speciesData && targetId !== round?.id) {
      setRound({ id: targetId, pokeData, speciesData });
      setRevealed(false);
    }
  }, [pokeData, speciesData, targetId, round]);

  // Cry at the start of each round, once per round id.
  const cryRoundId = useRef<number | null>(null);
  useEffect(() => {
    if (!revealed && round && cryRoundId.current !== round.id) {
      cryRoundId.current = round.id;
      playCry(round.pokeData);
    }
  }, [round, revealed]);

  // Full-card flip between rounds: rotate to the back face, swap in the new
  // (obscured) round at the midpoint while the back is showing, then flip back.
  useEffect(() => {
    if (!flipping) return;
    const swapAt = setTimeout(() => {
      setRevealed(false);
      setTargetId(randomPokemonId());
    }, 300);
    const settleAt = setTimeout(() => setFlipping(false), 620);
    return () => {
      clearTimeout(swapAt);
      clearTimeout(settleAt);
    };
  }, [flipping]);

  const draw = useCallback(() => {
    setFlipping(true);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 900,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant="h4"
        component="h2"
        sx={{ fontWeight: 900, textTransform: "uppercase", color: "primary.dark", mb: 0.5 }}
      >
        Who&apos;s That Pokémon?
      </Typography>
      <Typography sx={{ color: "#666", mb: 3 }}>
        Guess who it is from the clues, then click the card to flip it over — click again to hide
        it.
      </Typography>

      {round ? (
        <>
          <GameIdentityCard
            pokeData={round.pokeData}
            speciesData={round.speciesData}
            masked={!revealed}
            flipping={flipping}
            onToggle={() => setRevealed((r) => !r)}
            onNext={draw}
          />
          <DetailCard>
            <DetailBody pokeData={round.pokeData} speciesData={round.speciesData} evoChain={[]} />
          </DetailCard>
        </>
      ) : (
        <Box
          sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, py: 10 }}
        >
          <CircularProgress color="primary" size={50} />
          <Typography sx={{ color: "#666", fontWeight: "bold" }}>Drawing a Pokémon...</Typography>
        </Box>
      )}
    </Box>
  );
}
