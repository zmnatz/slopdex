import { useEffect } from 'react'
import type { PokemonMove } from '../utils/types'
import { uniqueMoveNames } from '../utils/pokemon'

interface MovesModalProps {
  moves: PokemonMove[]
  onClose: () => void
}

export function MovesModal({ moves, onClose }: MovesModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const names = uniqueMoveNames(moves)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content moves-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="moves-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="moves-modal-title">Moves</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <ul className="moves-list">
          {names.map(name => (
            <li key={name} className="move-item">{name.replace(/-/g, ' ')}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
