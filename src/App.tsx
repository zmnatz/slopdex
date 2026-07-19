import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from './components/Sidebar'
import { DetailView } from './components/DetailView'
import { FiltersProvider } from './hooks/FiltersContext'
import { usePokemonList } from './hooks/usePokemonList'
import { usePokemonDetail } from './hooks/usePokemonDetail'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: Infinity, retry: 3 },
  },
})

function AppContent() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const { filteredPokemon, error: listError } = usePokemonList()
  const {
    pokeData,
    speciesData,
    evoChain,
    loading,
    error: detailError,
  } = usePokemonDetail(selectedId)

  return (
    <div className="app">
      <Sidebar
        filteredPokemon={filteredPokemon}
        onSelect={setSelectedId}
        selectedId={selectedId}
      />
      <main id="details">
        {listError && <div className="placeholder-text">{listError}</div>}
        {!listError && filteredPokemon.length === 0 && (
          <div className="placeholder-text">Select a Pokémon to examine</div>
        )}
        {loading && (
          <div className="loader-container" style={{ display: 'block' }}>
            <div className="spinner" />
            <div style={{ color: '#666', fontWeight: 'bold' }}>
              Fetching Data...
            </div>
          </div>
        )}
        {detailError && !loading && (
          <div className="placeholder-text">Error: {detailError}. Try again.</div>
        )}
        {pokeData && speciesData && !loading && (
          <DetailView
            pokeData={pokeData}
            speciesData={speciesData}
            evoChain={evoChain}
            onSelectPokemon={setSelectedId}
          />
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <FiltersProvider>
        <AppContent />
      </FiltersProvider>
    </QueryClientProvider>
  )
}

export default App
