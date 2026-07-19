import { useFilters } from '../hooks/FiltersContext'
import { pokemonIdFromUrl } from '../utils/pokemon'
import { GEN_RANGES } from '../utils/constants'

interface SidebarProps {
  filteredPokemon: { name: string; url: string }[]
  onSelect: (id: string) => void
  selectedId: string | null
}

export function Sidebar({ filteredPokemon, onSelect, selectedId }: SidebarProps) {
  const { searchTerm, setSearchTerm, genFilter, setGenFilter, typeFilter, setTypeFilter, types } =
    useFilters()

  return (
    <aside id="sidebar">
      <div className="sidebar-header">
        <h1>Pokédex</h1>
      </div>
      <div id="search-bar">
        <input
          type="text"
          id="search-input"
          placeholder="Search all generations..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="toolbar">
        <div className="filter-group">
          <select
            className="filter-select"
            value={genFilter}
            onChange={e => setGenFilter(e.target.value)}
          >
            <option value="all">All Generations</option>
            {GEN_RANGES.map(g => (
              <option key={g.name} value={g.name}>{g.name}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            {types.map(t => (
              <option key={t.name} value={t.name}>
                {t.name.charAt(0).toUpperCase() + t.name.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div id="pokemon-list">
        {GEN_RANGES.map(gen => {
          const genPokemon = filteredPokemon.filter(p => {
            const id = parseInt(pokemonIdFromUrl(p.url))
            return id >= gen.start && id <= gen.end
          })
          if (genPokemon.length === 0) return null
          return (
            <details key={gen.name} className="gen-section" open>
              <summary className="gen-summary">
                <span>{gen.name}</span>
                <span className="gen-count">{genPokemon.length}</span>
              </summary>
              <div className="gen-content">
                {genPokemon.map(p => {
                  const id = pokemonIdFromUrl(p.url)
                  return (
                    <div
                      key={id}
                      className={`pokemon-item${selectedId === id ? ' active' : ''}`}
                      onClick={() => onSelect(id)}
                    >
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                        loading="lazy"
                        alt={p.name}
                      />
                      <span>{p.name}</span>
                      <span className="id-badge">#{id.padStart(4, '0')}</span>
                    </div>
                  )
                })}
              </div>
            </details>
          )
        })}
      </div>
    </aside>
  )
}
