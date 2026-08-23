// @vitest-environment jsdom
import { render as renderEmailHtml } from '@mysigmail/vue-email-components'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  createBlockNode,
  createButtonAtom,
  createDividerAtom,
  createImageAtom,
  createTextAtom,
  resolveLegacyTextBoxDefaults,
} from '@/entities/block'
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
      id: 'border',
      title: 'Border',
      createdAt: '1970-01-01T00:00:00.000Z',
      updatedAt: '1970-01-01T00:00:00.000Z',
    },
    editor: { general },
    canvas: { components: [{ id: 'component', version: 1, block }] },
  }
}

describe('strict v1 borders', () => {
  it('materializes implicit paragraph margins outside a legacy Text box', () => {
    const text = createTextAtom('<p><span style="font-size:13px">Weekend kit</span></p>')
    delete text.widthMode
    delete text.paragraphSpacing

    expect(resolveLegacyTextBoxDefaults(text)).toEqual({
      paragraphSpacing: 16,
      spacing: {
        margin: [16, 0, 16, 0],
        padding: [0, 0, 0, 0],
      },
    })
  })

  it('round-trips canonical container and supported atom borders and keeps omission', () => {
    const block = createBlockNode('Border')
    const row = block.rows[0]!
    const cell = row.cells[0]!
    const text = createTextAtom('<p>Border text</p>')
    const button = createButtonAtom()
    const image = createImageAtom()
    const divider = createDividerAtom()
    cell.children = [text, button, image, divider]
    block.settings.border = { top: { width: 128, style: 'solid', color: '#abc' } }
    row.settings.border = { right: { width: 2, style: 'dashed', color: '#123456' } }
    cell.settings.border = { bottom: { width: 3, style: 'dotted', color: '#def' } }
    text.border = { left: { width: 4, style: 'solid', color: '#123' } }
    text.widthMode = 'hug'
    text.paragraphSpacing = 12
    button.border = { top: { width: 5, style: 'dashed', color: '#456' } }
    image.border = { right: { width: 6, style: 'dotted', color: '#789' } }

    const result = parseTemplateExportPayload(payload(block))
    expect(result.issues).toEqual([])
    const parsed = result.payload!.canvas.components[0]!.block
    expect(parsed.settings.border?.top?.width).toBe(128)
    expect(parsed.settings.border?.top?.color).toBe('#AABBCC')
    expect(parsed.rows[0]!.settings.border?.right?.color).toBe('#123456')
    expect(parsed.rows[0]!.cells[0]!.settings.border?.bottom?.color).toBe('#DDEEFF')
    const parsedChildren = parsed.rows[0]!.cells[0]!.children
    expect(parsedChildren[0]).toMatchObject({
      type: 'text',
      widthMode: 'hug',
      paragraphSpacing: 12,
      border: { left: { width: 4, style: 'solid', color: '#112233' } },
    })
    expect(parsedChildren[1]).toMatchObject({
      type: 'button',
      border: { top: { width: 5, style: 'dashed', color: '#445566' } },
    })
    expect(parsedChildren[2]).toMatchObject({
      type: 'image',
      border: { right: { width: 6, style: 'dotted', color: '#778899' } },
    })
    expect(parsedChildren[3]).not.toHaveProperty('border')

    const withoutBorder = parseTemplateExportPayload(payload(createBlockNode('No border')))
    expect(withoutBorder.issues).toEqual([])
    expect(withoutBorder.payload!.canvas.components[0]!.block.settings.border).toBeUndefined()
    expect(withoutBorder.payload!.canvas.components[0]!.block.settings).not.toHaveProperty('border')
  })

  it('rejects generic border on DividerAtom', () => {
    const block = createBlockNode('Divider border')
    const divider = createDividerAtom() as unknown as Record<string, unknown>
    divider.border = { top: { width: 1, style: 'solid', color: '#000000' } }
    block.rows[0]!.cells[0]!.children = [divider as never]

    const result = parseTemplateExportPayload(payload(block))
    expect(result.payload).toBeUndefined()
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: expect.stringContaining('.children[0].border') }),
    )
  })

  it.each([
    ['wide' as const, 0, 'widthMode'],
    ['hug' as const, -1, 'paragraphSpacing'],
  ])('rejects invalid Text box geometry %#', (widthMode, paragraphSpacing, property) => {
    const block = createBlockNode('Invalid Text box')
    const text = createTextAtom() as unknown as Record<string, unknown>
    text.widthMode = widthMode
    text.paragraphSpacing = paragraphSpacing
    block.rows[0]!.cells[0]!.children = [text as never]

    const result = parseTemplateExportPayload(payload(block))
    expect(result.payload).toBeUndefined()
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: expect.stringContaining(`.${property}`) }),
    )
  })

  it('accepts legacy TextAtom without Text box fields and preserves their omission', () => {
    const block = createBlockNode('Legacy Text')
    const text = createTextAtom()
    delete text.widthMode
    delete text.paragraphSpacing
    block.rows[0]!.cells[0]!.children = [text]

    const result = parseTemplateExportPayload(payload(block))
    expect(result.issues).toEqual([])
    const parsedText = result.payload!.canvas.components[0]!.block.rows[0]!.cells[0]!.children[0]!
    expect(parsedText).not.toHaveProperty('widthMode')
    expect(parsedText).not.toHaveProperty('paragraphSpacing')
  })

  it.each([
    [{}, 'border must contain at least one side'],
    [{ top: { width: 0, style: 'solid', color: '#000000' } }, 'border width'],
    [{ top: { width: 1.5, style: 'solid', color: '#000000' } }, 'border width'],
    [{ top: { width: 1, style: 'double', color: '#000000' } }, 'border style'],
    [{ top: { width: 1, style: 'solid', color: 'rgba(0,0,0,2)' } }, 'border color'],
    [{ top: { width: 1, style: 'solid', color: '#000000', future: true } }, 'Unknown property'],
    [{ top: { width: 1, style: 'solid', color: '#000000' }, future: {} }, 'Unknown property'],
  ])('rejects an invalid border %#', (border, message) => {
    const block = createBlockNode('Invalid border')
    block.settings.border = border as never
    const result = parseTemplateExportPayload(payload(block))
    expect(result.payload).toBeUndefined()
    expect(result.issues.some(issue => issue.message.includes(message))).toBe(true)
  })

  it('puts each border side on the exact email table/td owner in preview and export', () => {
    const block = createBlockNode('Rendered border')
    block.settings.border = { top: { width: 1, style: 'solid', color: '#111111' } }
    block.rows[0]!.settings.border = { right: { width: 2, style: 'dashed', color: '#222222' } }
    block.rows[0]!.cells[0]!.settings.border = {
      bottom: { width: 3, style: 'dotted', color: '#333333' },
    }

    const PreviewRoot = defineComponent({
      setup: () => () => h(BlockRenderer, { id: 'component', index: 0, block }),
    })
    const ExportRoot = defineComponent({ setup: () => () => h(ExportBlockRenderer, { block }) })
    for (const [kind, html] of [
      ['preview', renderEmailHtml(PreviewRoot)],
      ['export', renderEmailHtml(ExportRoot)],
    ] as const) {
      const document = new DOMParser().parseFromString(html, 'text/html')
      const container = document.body.firstElementChild as HTMLTableElement
      const innerBlock = container.tBodies[0]!.rows[0]!.cells[0]!.firstElementChild as HTMLElement
      const rowOwner
        = kind === 'preview'
          ? document.querySelector<HTMLTableElement>(`[data-node-id="row:${block.rows[0]!.id}"]`)!
          : innerBlock.querySelector<HTMLTableElement>('table')!
      const cellOwner
        = kind === 'preview'
          ? document.querySelector<HTMLTableCellElement>(
            `[data-node-id="cell:${block.rows[0]!.cells[0]!.id}"]`,
          )!
          : rowOwner.tBodies[0]!.rows[0]!.cells[0]!

      expect(container.tagName).toBe('TABLE')
      expect(container.style.borderTopWidth).toBe('1px')
      expect(container.style.borderTopStyle).toBe('solid')
      expect(container.style.borderTopColor).toBe('rgb(17, 17, 17)')
      expect(container.style.borderRightWidth).toBe('')

      expect(rowOwner.tagName).toBe('TABLE')
      expect(rowOwner.style.borderRightWidth).toBe('2px')
      expect(rowOwner.style.borderRightStyle).toBe('dashed')
      expect(rowOwner.style.borderRightColor).toBe('rgb(34, 34, 34)')
      expect(rowOwner.style.borderTopWidth).toBe('')

      expect(cellOwner.tagName).toBe('TD')
      expect(cellOwner.style.borderBottomWidth).toBe('3px')
      expect(cellOwner.style.borderBottomStyle).toBe('dotted')
      expect(cellOwner.style.borderBottomColor).toBe('rgb(51, 51, 51)')
      expect(cellOwner.style.borderLeftWidth).toBe('')

      expect(innerBlock.style.cssText).not.toMatch(/border-(?:top|right|bottom|left):/)
      const contentWrapper = cellOwner.firstElementChild as HTMLElement
      const atomWrapper
        = kind === 'preview' ? contentWrapper.querySelector<HTMLElement>('.e-atom')! : contentWrapper
      expect(atomWrapper.style.cssText).not.toMatch(/border-(?:top|right|bottom|left):/)
      const previewGridWrapper = cellOwner.querySelector<HTMLElement>('.p-grid-gap')
      expect(previewGridWrapper?.style.cssText ?? '').not.toMatch(
        /border-(?:top|right|bottom|left):/,
      )
    }

    const noBorder = createBlockNode('No border')
    const NoBorderPreviewRoot = defineComponent({
      setup: () => () => h(BlockRenderer, { id: 'component', index: 0, block: noBorder }),
    })
    const NoBorderExportRoot = defineComponent({
      setup: () => () => h(ExportBlockRenderer, { block: noBorder }),
    })
    for (const html of [
      renderEmailHtml(NoBorderPreviewRoot),
      renderEmailHtml(NoBorderExportRoot),
    ]) {
      const document = new DOMParser().parseFromString(html, 'text/html')
      const styledElements = Array.from(document.querySelectorAll<HTMLElement>('[style]'))
      expect(
        styledElements.every(
          element => !/border-(?:top|right|bottom|left):/.test(element.style.cssText),
        ),
      ).toBe(true)
    }
  })

  it('puts atom borders on the Text box cell, Button link and Image element', () => {
    const block = createBlockNode('Atom borders')
    const cell = block.rows[0]!.cells[0]!
    const text = createTextAtom('<p>Atom border text</p>')
    const button = createButtonAtom()
    const image = createImageAtom()
    button.link = 'https://button-border.test'
    image.alt = 'Atom border image'
    text.border = { top: { width: 2, style: 'solid', color: '#112233' } }
    button.border = { right: { width: 3, style: 'dashed', color: '#445566' } }
    image.border = { bottom: { width: 4, style: 'dotted', color: '#778899' } }
    cell.children = [text, button, image]

    const PreviewRoot = defineComponent({
      setup: () => () => h(BlockRenderer, { id: 'component', index: 0, block }),
    })
    const ExportRoot = defineComponent({ setup: () => () => h(ExportBlockRenderer, { block }) })

    for (const [kind, html] of [
      ['preview', renderEmailHtml(PreviewRoot)],
      ['export', renderEmailHtml(ExportRoot)],
    ] as const) {
      const document = new DOMParser().parseFromString(html, 'text/html')
      const textWrapper
        = kind === 'preview'
          ? document.querySelector<HTMLElement>(`[data-node-id="atom:${text.id}"]`)!
          : Array.from(document.querySelectorAll<HTMLParagraphElement>('p'))
            .find(element => element.textContent === 'Atom border text')!
            .closest<HTMLElement>('[data-slot="email-text-box"]')!
      const textOwner = textWrapper.querySelector<HTMLTableCellElement>('td')!
      const textTable = textOwner.closest<HTMLTableElement>('table')!
      const textParagraph = textOwner.querySelector<HTMLParagraphElement>('p')!
      const buttonOwner = document.querySelector<HTMLAnchorElement>(
        'a[href="https://button-border.test"]',
      )!
      const imageOwner = document.querySelector<HTMLImageElement>('img[alt="Atom border image"]')!

      expect(textOwner.style.borderTopWidth, `${kind} Text owner`).toBe('2px')
      expect(textOwner.style.borderTopStyle).toBe('solid')
      expect(textOwner.style.borderTopColor).toBe('rgb(17, 34, 51)')
      expect(textWrapper.style.borderTopWidth).toBe('')
      expect(textTable.style.width).toBe('auto')
      expect(textParagraph.style.margin).toBe('0px')
      expect(buttonOwner.style.borderRightWidth).toBe('3px')
      expect(buttonOwner.style.borderRightStyle).toBe('dashed')
      expect(buttonOwner.style.borderRightColor).toBe('rgb(68, 85, 102)')
      expect(imageOwner.style.borderBottomWidth).toBe('4px')
      expect(imageOwner.style.borderBottomStyle).toBe('dotted')
      expect(imageOwner.style.borderBottomColor).toBe('rgb(119, 136, 153)')
      expect(textTable.hasAttribute('data-selection-owner')).toBe(kind === 'preview')
      expect(buttonOwner.hasAttribute('data-selection-owner')).toBe(kind === 'preview')
      expect(imageOwner.hasAttribute('data-selection-owner')).toBe(kind === 'preview')
      expect(document.querySelector('[data-selection-content]') !== null).toBe(kind === 'preview')

      expect(buttonOwner.parentElement?.style.cssText ?? '').not.toMatch(
        /border-(?:top|right|bottom|left):/,
      )
      expect(imageOwner.parentElement?.style.cssText ?? '').not.toMatch(
        /border-(?:top|right|bottom|left):/,
      )
    }
  })
})
