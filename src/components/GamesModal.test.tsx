import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../theme'
import { GamesModal } from './GamesModal'
import type { GameIndex } from '../utils/types'

const gameIndices = [
  { version: { name: 'red' } },
  { version: { name: 'blue' } },
  { version: { name: 'red' } },
]

function renderModal(indices: GameIndex[], onClose: () => void) {
  return render(
    <ThemeProvider theme={theme}>
      <GamesModal gameIndices={indices} onClose={onClose} />
    </ThemeProvider>,
  )
}

describe('GamesModal', () => {
  it('renders a deduped game list in PokeAPI order', () => {
    renderModal(gameIndices, vi.fn())
    const items = screen.getAllByRole('listitem')
    expect(items.map(i => i.textContent)).toEqual(['red', 'blue'])
  })

  it('formats hyphenated version names with spaces', () => {
    renderModal([{ version: { name: 'black-2' } }], vi.fn())
    expect(screen.getByRole('listitem').textContent).toBe('black 2')
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderModal(gameIndices, onClose)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    const { baseElement } = renderModal(gameIndices, onClose)
    fireEvent.click(baseElement.querySelector('.MuiBackdrop-root')!)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose when the modal content is clicked', () => {
    const onClose = vi.fn()
    renderModal(gameIndices, onClose)
    fireEvent.click(screen.getByText('Games'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    renderModal(gameIndices, onClose)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('has dialog accessibility semantics', () => {
    renderModal(gameIndices, vi.fn())
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })
})
