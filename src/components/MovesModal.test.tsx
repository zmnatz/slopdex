import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { MovesModal } from './MovesModal'

const moves = [
  { move: { name: 'tackle' } },
  { move: { name: 'vine-whip' } },
  { move: { name: 'tackle' } },
]

describe('MovesModal', () => {
  it('renders a deduped, alphabetized, space-formatted move list', () => {
    const { container } = render(<MovesModal moves={moves} onClose={vi.fn()} />)
    const items = container.querySelectorAll('.move-item')
    expect(Array.from(items).map(i => i.textContent)).toEqual(['tackle', 'vine whip'])
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<MovesModal moves={moves} onClose={onClose} />)
    fireEvent.click(container.querySelector('.modal-close')!)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when the backdrop is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<MovesModal moves={moves} onClose={onClose} />)
    fireEvent.click(container.querySelector('.modal-backdrop')!)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose when the modal content is clicked', () => {
    const onClose = vi.fn()
    const { container } = render(<MovesModal moves={moves} onClose={onClose} />)
    fireEvent.click(container.querySelector('.modal-content')!)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape is pressed', () => {
    const onClose = vi.fn()
    render(<MovesModal moves={moves} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('has dialog accessibility semantics', () => {
    const { container } = render(<MovesModal moves={moves} onClose={vi.fn()} />)
    const dialog = container.querySelector('[role="dialog"]')
    expect(dialog).toBeTruthy()
    expect(dialog?.getAttribute('aria-modal')).toBe('true')
  })
})
