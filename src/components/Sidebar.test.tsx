import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FiltersProvider } from '../hooks/FiltersContext'
import { renderWithRouter } from '../test-utils/renderWithRouter'
import { Sidebar } from './Sidebar'

function renderSidebar(props: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const defaultProps: React.ComponentProps<typeof Sidebar> = {
    filteredPokemon: [
      { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    ],
    selectedId: null,
    variant: 'permanent',
    open: true,
    onClose: () => {},
  }
  return renderWithRouter(
    <QueryClientProvider client={qc}>
      <FiltersProvider>
        <Sidebar {...defaultProps} {...props} />
      </FiltersProvider>
    </QueryClientProvider>,
  )
}

describe('Sidebar', () => {
  it('renders the Pokédex title', async () => {
    await renderSidebar()
    expect(screen.getByRole('heading', { name: 'Pokédex' })).toBeTruthy()
  })

  it('renders search input', async () => {
    await renderSidebar()
    expect(screen.getByPlaceholderText('Search all generations...')).toBeTruthy()
  })

  it('renders pokemon items as links', async () => {
    await renderSidebar()
    expect(screen.getByRole('link', { name: /pikachu/i })).toBeTruthy()
  })

  it('links a pokemon item to its detail route', async () => {
    await renderSidebar()
    const link = screen.getByRole('link', { name: /pikachu/i })
    expect(link.getAttribute('href')).toBe('/pokemon/25')
  })

  it('marks the selected pokemon as active', async () => {
    await renderSidebar({ selectedId: '25' })
    const link = screen.getByRole('link', { name: /pikachu/i })
    expect(link.className).toContain('Mui-selected')
  })

  it('calls onNavigate when a pokemon item is clicked', async () => {
    const onNavigate = vi.fn()
    await renderSidebar({ onNavigate })
    fireEvent.click(screen.getByRole('link', { name: /pikachu/i }))
    expect(onNavigate).toHaveBeenCalled()
  })
})
