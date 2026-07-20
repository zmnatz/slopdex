import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

HTMLCanvasElement.prototype.getContext = function () {
  return null
} as unknown as typeof HTMLCanvasElement.prototype.getContext

HTMLCanvasElement.prototype.toDataURL = function () {
  return ''
}

Element.prototype.setPointerCapture = function () {}
Element.prototype.releasePointerCapture = function () {}
Element.prototype.hasPointerCapture = function () { return false }
