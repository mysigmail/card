// @vitest-environment jsdom
import { render as renderEmailHtml } from '@mysigmail/vue-email-components'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  createBlockNode,
  createButtonAtom,
  createCellNode,
  createDividerAtom,
  createImageAtom,
  createRowNode,
  createTextAtom,
} from '@/entities/block'
import { parseTemplateExportPayload } from '@/entities/template'
import { useInlineTextEditing } from '@/features/editor/components/tools/text/composables/use-inline-text-editing'
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
      id: 'opacity',
      title: 'Opacity',
      createdAt: '1970-01-01T00:00:00.000Z',
      updatedAt: '1970-01-01T00:00:00.000Z',
    },
    editor: { general },
    canvas: { components: [{ id: 'component', version: 1, block }] },
  }
}

function opacityFixture() {
  const block = createBlockNode('Opacity')
  const text = createTextAtom('<p>Text opacity</p>')
  const button = createButtonAtom()
  const divider = createDividerAtom()
  const image = createImageAtom()
  button.link = 'https://opacity-button.test'
  image.alt = 'Opacity image'
  block.rows[0]!.cells[0]!.children = [text, button, divider, image]
  return { block, text, button, divider, image }
}

afterEach(() => {
  useInlineTextEditing().stopEditing()
})

describe('strict v1 opacity', () => {
  it('round-trips all owners, preserves zero and omits canonical 100', () => {
    const { block, text, button, divider, image } = opacityFixture()
    block.settings.opacity = 0
    block.rows[0]!.settings.opacity = 10
    block.rows[0]!.cells[0]!.settings.opacity = 20
    text.opacity = 25
    button.opacity = 50
    divider.opacity = 75
    image.opacity = 100

    const result = parseTemplateExportPayload(payload(block))
    expect(result.issues).toEqual([])
    const parsed = result.payload!.canvas.components[0]!.block
    expect(parsed.settings.opacity).toBe(0)
    expect(parsed.rows[0]!.settings.opacity).toBe(10)
    expect(parsed.rows[0]!.cells[0]!.settings.opacity).toBe(20)
    const children = parsed.rows[0]!.cells[0]!.children
    expect(children[0]).toMatchObject({ type: 'text', opacity: 25 })
    expect(children[1]).toMatchObject({ type: 'button', opacity: 50 })
    expect(children[2]).toMatchObject({ type: 'divider', opacity: 75 })
    expect(children[3]).not.toHaveProperty('opacity')

    block.settings.opacity = 100
    block.rows[0]!.settings.opacity = 100
    block.rows[0]!.cells[0]!.settings.opacity = 100
    text.opacity = 0
    const canonical = parseTemplateExportPayload(payload(block)).payload!.canvas.components[0]!.block
    expect(canonical.settings).not.toHaveProperty('opacity')
    expect(canonical.rows[0]!.settings).not.toHaveProperty('opacity')
    expect(canonical.rows[0]!.cells[0]!.settings).not.toHaveProperty('opacity')
    expect(canonical.rows[0]!.cells[0]!.children[0]).toHaveProperty('opacity', 0)
  })

  it.each([-1, 101, 1.5, '50', Number.NaN])('rejects invalid owner opacity %#', (opacity) => {
    const { block } = opacityFixture()
    block.settings.opacity = opacity as never
    const result = parseTemplateExportPayload(payload(block))
    expect(result.payload).toBeUndefined()
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: expect.stringContaining('.block.settings.opacity') }),
    )
  })

  it('rejects invalid opacity on every atom variant', () => {
    const { block } = opacityFixture()
    for (let index = 0; index < 4; index += 1) {
      const candidate = structuredClone(block)
      const atom = candidate.rows[0]!.cells[0]!.children[index]!
      if (atom.type === 'row')
        throw new Error('Expected an atom fixture')
      atom.opacity = 101
      const result = parseTemplateExportPayload(payload(candidate))
      expect(result.payload).toBeUndefined()
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          path: expect.stringContaining(`.children[${index}].opacity`),
        }),
      )
    }
  })

  it('accepts omission, rejects invalid Row/Cell opacity and rejects unknown properties', () => {
    const { block } = opacityFixture()
    const missing = parseTemplateExportPayload(payload(block))
    expect(missing.issues).toEqual([])
    expect(missing.payload!.canvas.components[0]!.block.settings).not.toHaveProperty('opacity')

    block.rows[0]!.settings.opacity = -1
    let result = parseTemplateExportPayload(payload(block))
    expect(result.payload).toBeUndefined()
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: expect.stringContaining('.rows[0].settings.opacity') }),
    )

    delete block.rows[0]!.settings.opacity
    block.rows[0]!.cells[0]!.settings.opacity = 50.5
    result = parseTemplateExportPayload(payload(block))
    expect(result.payload).toBeUndefined()
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: expect.stringContaining('.cells[0].settings.opacity') }),
    )

    delete block.rows[0]!.cells[0]!.settings.opacity
    ;(block.settings as unknown as Record<string, unknown>).futureOpacity = 50
    result = parseTemplateExportPayload(payload(block))
    expect(result.payload).toBeUndefined()
    expect(result.issues).toContainEqual(
      expect.objectContaining({ path: expect.stringContaining('.settings.futureOpacity') }),
    )
  })

  it('emits opacity on exact visual owners without layout or fallback pollution', () => {
    const { block, text, button, divider, image } = opacityFixture()
    block.settings.opacity = 40
    block.rows[0]!.settings.opacity = 45
    block.rows[0]!.cells[0]!.settings.opacity = 55
    text.opacity = 20
    button.opacity = 30
    divider.opacity = 50
    image.opacity = 60

    const PreviewRoot = defineComponent({
      setup: () => () => h(BlockRenderer, { id: 'component', index: 0, block }),
    })
    const ExportRoot = defineComponent({ setup: () => () => h(ExportBlockRenderer, { block }) })

    for (const [kind, html] of [
      ['preview', renderEmailHtml(PreviewRoot)],
      ['export', renderEmailHtml(ExportRoot)],
    ] as const) {
      const document = new DOMParser().parseFromString(html, 'text/html')
      const blockShell = document.body.firstElementChild as HTMLElement
      const blockVisual
        = kind === 'preview' ? (blockShell.firstElementChild as HTMLElement) : blockShell
      const blockTable = blockVisual.querySelector('table')!
      const rowOwner
        = kind === 'preview'
          ? document.querySelector<HTMLTableElement>(`[data-node-id="row:${block.rows[0]!.id}"]`)!
          : blockTable.querySelector<HTMLTableElement>('table')!
      const cellOwner
        = kind === 'preview'
          ? document.querySelector<HTMLTableCellElement>(
            `[data-node-id="cell:${block.rows[0]!.cells[0]!.id}"]`,
          )!
          : rowOwner.tBodies[0]!.rows[0]!.cells[0]!
      const textOwner = document.querySelector<HTMLElement>('[data-slot="email-text-box"]')!
      const buttonOwner = document.querySelector<HTMLAnchorElement>(
        'a[href="https://opacity-button.test"]',
      )!
      const dividerOwner = document.querySelector('hr')!
      const imageOwner = document.querySelector<HTMLImageElement>('img[alt="Opacity image"]')!

      expect(blockVisual.style.opacity).toBe('0.4')
      if (kind === 'preview')
        expect(blockShell.style.opacity).toBe('')
      expect((blockTable as HTMLElement).style.opacity).toBe('')
      expect(rowOwner.style.opacity).toBe('0.45')
      expect(cellOwner.style.opacity).toBe('0.55')
      expect(textOwner.style.opacity).toBe('0.2')
      expect(buttonOwner.style.opacity).toBe('0.3')
      expect(dividerOwner.style.opacity).toBe('0.5')
      expect(imageOwner.style.opacity).toBe('0.6')

      expect(textOwner.querySelector('table')!.style.opacity).toBe('')
      expect(textOwner.querySelector('td')!.style.opacity).toBe('')
      expect(buttonOwner.parentElement!.style.opacity).toBe('')
      expect(dividerOwner.parentElement!.style.opacity).toBe('')
      expect(imageOwner.parentElement!.style.opacity).toBe('')
      expect(imageOwner.parentElement!.parentElement!.style.opacity).toBe('')
      expect(html.toLowerCase()).not.toMatch(/\bfilter\s*:|\bvml\b|<v:/)
    }
  })

  it('keeps the edited Text and containing Block opaque without mutating data', () => {
    const { block, text } = opacityFixture()
    block.settings.opacity = 20
    text.opacity = 10
    const { editingAtomId } = useInlineTextEditing()
    editingAtomId.value = text.id

    const PreviewRoot = defineComponent({
      setup: () => () => h(BlockRenderer, { id: 'component', index: 0, block }),
    })
    const document = new DOMParser().parseFromString(renderEmailHtml(PreviewRoot), 'text/html')
    const blockVisual = document.body.firstElementChild!.firstElementChild as HTMLElement
    const textOwner = document.querySelector<HTMLElement>('[data-slot="email-text-box"]')!
    expect(blockVisual.style.opacity).toBe('1')
    expect(textOwner.style.opacity).toBe('1')
    expect(block.settings.opacity).toBe(20)
    expect(text.opacity).toBe(10)
  })

  it('temporarily bypasses every nested Row/Cell opacity ancestor while editing', () => {
    const block = createBlockNode('Nested editing opacity')
    const outerRow = block.rows[0]!
    const outerCell = outerRow.cells[0]!
    const text = createTextAtom('<p>Nested editor</p>')
    const nestedRow = createRowNode([createCellNode([text])])
    const nestedCell = nestedRow.cells[0]!
    outerCell.children = [nestedRow]
    block.settings.opacity = 0
    outerRow.settings.opacity = 0
    outerCell.settings.opacity = 0
    nestedRow.settings.opacity = 0
    nestedCell.settings.opacity = 0
    text.opacity = 0

    const PreviewRoot = defineComponent({
      setup: () => () => h(BlockRenderer, { id: 'component', index: 0, block }),
    })
    const { editingAtomId, stopEditing } = useInlineTextEditing()

    function renderedOwners() {
      const document = new DOMParser().parseFromString(renderEmailHtml(PreviewRoot), 'text/html')
      return {
        block: document.body.firstElementChild!.firstElementChild as HTMLElement,
        outerRow: document.querySelector<HTMLElement>(`[data-node-id="row:${outerRow.id}"]`)!,
        outerCell: document.querySelector<HTMLElement>(`[data-node-id="cell:${outerCell.id}"]`)!,
        nestedRow: document.querySelector<HTMLElement>(`[data-node-id="row:${nestedRow.id}"]`)!,
        nestedCell: document.querySelector<HTMLElement>(`[data-node-id="cell:${nestedCell.id}"]`)!,
        text: document.querySelector<HTMLElement>('[data-slot="email-text-box"]')!,
      }
    }

    editingAtomId.value = text.id
    for (const owner of Object.values(renderedOwners())) expect(owner.style.opacity).toBe('1')

    stopEditing(text.id)
    for (const owner of Object.values(renderedOwners())) expect(owner.style.opacity).toBe('0')

    expect(block.settings.opacity).toBe(0)
    expect(outerRow.settings.opacity).toBe(0)
    expect(outerCell.settings.opacity).toBe(0)
    expect(nestedRow.settings.opacity).toBe(0)
    expect(nestedCell.settings.opacity).toBe(0)
    expect(text.opacity).toBe(0)
  })

  it('compensates sibling branches while bypassing the active editing path', () => {
    const block = createBlockNode('Editing compensation')
    const text = createTextAtom('<p>Active editor</p>')
    const siblingImage = createImageAtom()
    siblingImage.alt = 'Compensated sibling image'
    siblingImage.opacity = 50
    const siblingNestedRow = createRowNode([
      createCellNode([createTextAtom('<p>Nested sibling</p>')]),
    ])
    siblingNestedRow.settings.opacity = 25
    const activeCell = createCellNode([text, siblingImage, siblingNestedRow])
    const siblingCell = createCellNode([createTextAtom('<p>Sibling cell</p>')])
    const activeRow = createRowNode([activeCell, siblingCell])
    const siblingRow = createRowNode([createCellNode([createTextAtom('<p>Sibling row</p>')])])
    block.rows = [activeRow, siblingRow]

    block.settings.opacity = 50
    activeRow.settings.opacity = 80
    siblingRow.settings.opacity = 70
    activeCell.settings.opacity = 60
    siblingCell.settings.opacity = 40
    text.opacity = 20

    const { editingAtomId } = useInlineTextEditing()
    editingAtomId.value = text.id
    const PreviewRoot = defineComponent({
      setup: () => () => h(BlockRenderer, { id: 'component', index: 0, block }),
    })
    const document = new DOMParser().parseFromString(renderEmailHtml(PreviewRoot), 'text/html')
    const owner = (kind: 'row' | 'cell', id: string) =>
      document.querySelector<HTMLElement>(`[data-node-id="${kind}:${id}"]`)!

    expect((document.body.firstElementChild!.firstElementChild as HTMLElement).style.opacity).toBe(
      '1',
    )
    expect(owner('row', activeRow.id).style.opacity).toBe('1')
    expect(owner('cell', activeCell.id).style.opacity).toBe('1')
    expect(document.querySelector<HTMLElement>('[data-slot="email-text-box"]')!.style.opacity).toBe(
      '1',
    )

    expect(owner('row', siblingRow.id).style.opacity).toBe('0.35')
    expect(owner('cell', siblingCell.id).style.opacity).toBe('0.16')
    expect(
      document.querySelector<HTMLImageElement>('img[alt="Compensated sibling image"]')!.style
        .opacity,
    ).toBe('0.12')
    expect(owner('row', siblingNestedRow.id).style.opacity).toBe('0.06')

    expect(block.settings.opacity).toBe(50)
    expect(activeRow.settings.opacity).toBe(80)
    expect(siblingRow.settings.opacity).toBe(70)
    expect(activeCell.settings.opacity).toBe(60)
    expect(siblingCell.settings.opacity).toBe(40)
    expect(text.opacity).toBe(20)
    expect(siblingImage.opacity).toBe(50)
    expect(siblingNestedRow.settings.opacity).toBe(25)
  })
})
