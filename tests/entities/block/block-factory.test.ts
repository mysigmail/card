import { describe, expect, it } from 'vitest'
import { createSocialRow, createTextAtom } from '@/entities/block'

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

  it('builds the social preset from ordinary image atoms', () => {
    const row = createSocialRow()

    expect(row.type).toBe('row')
    expect(row.settings).toMatchObject({
      widthMode: 'hug',
      collapseOnMobile: false,
      gap: 10,
    })
    expect(row.cells).toHaveLength(3)
    expect(row.cells.map(cell => cell.children[0])).toEqual([
      expect.objectContaining({ type: 'image', alt: 'Facebook', width: 16, height: 16 }),
      expect.objectContaining({ type: 'image', alt: 'X', width: 16, height: 16 }),
      expect.objectContaining({ type: 'image', alt: 'Instagram', width: 16, height: 16 }),
    ])
  })
})
