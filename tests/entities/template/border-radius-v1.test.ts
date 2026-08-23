// @vitest-environment jsdom
import { render as renderEmailHtml } from '@mysigmail/vue-email-components'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  createBlockNode,
  createButtonAtom,
  createImageAtom,
  createTextAtom,
} from '@/entities/block'
import { createBorderRadiusValue } from '@/entities/style'
import { parseTemplateExportPayload } from '@/entities/template'
import BlockRenderer from '@/features/email-preview/ui/BlockRenderer.vue'
import ExportBlockRenderer from '@/features/email-preview/ui/ExportBlockRenderer.vue'

const general = {
  padding: [0, 0, 0, 0] as [number, number, number, number],
  background: {
    color: '#FFFFFF',
    image: '',
    repeat: 'no-repeat' as const,
    size: 'cover' as const,
    position: 'center' as const,
  },
  font: 'Arial',
  previewText: '',
}

function payload(block: ReturnType<typeof createBlockNode>) {
  return {
    version: 1,
    meta: {
      id: 'radius',
      title: 'Radius',
      createdAt: '1970-01-01T00:00:00.000Z',
      updatedAt: '1970-01-01T00:00:00.000Z',
    },
    editor: { general },
    canvas: { components: [{ id: 'component', version: 1, block }] },
  }
}

type RadiusOwner = 'block' | 'row' | 'cell' | 'text' | 'button' | 'image'

function assignInvalidScalarRadius(block: ReturnType<typeof createBlockNode>, owner: RadiusOwner) {
  const row = block.rows[0]!
  const cell = row.cells[0]!
  const text = createTextAtom('<p>Text</p>')
  const button = createButtonAtom()
  const image = createImageAtom()
  cell.children = [text, button, image]

  if (owner === 'block')
    block.settings.borderRadius = 4 as never
  else if (owner === 'row')
    row.settings.borderRadius = 4 as never
  else if (owner === 'cell')
    cell.settings.borderRadius = 4 as never
  else if (owner === 'text')
    text.borderRadius = 4 as never
  else if (owner === 'button')
    button.borderRadius = 4 as never
  else image.borderRadius = 4 as never
}

