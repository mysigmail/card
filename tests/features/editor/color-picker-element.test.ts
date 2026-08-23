// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import 'vanilla-colorful/hsva-color-picker.js'

describe('color picker custom element', () => {
  it('registers the alpha picker entrypoint with visible controls', () => {
    const Picker = customElements.get('hsva-color-picker')
    expect(Picker).toBeDefined()

    const picker = document.createElement('hsva-color-picker')
    document.body.append(picker)
    const shadow = picker.shadowRoot
    expect(shadow?.querySelector('[part="saturation"]')).not.toBeNull()
    expect(shadow?.querySelector('[part="saturation-pointer"]')).not.toBeNull()
    expect(shadow?.querySelector('[part="hue"]')).not.toBeNull()
    expect(shadow?.querySelector('[part="alpha"]')).not.toBeNull()
  })
})
