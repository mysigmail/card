// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { createBlockNode } from '@/entities/block'
import {
  collectDocumentColors,
  normalizeRecentColors,
  useColorPalettes,
} from '@/features/editor/model/use-color-palettes'

describe('color palettes', () => {
  it('normalizes, deduplicates and bounds recent colors', () => {
    const colors = Array.from({ length: 14 }, (_, index) => {
      const channel = index.toString(16).padStart(2, '0')
      return `#${channel}${channel}${channel}`
    })
    expect(normalizeRecentColors(['#aabbcc', '#AABBCC', ...colors], '#01020380')).toEqual([
      'rgba(1,2,3,0.502)',
      '#AABBCC',
      ...colors.slice(0, 10).map(color => color.toUpperCase()),
    ])
  })

  it('drops invalid preference entries', () => {
    expect(normalizeRecentColors(['red', null, '#abc'])).toEqual(['#AABBCC'])
  })

  it('clears recent colors for a new template', () => {
    const { clearRecentColors, recentColors, rememberColor } = useColorPalettes()
    rememberColor('#123456')
    expect(recentColors.value).toEqual(['#123456'])

    clearRecentColors()

    expect(recentColors.value).toEqual([])
  })

  it('collects only typed color owners including sanitized rich text', () => {
    const block = createBlockNode('#BADBAD is a label, not a color owner')
    const text = block.rows[0]!.cells[0]!.children[0]!
    if (text.type !== 'text')
      throw new Error('Expected text atom')
    text.value = '<p><span style="color:rgba(1,2,3,.5)">Text</span></p>'
    block.settings.backgroundColor = '#AABBCC'
    block.rows[0]!.settings.border = {
      top: { width: 1, style: 'solid', color: '#112233' },
    }
    const colors = collectDocumentColors(
      {
        padding: [0, 0, 0, 0],
        background: {
          color: '#FFFFFF',
          repeat: 'no-repeat',
          size: 'cover',
          position: 'center',
        },
        font: '#C0FFEE is not a color owner',
        previewText: '#DADADA is not a color owner',
      },
      [{ id: '#EEEEEE', version: 1, block }],
    )
    expect(colors).toEqual(['#FFFFFF', '#AABBCC', '#112233', 'rgba(1,2,3,0.5)'])
  })
})
