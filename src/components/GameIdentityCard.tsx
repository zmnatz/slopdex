import ReplayRoundedIcon from "@mui/icons-material/ReplayRounded";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { useEffect, useState } from "react";
import type { PokemonData, SpeciesData } from "../utils/types";
import { PokemonCard } from "./PokemonCard";

function PokeBall() {
  return (
    <Box sx={{ position: "relative", width: 140, height: 140 }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "linear-gradient(to bottom, #ee1515 0 49.4%, #222 49.4% 50.6%, #fff 50.6% 100%)",
          boxShadow: "0 0 0 10px #222",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 40,
          height: 40,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          bgcolor: "#fff",
          border: "8px solid #222",
        }}
      />
    </Box>
  );
}

/**
 * The Who's That Pokémon? card. Wraps `PokemonCard` in a full-card flip shell
 * for round transitions. `masked` controls the identity flip (silhouette vs real).
 */
export function GameIdentityCard({
  pokeData,
  speciesData,
  flipping = false,
  onNext,
}: {
  pokeData: PokemonData;
  speciesData: SpeciesData;
  flipping?: boolean;
  onNext: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const masked = !revealed;
  useEffect(() => {
    if (flipping) {
      setRevealed(false);
    }
  }, [flipping]);

  const flipAction = (
    <IconButton
      aria-label="Flip"
      color="primary"
      onClick={(event) => {
        event.stopPropagation();
        setRevealed((r) => !r);
      }}
      size="small"
    >
      <ReplayRoundedIcon fontSize="small" />
    </IconButton>
  );

  return (
    <Box
      data-testid="flip-card"
      sx={{
        width: "100%",
        mb: 3,
        perspective: "1000px",
        cursor: flipping ? "default" : "pointer",
      }}
      onClick={masked ? () => setRevealed(true) : onNext}
    >
      <Box
        sx={{
          position: "relative",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
          transform: flipping ? "rotateY(180deg)" : "rotateY(0deg)",
          pointerEvents: flipping ? "none" : "auto",
        }}
      >
        <Box sx={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
          <PokemonCard
            pokeData={pokeData}
            speciesData={speciesData}
            action={flipAction}
            masked={masked}
          />
        </Box>

        <Box
          aria-hidden={!flipping}
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            bgcolor: "#1c1c2e",
            borderRadius: "30px",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <PokeBall />
          <Box
            component="span"
            sx={{ color: "#fff", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}
          >
            Who&apos;s That Pokémon?
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
