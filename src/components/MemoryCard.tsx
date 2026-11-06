import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { memo } from "react";
import { PokeBall } from "./PokeBall";

const FACE_SX = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "inherit",
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
} as const;

/** A square Memory Match card: a Poké Ball back and an artwork-only front. */
export const MemoryCard = memo(function MemoryCard({
  position,
  name,
  artworkSrc,
  side,
  faceUp,
  matched,
  disabled,
  index,
  onFlip,
}: {
  position: number;
  name: string;
  artworkSrc: string;
  side: number;
  faceUp: boolean;
  matched: boolean;
  disabled: boolean;
  index: number;
  onFlip: (index: number) => void;
}) {
  const state = matched ? `${name}, matched` : faceUp ? name : "face down";
  return (
    <ButtonBase
      disableRipple
      disabled={disabled}
      onClick={() => onFlip(index)}
      aria-label={`Card ${position}, ${state}`}
      data-testid="memory-card"
      sx={{
        display: "block",
        width: side,
        height: side,
        borderRadius: `${Math.round(side * 0.12)}px`,
        perspective: `${side * 5}px`,
        "&:focus-visible": { outline: "3px solid", outlineColor: "secondary.main" },
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: "inherit",
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transition: "transform 0.4s cubic-bezier(0.4, 0.2, 0.2, 1)",
          transform: faceUp ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <Box sx={{ ...FACE_SX, bgcolor: "#1c1c2e", boxShadow: 2 }}>
          <PokeBall size={side * 0.6} />
        </Box>
        <Box
          sx={{
            ...FACE_SX,
            transform: "rotateY(180deg)",
            bgcolor: "#fff",
            boxShadow: matched ? "0 0 0 3px #43a047" : 2,
          }}
        >
          <Box
            component="img"
            src={artworkSrc}
            alt=""
            draggable={false}
            sx={{ width: "88%", height: "88%", objectFit: "contain", opacity: matched ? 0.85 : 1 }}
          />
        </Box>
      </Box>
    </ButtonBase>
  );
});
