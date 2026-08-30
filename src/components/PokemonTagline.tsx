import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { TYPE_COLORS, TYPE_ICONS } from "../utils/constants";
import type { PokemonData, SpeciesData } from "../utils/types";

function cleanFlavorText(text: string): string {
  return text
    .replace(/[\n\f]/g, " ")
    .replace(/­/g, "")
    .replace(/ {2,}/g, " ")
    .trim();
}

function englishGenus(speciesData: SpeciesData): string | null {
  return speciesData.genera?.find((g) => g.language.name === "en")?.genus ?? null;
}

function englishFlavorText(speciesData: SpeciesData): string | null {
  const entry = speciesData.flavor_text_entries?.find((e) => e.language.name === "en");
  return entry ? cleanFlavorText(entry.flavor_text) : null;
}

/**
 * The tagline half of a Pokémon card: type chips, genus (nickname), and a
 * trimmed flavor-text description. It sits on the full-width top card of the
 * card layouts (detail page + Who's That Pokémon?). Flavor text often names the
 * Pokémon, so the game renders `blurFlavor` heavily blurred while the card is
 * obscured instead of readable.
 */
export function PokemonTagline({
  pokeData,
  speciesData,
  blurFlavor = false,
}: {
  pokeData: PokemonData;
  speciesData: SpeciesData;
  blurFlavor?: boolean;
}) {
  const genus = englishGenus(speciesData);
  const flavorText = englishFlavorText(speciesData);
  return (
    <>
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
            filter: blurFlavor ? "blur(10px)" : "none",
            userSelect: blurFlavor ? "none" : "auto",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          "{flavorText}"
        </Typography>
      )}
    </>
  );
}
