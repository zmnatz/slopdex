import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { theme } from '../theme'
import { MovesModal } from './MovesModal'

const moves = [
  { move: { name: 'tackle' } },
  { move: { name: 'vine-whip' } },
  { move: { name: 'tackle' } },
]

function renderModal(onClose: () => void) {
  return render(
    <ThemeProvider theme={theme}>
      <MovesModal moves={moves} onClose={onClose} />
    </ThemeProvider>,
  )
}

describe('MovesModal', () => {
  it('renders a deduped, alphabetized, space-formatted move list', () => {
    renderModal(vi.fn())
    const items = screen.getAllByRole('listitem')
    expect(items.map(i => i.textContent)).toEqual(['tackle', 'vine whip'])
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderModal(onClose)
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    const { baseElement } = renderModal(onClose)
    fireEvent.click(baseElement.querySelector('.MuiBackdrop-root')!)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose when the modal content is clicked', () => {
    const onClose = vi.fn()
    renderModal(onClose)
    fireEvent.click(screen.getByText('Moves'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    renderModal(onClose)
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('has dialog accessibility semantics', () => {
    renderModal(vi.fn())
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })
})
