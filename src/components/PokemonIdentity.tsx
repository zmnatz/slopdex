import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { PokemonData } from "../utils/types";

/**
 * The identity half of a Pokémon card: official artwork + name. `masked`
 * obscures it for guessing (silhouette + ???) without leaking the identity in
 * alt text. Used by the static cards on the detail page and the flip card in
 * Who's That Pokémon?.
 */
export function PokemonIdentity({
  pokeData,
  masked = false,
}: { pokeData: PokemonData; masked?: boolean }) {
  const artwork =
    pokeData.sprites.other["official-artwork"].front_default || pokeData.sprites.front_default;
  return (
    <>
      <Box
        component="img"
        src={artwork}
        alt={masked ? "Mystery Pokémon" : pokeData.name}
        sx={{
          width: 300,
          height: 300,
          maxWidth: "100%",
          filter: masked ? "brightness(0)" : "drop-shadow(0 10px 15px rgba(0,0,0,0.1))",
        }}
      />
      <Typography
        variant="h3"
        component="h2"
        sx={{ fontWeight: 800, textTransform: "capitalize", color: "primary.dark", mt: 1.5 }}
      >
        {masked ? "???" : pokeData.name}
      </Typography>
    </>
  );
}
