import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { GamesModal } from './GamesModal'

const gameIndices = [
  { version: { name: 'red' } },
  { version: { name: 'blue' } },
  { version: { name: 'red' } },
]

describe('GamesModal', () => {
  it('renders a deduped game list in PokeAPI order', () => {
    const { container } = render(<GamesModal gameIndices={gameIndices} onClose={vi.fn()} />)
    const items = container.querySelectorAll('.game-item')
    expect(Array.from(items).map(i => i.textContent)).toEqual(['red', 'blue'])
  })

  it('formats hyphenated version names with spaces', () => {
    const { container } = render(
      <GamesModal gameIndices={[{ version: { name: 'black-2' } }]} onClose={vi.fn()} />,
    )
    expect(container.querySelector('.game-item')?.textContent).toBe('black 2')
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<GamesModal gameIndices={gameIndices} onClose={onClose} />)
    fireEvent.click(container.querySelector('.modal-close')!)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<GamesModal gameIndices={gameIndices} onClose={onClose} />)
    fireEvent.click(container.querySelector('.modal-backdrop')!)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose when the modal content is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<GamesModal gameIndices={gameIndices} onClose={onClose} />)
    fireEvent.click(container.querySelector('.modal-content')!)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<GamesModal gameIndices={gameIndices} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('has dialog accessibility semantics', () => {
    const { container } = render(<GamesModal gameIndices={gameIndices} onClose={vi.fn()} />)
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
  })
})
