// @vitest-environment jsdom
import { render } from '@mysigmail/vue-email-components'
import { describe, expect, it } from 'vitest'
import { h } from 'vue'
import {
  createBlockNode,
  createButtonAtom,
  createDividerAtom,
  createTextAtom,
} from '@/entities/block'
import {
  emailColorChannelsToHsl,
  formatColorChannel,
  hslToHsvColorChannels,
  hsvToHslColorChannels,
  normalizeColorPickerInput,
  normalizeEmailColor,
  parseEmailColor,
  resolveOpaqueEmailColor,
  toPickerHexAlpha,
} from '@/entities/style'
import { parseTemplateExportPayload, sanitizeTextEditorHtml } from '@/entities/template'
import { addEmailColorFallbacksToHtml } from '@/features/email-preview/lib/email-color-fallback'

describe('email color', () => {
  it.each([
    ['#abc', '#AABBCC'],
    ['#112233', '#112233'],
    ['#11223380', 'rgba(17,34,51,0.502)'],
    ['rgba(1, 2, 3, .25)', 'rgba(1,2,3,0.25)'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeEmailColor(input)).toBe(expected)
  })

  it.each(['', 'red', '#12', 'rgba(256,0,0,1)', 'rgba(0,0,0,2)'])('rejects %s', (input) => {
    expect(normalizeEmailColor(input)).toBeUndefined()
  })

  it('keeps HSL as a picker-only display format and emits canonical email color', () => {
    expect(normalizeEmailColor('hsla(210,50%,40%,.25)')).toBeUndefined()
    expect(normalizeColorPickerInput('hsla(210,50%,40%,.25)')).toBe('rgba(51,102,153,0.25)')
    expect(emailColorChannelsToHsl({ red: 51, green: 102, blue: 153, alpha: 0.25 })).toEqual({
      hue: 210,
      saturation: 50,
      lightness: 40,
      alpha: 0.25,
    })
  })

  it('formats picker channels as integers', () => {
    expect(formatColorChannel(87.3)).toBe('87')
    expect(formatColorChannel(87.7)).toBe('88')
  })

  it('keeps visual hue stable while HSL saturation changes', () => {
    for (const saturation of [0, 10, 25, 50, 75, 87, 100]) {
      const hsva = hslToHsvColorChannels({
        hue: 14,
        saturation,
        lightness: 56,
        alpha: 1,
      })
      expect(hsva.hue).toBe(14)
      expect(hsvToHslColorChannels(hsva).hue).toBe(14)
      expect(hsvToHslColorChannels(hsva).saturation).toBeCloseTo(saturation, 8)
    }
  })

  it('resolves picker and opaque fallback values', () => {
    expect(toPickerHexAlpha('rgba(17,34,51,0.5)')).toBe('#11223380')
    expect(resolveOpaqueEmailColor('rgba(17,34,51,0.5)')).toBe('#112233')
    expect(parseEmailColor('#112233')).toEqual({ red: 17, green: 34, blue: 51, alpha: 1 })
  })

  it('proves Vue style arrays collapse duplicate declarations', () => {
    const Root = { render: () => h('div', { style: ['color:#112233', 'color:rgba(17,34,51,.5)'] }) }
    const html = render(Root)
    expect(html).not.toContain('color:#112233;color:rgba')
  })

  it('adds opaque declarations immediately before progressive rgba declarations', () => {
    expect(
      addEmailColorFallbacksToHtml(
        '<td style="background-color:rgba(17,34,51,0.5);border-top:1px solid rgba(1,2,3,.25);color:#000000">x</td>',
      ),
    ).toContain(
      'background-color:#112233;background-color:rgba(17,34,51,0.5);border-top:1px solid #010203;border-top:1px solid rgba(1,2,3,.25)',
    )
  })

  it('preserves complex CSS values and is idempotent', () => {
    const input
      = '<div style="background-image:url(data:image/svg+xml;charset=utf-8,%3Csvg%3E);background:linear-gradient(90deg,rgba(1,2,3,.5),rgba(4,5,6,.25));color: #010203;color:rgba(1,2,3,.5)">x</div>'
    const once = addEmailColorFallbacksToHtml(input)
    expect(once).toContain('url(data:image/svg+xml;charset=utf-8,%3Csvg%3E)')
    expect(once).toContain('background:linear-gradient(90deg,#010203,#040506)')
    expect(once.match(/color:\s?#010203/g)).toHaveLength(1)
    expect(addEmailColorFallbacksToHtml(once)).toBe(once)
  })

  it('normalizes rich-text colors before sanitized export fallback', () => {
    const sanitized = sanitizeTextEditorHtml(
      '<p><span style="color:rgba(1, 2, 3, .5);background-color:#AABBCC80">valid</span><span style="color:red">invalid</span></p>',
    )
    expect(sanitized).toContain('color:rgba(1,2,3,0.5)')
    expect(sanitized).toContain('background-color:rgba(170,187,204,0.502)')
    expect(sanitized).not.toContain('color:red')

    const exported = addEmailColorFallbacksToHtml(sanitized)
    expect(exported).toContain('color:#010203;color:rgba(1,2,3,0.5)')
    expect(exported).toContain('background-color:#AABBCC;background-color:rgba(170,187,204,0.502)')
  })

  it('strictly round-trips alpha colors through every persisted color owner', () => {
    const block = createBlockNode('Colors')
    const row = block.rows[0]!
    const cell = row.cells[0]!
    const button = createButtonAtom()
    const divider = createDividerAtom()
    const text = createTextAtom()
    block.settings.backgroundColor = '#12345680'
    row.settings.backgroundColor = 'rgba(1,2,3,.25)'
    cell.settings.backgroundColor = 'transparent'
    button.backgroundColor = 'rgba(4,5,6,.5)'
    button.color = '#AABBCC80'
    divider.color = 'rgba(7,8,9,.75)'
    block.settings.border = { top: { width: 1, style: 'solid', color: '#01020380' } }
    text.value
      = '<p><span style="color:#11223380">Alpha text</span><span style="color:red">Invalid</span></p>'
    cell.children = [text, button, divider]
    const result = parseTemplateExportPayload({
      version: 1,
      meta: {
        id: 'colors',
        title: 'Colors',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      editor: {
        general: {
          padding: [0, 0, 0, 0],
          background: {
            color: '#ABCDEF80',
            image: '',
            repeat: 'no-repeat',
            size: 'cover',
            position: 'center',
          },
          font: 'Arial',
          previewText: '',
        },
      },
      canvas: { components: [{ id: 'component', version: 1, block }] },
    })
    expect(result.issues).toEqual([])
    expect(result.payload?.editor.general.background.color).toBe('rgba(171,205,239,0.502)')
    const parsedBlock = result.payload!.canvas.components[0]!.block
    expect(parsedBlock.settings.backgroundColor).toBe('rgba(18,52,86,0.502)')
    expect(parsedBlock.settings.border!.top!.color).toBe('rgba(1,2,3,0.502)')
    expect(parsedBlock.rows[0]!.settings.backgroundColor).toBe('rgba(1,2,3,0.25)')
    const children = parsedBlock.rows[0]!.cells[0]!.children
    expect(children[0]).toMatchObject({
      value: expect.stringContaining('color:rgba(17,34,51,0.502)'),
    })
    expect((children[0] as { value: string }).value).not.toContain('color:red')
    expect(children[1]).toMatchObject({
      backgroundColor: 'rgba(4,5,6,0.5)',
      color: 'rgba(170,187,204,0.502)',
    })
    expect(children[2]).toMatchObject({ color: 'rgba(7,8,9,0.75)' })
  })
})
