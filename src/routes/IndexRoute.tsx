import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

export function IndexRoute() {
  return (
    <Box sx={{ width: '100%', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography sx={{ fontSize: 22, color: '#aaa', fontWeight: 300 }}>
        Select a Pokémon to examine
      </Typography>
    </Box>
  )
}
