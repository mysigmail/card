import { describe, expect, it } from 'vitest'
import { createTextAtom } from '@/entities/block'

describe('block factory', () => {
  it('stores the default text color inside default and custom HTML values', () => {
    const defaultAtom = createTextAtom()
    const customAtom = createTextAtom(
      '<p>Base <span style="color:#FF6B00">accent</span></p><ul><li>Item</li></ul>',
    )

    expect(defaultAtom.value).toBe('<div style="color:#111827"><p>Text</p></div>')
    expect(customAtom.value).toBe(
      '<div style="color:#111827"><p>Base <span style="color:#FF6B00">accent</span></p><ul><li>Item</li></ul></div>',
    )
    expect(defaultAtom).not.toHaveProperty('color')
    expect(customAtom).not.toHaveProperty('color')
  })
})
