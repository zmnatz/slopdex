import Box from "@mui/material/Box";

/** The Poké Ball drawn on card backs, in proportion to `size` pixels. */
export function PokeBall({ size = 140 }: { size?: number }) {
  return (
    <Box sx={{ position: "relative", width: size, height: size }}>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "linear-gradient(to bottom, #ee1515 0 49.4%, #222 49.4% 50.6%, #fff 50.6% 100%)",
          boxShadow: `0 0 0 ${size / 14}px #222`,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: size * (2 / 7),
          height: size * (2 / 7),
          boxSizing: "border-box",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          bgcolor: "#fff",
          border: `${size * (4 / 70)}px solid #222`,
        }}
      />
    </Box>
  );
}
