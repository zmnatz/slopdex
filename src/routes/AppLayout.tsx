import { Suspense, useCallback, useState } from 'react'
import { Outlet, useParams } from '@tanstack/react-router'
import { QueryErrorResetBoundary, useIsFetching } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import LinearProgress from '@mui/material/LinearProgress'
import useMediaQuery from '@mui/material/useMediaQuery'
import MenuIcon from '@mui/icons-material/Menu'
import { Sidebar } from '../components/Sidebar'
import { usePokemonList } from '../hooks/usePokemonList'

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ width: '100%', minHeight: '60vh', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </Box>
  )
}

function DetailPendingFallback() {
  return (
    <CenteredMessage>
      <CircularProgress color="primary" size={50} />
      <Typography sx={{ color: '#666', fontWeight: 'bold' }}>Fetching Data...</Typography>
    </CenteredMessage>
  )
}

function DetailErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return (
    <CenteredMessage>
      <Typography sx={{ fontSize: 22, color: '#aaa', fontWeight: 300 }}>
        Failed to load Pokémon data.
      </Typography>
      <Button variant="outlined" color="secondary" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </CenteredMessage>
  )
}

export function AppLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const { filteredPokemon, error: listError } = usePokemonList()
  // Non-strict: resolves to { id: string } on /pokemon/$id, {} on /.
  // The URL is the sole source of truth for which Pokémon is selected.
  const { id: selectedId } = useParams({ strict: false })
  // Link navigations run inside React.startTransition (TanStack Router's
  // Transitioner), so React deliberately keeps the previously-resolved
  // route on screen and suppresses the Suspense fallback below while the
  // next Pokémon's data loads — that's intentional, not a bug (it avoids a
  // flash of "Fetching Data..." on fast transitions). router.state doesn't
  // reflect this either, since there's no route loader — the suspense is
  // purely component-level. useIsFetching reads directly from the query
  // cache instead, so it's accurate regardless: true exactly while a
  // pokemon/species/evolution request for the active Pokémon is in flight.
  const isDetailFetching = useIsFetching({
    predicate: query => {
      const [scope, key] = query.queryKey
      return (scope === 'pokemon' && key !== 'list') || scope === 'species' || scope === 'evolution'
    },
  }) > 0

  const openMobileDrawer = useCallback(() => setMobileOpen(true), [])
  const closeMobileDrawer = useCallback(() => setMobileOpen(false), [])

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {isDetailFetching && (
        <LinearProgress
          color="secondary"
          aria-label="Loading Pokémon"
          sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: t => t.zIndex.drawer + 2 }}
        />
      )}
      {isMobile && (
        <AppBar position="fixed" sx={{ zIndex: t => t.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              aria-label="Open menu"
              onClick={openMobileDrawer}
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
        selectedId={selectedId ?? null}
        variant={isMobile ? 'temporary' : 'permanent'}
        open={mobileOpen}
        onClose={closeMobileDrawer}
        onNavigate={isMobile ? closeMobileDrawer : undefined}
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
            alignItems: 'flex-start',
            p: { xs: 2, sm: 5 },
            background: 'radial-gradient(circle, #ffffff 0%, #dcdcdc 100%)',
          }}
        >
          {listError ? (
            <CenteredMessage>
              <Typography sx={{ fontSize: 22, color: '#aaa', fontWeight: 300 }}>{listError}</Typography>
            </CenteredMessage>
          ) : (
            <QueryErrorResetBoundary>
              {({ reset }) => (
                <ErrorBoundary onReset={reset} fallbackRender={({ resetErrorBoundary }) => (
                  <DetailErrorFallback resetErrorBoundary={resetErrorBoundary} />
                )}>
                  <Suspense fallback={<DetailPendingFallback />}>
                    <Outlet />
                  </Suspense>
                </ErrorBoundary>
              )}
            </QueryErrorResetBoundary>
          )}
        </Box>
      </Box>
    </Box>
  )
}
