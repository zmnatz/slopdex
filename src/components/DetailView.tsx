import type { PokemonData, SpeciesData, EvolutionStep } from '../utils/types'
import { TYPE_COLORS } from '../utils/constants'

interface DetailViewProps {
  pokeData: PokemonData
  speciesData: SpeciesData
  evoChain: EvolutionStep[]
  onSelectPokemon?: (id: string) => void
}

function cleanFlavorText(text: string): string {
  return text
    .replace(/[\n\f]/g, ' ')
    .replace(/\u00ad/g, '')
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

export function DetailView({ pokeData, speciesData, evoChain, onSelectPokemon }: DetailViewProps) {
  const genName = speciesData?.generation?.name?.split('-').pop()?.toUpperCase() ?? ''
  const genus = englishGenus(speciesData)
  const flavorText = englishFlavorText(speciesData)
  const heightM = (pokeData.height / 10).toFixed(1)
  const weightKg = (pokeData.weight / 10).toFixed(1)

  return (
    <div id="detail-card" className="detail-card visible">
      <img
        className="main-img"
        src={pokeData.sprites.other['official-artwork'].front_default || pokeData.sprites.front_default}
        alt={pokeData.name}
      />
      <h2>{pokeData.name}</h2>
      <div className="type-container">
        {pokeData.types.map(t => (
          <span
            key={t.slot}
            className="type-badge"
            style={{ backgroundColor: TYPE_COLORS[t.type.name] || '#999' }}
          >
            {t.type.name}
          </span>
        ))}
      </div>
      {genus && <p className="genus-text">{genus}</p>}
      {flavorText && <p className="flavor-text">"{flavorText}"</p>}
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Height</span>
          <span className="info-value">{heightM} m</span>
        </div>
        <div className="info-item">
          <span className="info-label">Weight</span>
          <span className="info-value">{weightKg} kg</span>
        </div>
        {pokeData.base_experience != null && (
          <div className="info-item">
            <span className="info-label">Base XP</span>
            <span className="info-value">{pokeData.base_experience}</span>
          </div>
        )}
        <div className="info-item">
          <span className="info-label">Cry</span>
          <span className="info-value">
            <button
              className="cry-button"
              onClick={() => {
                const audio = new Audio(pokeData.cries.latest)
                audio.volume = 0.3
                audio.play()
              }}
              aria-label="Play cry"
            >
              ▶ Play
            </button>
          </span>
        </div>
      </div>
      {pokeData.abilities && pokeData.abilities.length > 0 && (
        <div className="abilities-section">
          <h3>Abilities</h3>
          <div className="abilities-list">
            {pokeData.abilities
              .sort((a, b) => a.slot - b.slot)
              .map(a => (
                <span
                  key={a.slot}
                  className={`ability-badge ${a.is_hidden ? 'ability-hidden' : ''}`}
                >
                  {a.ability.name.replace('-', ' ')}
                  {a.is_hidden && <span className="hidden-tag"> (hidden)</span>}
                </span>
              ))}
          </div>
        </div>
      )}
      {genName && (
        <div className="gen-container">
          <span className="gen-badge">Gen {genName}</span>
        </div>
      )}
      <div className="stats-grid">
        {pokeData.stats.map(s => {
          const name = s.stat.name.replace('-', ' ')
          const val = s.base_stat
          const perc = (val / 255) * 100
          return (
            <div key={s.stat.name} className="stat-row">
              <div className="stat-label">{name}: {val}</div>
              <div className="stat-bar-bg">
                <div className="stat-bar-fill" style={{ width: `${perc}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      {evoChain.length > 0 && (
        <div className="evolution-section">
          <h3>Evolution Chain</h3>
          <div className="evolution-chain">
            {evoChain.map((step, i) => (
              <div key={step.id} className="evo-group" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  className="evo-step"
                  onClick={() => onSelectPokemon?.(step.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onSelectPokemon?.(step.id) }}
                >
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${step.id}.png`}
                    alt={step.name}
                  />
                  <span>{step.name}</span>
                </div>
                {i < evoChain.length - 1 && <div className="evo-arrow">➜</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
