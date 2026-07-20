import { memo, useMemo } from 'react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useFilters } from '../hooks/FiltersContext'
import { pokemonIdFromUrl, pokemonName } from '../utils/pokemon'
import { GEN_RANGES } from '../utils/constants'
import { DRAWER_WIDTH } from '../theme'

interface SidebarProps {
  filteredPokemon: { name: string; url: string }[]
  onSelect: (id: string) => void
  selectedId: string | null
  variant: 'permanent' | 'temporary'
  open: boolean
  onClose: () => void
}

interface PokemonRowProps {
  id: string
  name: string
  active: boolean
  onSelect: (id: string) => void
}

/**
 * Memoized so that selecting a Pokémon only re-renders the previously- and
 * newly-active rows, not all ~1000 rows across every expanded generation.
 */
const PokemonRow = memo(function PokemonRow({ id, name, active, onSelect }: PokemonRowProps) {
  return (
    <ListItemButton
      selected={active}
      onClick={() => onSelect(id)}
      sx={{
        color: '#fff',
        borderLeft: '10px solid transparent',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        '&.Mui-selected': {
          bgcolor: 'rgba(0,0,0,0.2)',
          borderLeftColor: '#fff',
        },
        '&.Mui-selected:hover': { bgcolor: 'rgba(0,0,0,0.2)' },
        '&:hover': { bgcolor: 'rgba(0,0,0,0.2)', borderLeftColor: '#fff' },
      }}
    >
      <ListItemAvatar>
        <Avatar
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
          alt={name}
          slotProps={{ img: { loading: 'lazy' } }}
          sx={{ bgcolor: 'transparent', width: 50, height: 50 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={name}
        slotProps={{ primary: { sx: { fontWeight: 600, textTransform: 'capitalize' } } }}
      />
      <Typography sx={{ fontSize: 12, opacity: 0.7, fontFamily: 'monospace', ml: 1 }}>
        #{id.padStart(4, '0')}
      </Typography>
    </ListItemButton>
  )
})

/**
 * Memoized because App re-renders on every fetch-status change while a
 * Pokémon's detail data loads; without this, each of those transitions
 * would re-reconcile the entire ~1000-row list even though Sidebar's own
 * props didn't change.
 */
export const Sidebar = memo(function Sidebar({ filteredPokemon, onSelect, selectedId, variant, open, onClose }: SidebarProps) {
  const { searchTerm, setSearchTerm, genFilter, setGenFilter, typeFilter, setTypeFilter, types } =
    useFilters()

  const pokemonByGen = useMemo(
    () =>
      GEN_RANGES.map(gen => ({
        gen,
        pokemon: filteredPokemon.filter(p => {
          const id = parseInt(pokemonIdFromUrl(p.url))
          return id >= gen.start && id <= gen.end
        }),
      })).filter(g => g.pokemon.length > 0),
    [filteredPokemon],
  )

  const content = (
    <Box
      component="aside"
      aria-label="Pokédex sidebar"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'primary.main' }}
    >
      <Box sx={{ bgcolor: 'primary.dark', color: '#fff', textAlign: 'center', py: 3, px: 2.5 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 900, textTransform: 'uppercase', letterSpacing: 2, textShadow: '2px 2px 0px #000' }}
        >
          Pokédex
        </Typography>
      </Box>
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField
          placeholder="Search all generations..."
          aria-label="Search Pokémon"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
          sx={{ bgcolor: '#fff', borderRadius: 1.5 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Stack direction="row" spacing={1.25}>
          <FormControl size="small" fullWidth sx={{ bgcolor: '#fff', borderRadius: 1 }}>
            <Select
              value={genFilter}
              onChange={e => setGenFilter(e.target.value)}
              inputProps={{ 'aria-label': 'Filter by generation' }}
            >
              <MenuItem value="all">All Generations</MenuItem>
              {GEN_RANGES.map(g => (
                <MenuItem key={g.name} value={g.name}>{g.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth sx={{ bgcolor: '#fff', borderRadius: 1 }}>
            <Select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              inputProps={{ 'aria-label': 'Filter by type' }}
            >
              <MenuItem value="all">All Types</MenuItem>
              {types.map(t => (
                <MenuItem key={t.name} value={t.name}>{pokemonName(t.name)}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {pokemonByGen.map(({ gen, pokemon }) => (
          <Accordion
            key={gen.name}
            defaultExpanded
            disableGutters
            square
            sx={{
              bgcolor: 'transparent',
              color: '#fff',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#fff' }} />}
              sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                <Typography sx={{ fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' }}>
                  {gen.name}
                </Typography>
                <Typography sx={{ fontSize: 12, opacity: 0.8 }}>{pokemon.length}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List disablePadding>
                {pokemon.map(p => {
                  const id = pokemonIdFromUrl(p.url)
                  return (
                    <PokemonRow
                      key={id}
                      id={id}
                      name={p.name}
                      active={selectedId === id}
                      onSelect={onSelect}
                    />
                  )
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  )

  return (
    <Drawer
      variant={variant}
      open={variant === 'permanent' ? true : open}
      onClose={onClose}
      ModalProps={variant === 'temporary' ? { keepMounted: true } : undefined}
      sx={{
        width: variant === 'permanent' ? DRAWER_WIDTH : undefined,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: { xs: '85vw', sm: DRAWER_WIDTH },
          maxWidth: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: variant === 'permanent' ? '8px solid' : 'none',
          borderColor: 'primary.dark',
          boxShadow: '5px 0 15px rgba(0,0,0,0.2)',
        },
      }}
    >
      {content}
    </Drawer>
  )
})