describe('strict v1 per-corner radius', () => {
  it('round-trips the strict object on every border-capable node', () => {
    const block = createBlockNode('Radius')
    const row = block.rows[0]!
    const cell = block.rows[0]!.cells[0]!
    const text = createTextAtom('<p>Rounded text</p>')
    const button = createButtonAtom()
    const image = createImageAtom()
    block.settings.borderRadius = { topLeft: 13, topRight: 14, bottomRight: 15, bottomLeft: 16 }
    row.settings.borderRadius = { topLeft: 17, topRight: 18, bottomRight: 19, bottomLeft: 20 }
    cell.settings.borderRadius = { topLeft: 1, topRight: 2, bottomRight: 3, bottomLeft: 4 }
    text.borderRadius = { topLeft: 21, topRight: 22, bottomRight: 23, bottomLeft: 24 }
    button.borderRadius = { topLeft: 5, topRight: 6, bottomRight: 7, bottomLeft: 8 }
    image.borderRadius = { topLeft: 9, topRight: 10, bottomRight: 11, bottomLeft: 12 }
    cell.children = [text, button, image]

    const result = parseTemplateExportPayload(payload(block))
    expect(result.issues).toEqual([])
    expect(result.payload!.canvas.components[0]!.block).toMatchObject({
      settings: { borderRadius: block.settings.borderRadius },
      rows: [
        {
          settings: { borderRadius: row.settings.borderRadius },
          cells: [
            {
              settings: { borderRadius: cell.settings.borderRadius },
              children: [
                { type: 'text', borderRadius: text.borderRadius },
                { type: 'button', borderRadius: button.borderRadius },
                { type: 'image', borderRadius: image.borderRadius },
              ],
            },
          ],
        },
      ],
    })
  })

  it.each([
    4,
    { topLeft: 1, topRight: 2, bottomRight: 3 },
    { topLeft: 1, topRight: 2, bottomRight: 3, bottomLeft: 4, future: 5 },
    { topLeft: -1, topRight: 2, bottomRight: 3, bottomLeft: 4 },
    { topLeft: Number.NaN, topRight: 2, bottomRight: 3, bottomLeft: 4 },
  ])('rejects invalid radius %#', (borderRadius) => {
    const block = createBlockNode('Invalid radius')
    block.rows[0]!.cells[0]!.settings.borderRadius = borderRadius as never
    const result = parseTemplateExportPayload(payload(block))
    expect(result.payload).toBeUndefined()
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        path: expect.stringContaining('.settings.borderRadius'),
      }),
    )
  })

  it.each<RadiusOwner>(['block', 'row', 'cell', 'text', 'button', 'image'])(
    'rejects a scalar radius on %s',
    (owner) => {
      const block = createBlockNode('Invalid owner radius')
      assignInvalidScalarRadius(block, owner)
      const result = parseTemplateExportPayload(payload(block))
      expect(result.payload).toBeUndefined()
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          path: expect.stringContaining('borderRadius'),
        }),
      )
    },
  )

  it('sanitizes valid radius values and keeps invalid optional values out', () => {
    const block = createBlockNode('Sanitized radius')
    const image = createImageAtom()
    image.borderRadius = undefined
    block.rows[0]!.cells[0]!.children = [image]
    const result = parseTemplateExportPayload(payload(block))
    expect(result.issues).toEqual([])
    expect(
      result.payload!.canvas.components[0]!.block.rows[0]!.cells[0]!.children[0],
    ).not.toHaveProperty('borderRadius')
  })

  it('renders exact inline shorthand on every real border owner', () => {
    const block = createBlockNode('Rendered radius')
    const row = block.rows[0]!
    const cell = row.cells[0]!
    const text = createTextAtom('<p>Radius text</p>')
    const button = createButtonAtom()
    const image = createImageAtom()
    button.link = 'https://radius-button.test'
    image.alt = 'Radius image'
    block.settings.borderRadius = { topLeft: 13, topRight: 14, bottomRight: 15, bottomLeft: 16 }
    row.settings.borderRadius = { topLeft: 17, topRight: 18, bottomRight: 19, bottomLeft: 20 }
    cell.settings.borderRadius = { topLeft: 1, topRight: 2, bottomRight: 3, bottomLeft: 4 }
    text.borderRadius = { topLeft: 21, topRight: 22, bottomRight: 23, bottomLeft: 24 }
    button.borderRadius = { topLeft: 5, topRight: 6, bottomRight: 7, bottomLeft: 8 }
    image.borderRadius = { topLeft: 9, topRight: 10, bottomRight: 11, bottomLeft: 12 }
    cell.children = [text, button, image]

    const PreviewRoot = defineComponent({
      setup: () => () => h(BlockRenderer, { id: 'component', index: 0, block }),
    })
    const ExportRoot = defineComponent({ setup: () => () => h(ExportBlockRenderer, { block }) })
    for (const html of [renderEmailHtml(PreviewRoot), renderEmailHtml(ExportRoot)]) {
      const document = new DOMParser().parseFromString(html, 'text/html')
      const radiusOwners = Array.from(
        document.querySelectorAll<HTMLElement>('[style*="border-radius"]'),
      )
      const findOwner = (radius: string) =>
        radiusOwners.find(owner => owner.style.borderRadius === radius)!
      const blockOwner = findOwner('13px 14px 15px 16px')
      const rowOwner = findOwner('17px 18px 19px 20px')
      const cellOwner = findOwner('1px 2px 3px 4px')
      const textOwner = findOwner('21px 22px 23px 24px')
      const buttonOwner = document.querySelector<HTMLAnchorElement>(
        'a[href="https://radius-button.test"]',
      )!
      const imageOwner = document.querySelector<HTMLImageElement>('img[alt="Radius image"]')!
      expect(blockOwner.tagName).toBe('TABLE')
      expect(rowOwner.tagName).toBe('TABLE')
      expect(cellOwner.tagName).toBe('TD')
      expect(textOwner.tagName).toBe('TD')
      expect(cellOwner.style.borderRadius).toBe('1px 2px 3px 4px')
      expect(cellOwner.style.overflow).toBe('hidden')
      expect(textOwner.style.overflow).toBe('hidden')
      expect(buttonOwner.style.borderRadius).toBe('5px 6px 7px 8px')
      expect(imageOwner.style.borderRadius).toBe('9px 10px 11px 12px')
      expect(buttonOwner.parentElement!.style.borderRadius).toBe('')
      expect(imageOwner.parentElement!.style.borderRadius).toBe('')
    }
  })

  it('keeps uniform object values as four-value inline CSS', () => {
    expect(createBorderRadiusValue(4)).toEqual({
      topLeft: 4,
      topRight: 4,
      bottomRight: 4,
      bottomLeft: 4,
    })
  })
})
