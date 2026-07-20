import { useParams } from '@tanstack/react-router'
import { DetailView } from '../components/DetailView'
import { usePokemonDetail } from '../hooks/usePokemonDetail'

// Loading and error states are handled by the <Suspense>/ErrorBoundary pair
// around <Outlet> in AppLayout — usePokemonDetail suspends/throws instead
// of returning loading/error flags.
export function PokemonDetailRoute() {
  const { id } = useParams({ from: '/pokemon/$id' })
  const { pokeData, speciesData, evoChain } = usePokemonDetail(id)

  return <DetailView key={id} pokeData={pokeData} speciesData={speciesData} evoChain={evoChain} />
}
