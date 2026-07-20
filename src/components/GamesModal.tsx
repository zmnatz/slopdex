import { useEffect } from 'react'
import type { GameIndex } from '../utils/types'
import { gameNames } from '../utils/pokemon'

interface GamesModalProps {
  gameIndices: GameIndex[]
  onClose: () => void
}

export function GamesModal({ gameIndices, onClose }: GamesModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const names = gameNames(gameIndices)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content games-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="games-modal-title"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="games-modal-title">Games</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <ul className="games-list">
          {names.map(name => (
            <li key={name} className="game-item">{name.replace(/-/g, ' ')}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
