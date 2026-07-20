import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, useTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import useMediaQuery from '@mui/material/useMediaQuery'
import MenuIcon from '@mui/icons-material/Menu'
import { theme } from './theme'
import { Sidebar } from './components/Sidebar'
import { DetailView } from './components/DetailView'
import { FiltersProvider } from './hooks/FiltersContext'
import { usePokemonList } from './hooks/usePokemonList'
import { usePokemonDetail } from './hooks/usePokemonDetail'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, retry: 3 },
  },
})

function AppContent() {
  const activeTheme = useTheme()
  const isMobile = useMediaQuery(activeTheme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { filteredPokemon, error: listError } = usePokemonList()
  const {
    pokeData,
    speciesData,
    evoChain,
    loading,
    error: detailError,
  } = usePokemonDetail(selectedId)

  function handleSelect(id: string) {
    setSelectedId(id)
    if (isMobile) setMobileOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: t => t.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="h1"
              sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2 }}
            >
              Pokédex
            </Typography>
          </Toolbar>
        </AppBar>
      )}
      <Sidebar
        filteredPokemon={filteredPokemon}
        onSelect={handleSelect}
        selectedId={selectedId}
        variant={isMobile ? 'temporary' : 'permanent'}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        {isMobile && <Toolbar />}
        <Box
          component="main"
          sx={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: loading || (!pokeData && !listError) ? 'center' : 'flex-start',
            p: { xs: 2, sm: 5 },
            background: 'radial-gradient(circle, #ffffff 0%, #dcdcdc 100%)',
          }}
        >
          {listError && (
            <Typography sx={{ fontSize: 22, color: '#aaa', fontWeight: 300 }}>
              {listError}
            </Typography>
          )}
          {!listError && filteredPokemon.length === 0 && (
            <Typography sx={{ fontSize: 22, color: '#aaa', fontWeight: 300 }}>
              Select a Pokémon to examine
            </Typography>
          )}
          {loading && (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress color="primary" size={50} sx={{ mb: 2 }} />
              <Typography sx={{ color: '#666', fontWeight: 'bold' }}>
                Fetching Data...
              </Typography>
            </Box>
          )}
          {detailError && !loading && (
            <Typography sx={{ fontSize: 22, color: '#aaa', fontWeight: 300 }}>
              Error: {detailError}. Try again.
            </Typography>
          )}
          {pokeData && speciesData && !loading && (
            <DetailView
              key={selectedId}
              pokeData={pokeData}
              speciesData={speciesData}
              evoChain={evoChain}
              onSelectPokemon={setSelectedId}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <FiltersProvider>
          <AppContent />
        </FiltersProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
