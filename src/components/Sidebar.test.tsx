import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FiltersProvider } from '../hooks/FiltersContext'
import { theme } from '../theme'
import { Sidebar } from './Sidebar'

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={qc}>
        <FiltersProvider>{children}</FiltersProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

describe('Sidebar', () => {
  const defaultProps = {
    filteredPokemon: [
      { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    ],
    onSelect: () => {},
    selectedId: null,
    variant: 'permanent' as const,
    open: true,
    onClose: () => {},
  }

  it('renders the Pokédex title', () => {
    render(<Sidebar {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: 'Pokédex' })).toBeTruthy()
  })

  it('renders search input', () => {
    render(<Sidebar {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.getByPlaceholderText('Search all generations...')).toBeTruthy()
  })

  it('renders pokemon items', () => {
    render(<Sidebar {...defaultProps} />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /pikachu/i })).toBeTruthy()
  })

  it('calls onSelect when a pokemon item is clicked', () => {
    const onSelect = vi.fn()
    render(<Sidebar {...defaultProps} onSelect={onSelect} />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /pikachu/i }))
    expect(onSelect).toHaveBeenCalledWith('25')
  })
})
