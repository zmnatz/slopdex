import { useState, type ReactNode } from 'react'
import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import ButtonBase from '@mui/material/ButtonBase'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import type { PokemonData, SpeciesData, EvolutionStep } from '../utils/types'
import { TYPE_COLORS } from '../utils/constants'
import { MovesModal } from './MovesModal'
import { GamesModal } from './GamesModal'

interface DetailViewProps {
  pokeData: PokemonData
  speciesData: SpeciesData
  evoChain: EvolutionStep[]
  onSelectPokemon?: (id: string) => void
}

function cleanFlavorText(text: string): string {
  return text
    .replace(/[\n\f]/g, ' ')
    .replace(/­/g, '')
    .replace(/  +/g, ' ')
    .trim()
}

function englishGenus(speciesData: SpeciesData): string | null {
  return speciesData.genera?.find(g => g.language.name === 'en')?.genus ?? null
}

function englishFlavorText(speciesData: SpeciesData): string | null {
  const entry = speciesData.flavor_text_entries?.find(e => e.language.name === 'en')
  return entry ? cleanFlavorText(entry.flavor_text) : null
}

function InfoTile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: '#f5f5f5',
        borderRadius: 1.5,
        py: 1.5,
        px: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        height: '100%',
      }}
    >
      <Typography sx={{ fontSize: 11, textTransform: 'uppercase', color: 'text.secondary', fontWeight: 'bold' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 16, fontWeight: 'bold' }}>{value}</Typography>
    </Paper>
  )
}

