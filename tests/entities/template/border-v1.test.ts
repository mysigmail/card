// @vitest-environment jsdom
import { render as renderEmailHtml } from '@mysigmail/vue-email-components'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { createBlockNode } from '@/entities/block'
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
  it('round-trips canonical Block/Row/Cell borders and keeps omission', () => {
    const block = createBlockNode('Border')
    const row = block.rows[0]!
    const cell = row.cells[0]!
    block.settings.border = { top: { width: 128, style: 'solid', color: '#abc' } }
    row.settings.border = { right: { width: 2, style: 'dashed', color: '#123456' } }
    cell.settings.border = { bottom: { width: 3, style: 'dotted', color: '#def' } }

    const result = parseTemplateExportPayload(payload(block))
    expect(result.issues).toEqual([])
    const parsed = result.payload!.canvas.components[0]!.block
    expect(parsed.settings.border?.top?.width).toBe(128)
    expect(parsed.settings.border?.top?.color).toBe('#AABBCC')
    expect(parsed.rows[0]!.settings.border?.right?.color).toBe('#123456')
    expect(parsed.rows[0]!.cells[0]!.settings.border?.bottom?.color).toBe('#DDEEFF')

    const withoutBorder = parseTemplateExportPayload(payload(createBlockNode('No border')))
    expect(withoutBorder.issues).toEqual([])
    expect(withoutBorder.payload!.canvas.components[0]!.block.settings.border).toBeUndefined()
    expect(withoutBorder.payload!.canvas.components[0]!.block.settings).not.toHaveProperty('border')
  })

  it.each([
    [{}, 'border must contain at least one side'],
    [{ top: { width: 0, style: 'solid', color: '#000000' } }, 'border width'],
    [{ top: { width: 1.5, style: 'solid', color: '#000000' } }, 'border width'],
    [{ top: { width: 1, style: 'double', color: '#000000' } }, 'border style'],
    [{ top: { width: 1, style: 'solid', color: '#00000080' } }, 'border color'],
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
})
