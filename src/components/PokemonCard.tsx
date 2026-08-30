import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { TYPE_COLORS, TYPE_ICONS } from "../utils/constants";
import type { PokemonData, SpeciesData } from "../utils/types";
import { PokemonIdentity } from "./PokemonIdentity";

const genLabel = (name: string) => `Gen ${name.replace("generation-", "").toUpperCase()}`;
const cleanFlavor = (text: string) => text.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

export function PokemonCard({
  pokeData,
  speciesData,
  action,
  masked = false,
  clampFlavor = false,
}: {
  pokeData: PokemonData;
  speciesData: SpeciesData;
  action?: ReactNode;
  masked?: boolean;
  clampFlavor?: boolean;
}) {
  const genus = speciesData.genera.find((g) => g.language.name === "en")?.genus ?? "";
  const flavorText = cleanFlavor(
    speciesData.flavor_text_entries.find((f) => f.language.name === "en")?.flavor_text ?? ""
  );

  return (
    <Card
      sx={{
        width: "100%",
        borderRadius: "30px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
        p: 0,
        textAlign: "center",
      }}
    >
      <CardHeader
        title={genLabel(speciesData.generation.name)}
        titleTypographyProps={{ variant: "caption", fontWeight: 600, color: "text.disabled" }}
        action={action}
        sx={{
          px: 2,
          py: 1,
          "& .MuiCardHeader-action": { mr: 0, m: 0 },
          "& .MuiCardHeader-content": { overflow: "visible" },
        }}
      />
      <CardContent
        sx={{
          p: 4,
          pt: 1,
          textAlign: "center",
          minHeight: 600,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)",
            transform: masked ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          <Box sx={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
            <PokemonIdentity pokeData={pokeData} />
          </Box>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <Box
              component="img"
              src={pokeData.sprites.other["official-artwork"].front_default}
              alt="Mystery Pokémon"
              sx={{
                width: 300,
                height: 300,
                objectFit: "contain",
                filter: "brightness(0)",
                opacity: 0.5,
              }}
            />
            <Typography
              variant="h3"
              component="h3"
              sx={{ fontWeight: 900, color: "#333", mt: 1.5, letterSpacing: 2 }}
            >
              ???
            </Typography>
          </Box>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: "center", flexWrap: "wrap", mt: 2.5, mb: 1.5 }}
        >
          {pokeData.types.map((t) => (
            <Chip
              key={t.slot}
              icon={
                <Box component="span" sx={{ fontSize: 18, lineHeight: 1 }}>
                  {TYPE_ICONS[t.type.name] ?? "•"}
                </Box>
              }
              label={t.type.name}
              sx={{
                bgcolor: TYPE_COLORS[t.type.name] || "#999",
                color: "#fff",
                fontWeight: "bold",
                textTransform: "uppercase",
                boxShadow: "0 3px 0 rgba(0,0,0,0.2)",
                "& .MuiChip-icon": { color: "#fff", ml: 1 },
              }}
            />
          ))}
        </Stack>

        {genus && (
          <Typography sx={{ fontSize: 18, color: "text.secondary", mb: 1.5, fontWeight: 500 }}>
            {genus}
          </Typography>
        )}

        {flavorText && (
          <Typography
            sx={{
              fontStyle: "italic",
              color: "#666",
              fontSize: 15,
              lineHeight: 1.5,
              px: 2.5,
              filter: masked ? "blur(10px)" : "none",
              userSelect: masked ? "none" : "auto",
              ...(clampFlavor && {
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }),
            }}
          >
            "{flavorText}"
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