export function DetailView({ pokeData, speciesData, evoChain, onSelectPokemon }: DetailViewProps) {
  const [openModal, setOpenModal] = useState<'moves' | 'games' | null>(null)
  const genName = speciesData?.generation?.name?.split('-').pop()?.toUpperCase() ?? ''
  const genus = englishGenus(speciesData)
  const flavorText = englishFlavorText(speciesData)
  const heightM = (pokeData.height / 10).toFixed(1)
  const weightKg = (pokeData.weight / 10).toFixed(1)

  return (
    <Card
      id="detail-card"
      sx={{
        width: '100%',
        maxWidth: 900,
        borderRadius: '30px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        p: { xs: 2.5, sm: 5 },
        textAlign: 'center',
      }}
    >
      <Box
        component="img"
        src={pokeData.sprites.other['official-artwork'].front_default || pokeData.sprites.front_default}
        alt={pokeData.name}
        sx={{
          width: 300,
          height: 300,
          maxWidth: '100%',
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))',
        }}
      />
      <Typography
        variant="h3"
        component="h2"
        sx={{ fontWeight: 800, textTransform: 'capitalize', color: 'primary.dark', my: 1 }}
      >
        {pokeData.name}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', flexWrap: 'wrap', mb: 2.5 }}>
        {pokeData.types.map(t => (
          <Chip
            key={t.slot}
            label={t.type.name}
            sx={{
              bgcolor: TYPE_COLORS[t.type.name] || '#999',
              color: '#fff',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              boxShadow: '0 3px 0 rgba(0,0,0,0.2)',
            }}
          />
        ))}
      </Stack>
      {genus && (
        <Typography sx={{ fontSize: 18, color: 'text.secondary', mt: -0.5, mb: 1.5, fontWeight: 500 }}>
          {genus}
        </Typography>
      )}
      {flavorText && (
        <Typography sx={{ fontStyle: 'italic', color: '#666', fontSize: 15, lineHeight: 1.5, mb: 2.5, px: 2.5 }}>
          "{flavorText}"
        </Typography>
      )}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <InfoTile label="Height" value={`${heightM} m`} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <InfoTile label="Weight" value={`${weightKg} kg`} />
        </Grid>
        {pokeData.base_experience != null && (
          <Grid size={{ xs: 6, sm: 3 }}>
            <InfoTile label="Base XP" value={pokeData.base_experience} />
          </Grid>
        )}
        <Grid size={{ xs: 6, sm: 3 }}>
          <InfoTile
            label="Cry"
            value={
              <Button
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<PlayArrowIcon />}
                aria-label="Play cry"
                onClick={() => {
                  const audio = new Audio(pokeData.cries.latest)
                  audio.volume = 0.3
                  audio.play()
                }}
              >
                Play
              </Button>
            }
          />
        </Grid>
      </Grid>
      {pokeData.abilities && pokeData.abilities.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontSize: 16, textTransform: 'uppercase', color: 'text.secondary', fontWeight: 800, mb: 1.25 }}>
            Abilities
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            {pokeData.abilities
              .sort((a, b) => a.slot - b.slot)
              .map(a => (
                <Chip
                  key={a.slot}
                  label={
                    <>
                      {a.ability.name.replace('-', ' ')}
                      {a.is_hidden && (
                        <Box component="span" sx={{ fontSize: 11, fontWeight: 400, opacity: 0.8 }}>
                          {' '}(hidden)
                        </Box>
                      )}
                    </>
                  }
                  sx={{
                    bgcolor: '#e3f2fd',
                    color: '#1565c0',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    opacity: a.is_hidden ? 0.7 : 1,
                    fontStyle: a.is_hidden ? 'italic' : 'normal',
                  }}
                />
              ))}
          </Stack>
        </Box>
      )}
      {pokeData.moves.length > 0 && (
        <Box className="moves-section" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontSize: 16, textTransform: 'uppercase', color: 'text.secondary', fontWeight: 800, mb: 1 }}>
            Moves
          </Typography>
          <Button
            className="section-action-button"
            variant="outlined"
            color="secondary"
            onClick={() => setOpenModal('moves')}
          >
            View Moves
          </Button>
        </Box>
      )}
      {pokeData.game_indices.length > 0 && (
        <Box className="games-section" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontSize: 16, textTransform: 'uppercase', color: 'text.secondary', fontWeight: 800, mb: 1 }}>
            Games
          </Typography>
          <Button
            className="section-action-button"
            variant="outlined"
            color="secondary"
            onClick={() => setOpenModal('games')}
          >
            View Games
          </Button>
        </Box>
      )}
      {genName && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3.5 }}>
          <Chip
            label={`Gen ${genName}`}
            size="small"
            color="secondary"
            sx={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 }}
          />
        </Box>
      )}
      <Grid container spacing={2.5} sx={{ textAlign: 'left', my: 4, p: 2.5, bgcolor: '#f9f9f9', borderRadius: '20px' }}>
        {pokeData.stats.map(s => {
          const name = s.stat.name.replace('-', ' ')
          const val = s.base_stat
          const perc = (val / 255) * 100
          return (
            <Grid key={s.stat.name} size={{ xs: 12, sm: 6 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', mb: 0.5 }}>
                {name}: {val}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={perc}
                color="secondary"
                sx={{ height: 10, borderRadius: 5, bgcolor: '#ddd' }}
              />
            </Grid>
          )
        })}
      </Grid>
      {evoChain.length > 0 && (
        <Box className="evolution-section" sx={{ mt: 5, borderTop: '2px solid #eee', pt: 3.5 }}>
          <Typography variant="h6" sx={{ fontSize: 22, color: '#555', mb: 2.5, textTransform: 'uppercase', fontWeight: 800 }}>
            Evolution Chain
          </Typography>
          <Stack
            className="evolution-chain"
            direction="row"
            spacing={2.5}
            sx={{ alignItems: 'center', justifyContent: 'center', overflowX: 'auto', pb: 2.5 }}
          >
            {evoChain.map((step, i) => (
              <Stack key={step.id} direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
                <ButtonBase
                  className="evo-step"
                  onClick={() => onSelectPokemon?.(step.id)}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: 120,
                    p: 1.875,
                    bgcolor: '#fff',
                    border: '2px solid #eee',
                    borderRadius: '15px',
                    transition: 'transform 0.2s, border-color 0.2s',
                    '&:hover': { transform: 'scale(1.05)', borderColor: 'secondary.main' },
                  }}
                >
                  <Box
                    component="img"
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${step.id}.png`}
                    alt={step.name}
                    sx={{ width: 80, height: 80 }}
                  />
                  <Typography sx={{ textTransform: 'capitalize', fontWeight: 'bold', fontSize: 14, mt: 1 }}>
                    {step.name}
                  </Typography>
                </ButtonBase>
                {i < evoChain.length - 1 && <ArrowForwardIcon sx={{ color: '#ccc', fontSize: 28 }} />}
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
      {openModal === 'moves' && (
        <MovesModal moves={pokeData.moves} onClose={() => setOpenModal(null)} />
      )}
      {openModal === 'games' && (
        <GamesModal gameIndices={pokeData.game_indices} onClose={() => setOpenModal(null)} />
      )}
    </Card>
  )
}
