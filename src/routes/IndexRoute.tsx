import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link } from "@tanstack/react-router";

export function IndexRoute() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Typography sx={{ fontSize: 22, color: "#aaa", fontWeight: 300 }}>
        Select a Pokémon to examine
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#888" }}>
        or{" "}
        <Link to="/game" style={{ color: "#1976d2" }}>
          play the Who's That Pokémon? game
        </Link>
      </Typography>
    </Box>
  );
}
