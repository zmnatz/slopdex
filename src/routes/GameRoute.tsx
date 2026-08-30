import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef, useState } from "react";
import { DetailBody, DetailCard } from "../components/DetailView";
import { GameIdentityCard } from "../components/GameIdentityCard";
import { buildQueue, refillQueue, useGameRound, usePrefetchBatch } from "../hooks/useGameRound";
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
  const [queue, setQueue] = useState<number[]>(() => buildQueue());
  const [round, setRound] = useState<Round | null>(null);
  const [flipping, setFlipping] = useState(false);
  const targetId = queue[0];
  const { pokeData, speciesData } = useGameRound(targetId);

  usePrefetchBatch(queue.slice(1, 6));

  const drawPokemon = useCallback(() => {
    setFlipping(true);
    setTimeout(() => {
      setQueue((prev) => {
        const shifted = prev.slice(1);
        return shifted.length < 100 ? refillQueue(shifted) : shifted;
      });
    }, 300);
    setTimeout(() => setFlipping(false), 620);
  }, []);

  const drawnForId = useRef<number | null>(null);
  useEffect(() => {
    if (!pokeData || !speciesData) return;
    if (round?.id === targetId) return;
    if (drawnForId.current === targetId) return;
    drawnForId.current = targetId;
    setRound({ id: targetId, pokeData, speciesData });
    playCry(pokeData);
  }, [pokeData, speciesData, targetId, round]);

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
            flipping={flipping}
            onNext={drawPokemon}
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
