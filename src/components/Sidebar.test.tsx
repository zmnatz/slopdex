import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FiltersProvider } from '../hooks/FiltersContext'
import { Sidebar } from './Sidebar'

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return (
    <QueryClientProvider client={qc}>
      <FiltersProvider>{children}</FiltersProvider>
    </QueryClientProvider>
  )
}

describe('Sidebar', () => {
  const defaultProps = {
    filteredPokemon: [
      { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
    ],
    onSelect: () => {},
    selectedId: null,
  }

  it('renders the Pokédex title', () => {
    const { container } = render(<Sidebar {...defaultProps} />, { wrapper: Wrapper })
    const headings = container.querySelectorAll('h1')
    expect(headings.length).toBeGreaterThan(0)
    expect(headings[0]?.textContent).toBe('Pokédex')
  })

  it('renders search input', () => {
    const { container } = render(<Sidebar {...defaultProps} />, { wrapper: Wrapper })
    const inputs = container.querySelectorAll('#search-input')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('renders pokemon items', () => {
    const { container } = render(<Sidebar {...defaultProps} />, { wrapper: Wrapper })
    const items = container.querySelectorAll('.pokemon-item')
    expect(items.length).toBeGreaterThan(0)
  })
})
