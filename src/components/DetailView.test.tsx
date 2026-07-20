import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../theme'
import { DetailView } from './DetailView'
import type { PokemonData, SpeciesData, EvolutionStep } from '../utils/types'

function renderDetail(props: React.ComponentProps<typeof DetailView>) {
  return render(
    <ThemeProvider theme={theme}>
      <DetailView {...props} />
    </ThemeProvider>,
  )
}

const mockPokemon: PokemonData = {
  name: 'pikachu',
  sprites: {
    front_default: 'https://example.com/pikachu.png',
    other: {
      'official-artwork': { front_default: 'https://example.com/pikachu-art.png' },
    },
  },
  types: [
    { slot: 1, type: { name: 'electric' } },
  ],
  stats: [
    { base_stat: 55, stat: { name: 'hp' } },
    { base_stat: 90, stat: { name: 'speed' } },
  ],
  abilities: [
    { ability: { name: 'static' }, is_hidden: false, slot: 1 },
    { ability: { name: 'lightning-rod' }, is_hidden: true, slot: 3 },
  ],
  height: 4,
  weight: 60,
  cries: { latest: 'https://example.com/cry.ogg', legacy: '' },
  base_experience: 112,
  moves: [
    { move: { name: 'thunderbolt' } },
    { move: { name: 'quick-attack' } },
  ],
  game_indices: [
    { version: { name: 'red' } },
    { version: { name: 'yellow' } },
  ],
}

const mockSpecies: SpeciesData = {
  generation: { name: 'generation-i' },
  evolution_chain: { url: '' },
  flavor_text_entries: [
    { flavor_text: 'When several of\nthese POKéMON\ngather, their\nelectricity could\nbuild up and cause\nlightning storms.', language: { name: 'en' }, version: { name: 'red' } },
  ],
  genera: [
    { genus: 'Mouse Pokémon', language: { name: 'en' } },
  ],
}

const mockEvoChain: EvolutionStep[] = [
  { name: 'pichu', id: '172' },
  { name: 'pikachu', id: '25' },
  { name: 'raichu', id: '26' },
]

describe('DetailView', () => {
  it('renders pokemon name', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    expect(container.textContent).toContain('pikachu')
  })

  it('renders type badge', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    expect(container.textContent).toContain('electric')
  })

  it('renders generation badge', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    expect(container.textContent).toContain('Gen I')
  })

  it('renders evolution chain', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    expect(container.textContent).toContain('pichu')
    expect(container.textContent).toContain('raichu')
  })

  it('renders stats', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    expect(container.textContent).toContain('hp')
    expect(container.textContent).toContain('speed')
  })

  it('renders genus', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    expect(container.textContent).toContain('Mouse Pokémon')
  })

  it('renders flavor text', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    expect(container.textContent).toContain('When several of these')
  })

  it('renders height and weight', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    expect(container.textContent).toContain('0.4 m')
    expect(container.textContent).toContain('6.0 kg')
  })

  it('renders base experience', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    expect(container.textContent).toContain('112')
  })

  it('renders abilities', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    expect(container.textContent).toContain('static')
    expect(container.textContent).toContain('lightning rod')
    expect(container.textContent).toContain('hidden')
  })

  it('renders cry button', () => {
    renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    const button = screen.getByRole('button', { name: 'Play cry' })
    expect(button).toBeTruthy()
    expect(button.textContent).toContain('Play')
  })

  it('does not render evolution section when chain is empty', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: [] })
    expect(container.querySelector('.evolution-section')).toBeNull()
  })

  it('calls onSelectPokemon when evo step is clicked', () => {
    const onSelect = vi.fn()
    const { container } = renderDetail({
      pokeData: mockPokemon,
      speciesData: mockSpecies,
      evoChain: mockEvoChain,
      onSelectPokemon: onSelect,
    })
    const steps = container.querySelectorAll('.evo-step')
    fireEvent.click(steps[1])
    expect(onSelect).toHaveBeenCalledWith('25')
  })

  it('renders Moves and Games section buttons but no modal by default', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    expect(container.querySelector('.moves-section')).toBeTruthy()
    expect(container.querySelector('.games-section')).toBeTruthy()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('opens the moves modal when View Moves is clicked', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    fireEvent.click(container.querySelector('.moves-section .section-action-button')!)
    const dialog = screen.getByRole('dialog')
    expect(dialog.textContent).toContain('thunderbolt')
  })

  it('opens the games modal when View Games is clicked', () => {
    const { container } = renderDetail({ pokeData: mockPokemon, speciesData: mockSpecies, evoChain: mockEvoChain })
    fireEvent.click(container.querySelector('.games-section .section-action-button')!)
    const dialog = screen.getByRole('dialog')
    expect(dialog.textContent).toContain('red')
  })

  it('does not render moves/games sections when data is empty', () => {
    const { container } = renderDetail({
      pokeData: { ...mockPokemon, moves: [], game_indices: [] },
      speciesData: mockSpecies,
      evoChain: mockEvoChain,
    })
    expect(container.querySelector('.moves-section')).toBeNull()
    expect(container.querySelector('.games-section')).toBeNull()
  })
})
