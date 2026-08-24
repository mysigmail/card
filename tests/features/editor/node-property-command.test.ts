import type { AtomRef, CellRef, NodePropertyCommand, RowRef } from '@/features/editor/model'
import { describe, expect, it } from 'vitest'
import {
  createBlockNode,
  createButtonAtom,
  createCellNode,
  createDividerAtom,
  createImageAtom,
  createRowNode,
  createTextAtom,
} from '@/entities/block'
import { createSpacingPatch } from '@/features/editor/components/tools/spacing/spacing-patch'
import { normalizeSpacingValue } from '@/features/editor/components/tools/use-settings-tools'
import {
  getNodePropertyState,
  inspectorCapabilities,
  updateNodeProperties,
  updateNodeProperty,
} from '@/features/editor/model'

function createFixture() {
  const text = createTextAtom()
  const button = createButtonAtom()
  const divider = createDividerAtom()
  const image = createImageAtom()
  const row = createRowNode([
    createCellNode([text]),
    createCellNode([button]),
    createCellNode([divider]),
    createCellNode([image]),
  ])
  const nestedText = createTextAtom('<p>Nested</p>')
  const nestedRow = createRowNode([createCellNode([nestedText])])
  row.cells[0]!.children.push(nestedRow)
  const block = createBlockNode('Registry', [row])
  const items = [{ id: 'component', version: 1 as const, block }]

  const atomRef = <T extends 'text' | 'button' | 'divider' | 'image'>(
    atom: { id: string, type: T },
    cellIndex: number,
  ): AtomRef<T> => ({
    kind: 'atom',
    blockId: block.id,
    rowId: row.id,
    cellId: row.cells[cellIndex]!.id,
    atomId: atom.id,
    atomType: atom.type,
  })

  return {
    items,
    block,
    row,
    text,
    button,
    divider,
    image,
    nestedRow,
    nestedText,
    textRef: atomRef(text, 0),
    buttonRef: atomRef(button, 1),
    dividerRef: atomRef(divider, 2),
    imageRef: atomRef(image, 3),
  }
}

describe('typed inspector registry and mutation gateway', () => {
  it('publishes the closed capability keys for all seven node variants', () => {
    expect(inspectorCapabilities).toEqual({
      block: ['spacing', 'opacity', 'backgroundColor', 'backgroundImage', 'borderRadius', 'border'],
      row: [
        'spacing',
        'opacity',
        'backgroundColor',
        'backgroundImage',
        'borderRadius',
        'border',
        'widthMode',
        'gap',
        'height',
        'hiddenOnMobile',
        'collapseOnMobile',
      ],
      cell: [
        'spacing',
        'opacity',
        'backgroundColor',
        'backgroundImage',
        'border',
        'link',
        'hiddenOnMobile',
        'verticalAlign',
        'horizontalAlign',
        'borderRadius',
        'width',
        'height',
      ],
      text: [
        'spacing',
        'hiddenOnMobile',
        'opacity',
        'borderRadius',
        'border',
        'widthMode',
        'paragraphSpacing',
        'value',
      ],
      button: [
        'spacing',
        'hiddenOnMobile',
        'opacity',
        'border',
        'value',
        'link',
        'backgroundColor',
        'borderRadius',
      ],
      divider: ['spacing', 'hiddenOnMobile', 'opacity', 'color', 'height'],
      image: [
        'spacing',
        'hiddenOnMobile',
        'opacity',
        'border',
        'src',
        'alt',
        'link',
        'width',
        'height',
        'borderRadius',
      ],
    })
  })

  it('applies canonical opacity to every node kind and rejects invalid batches atomically', () => {
    const fixture = createFixture()
    const blockRef = { kind: 'block' as const, blockId: fixture.block.id }
    const rowRef: RowRef = {
      kind: 'row',
      blockId: fixture.block.id,
      rowId: fixture.row.id,
    }
    const cellRef: CellRef = {
      kind: 'cell',
      blockId: fixture.block.id,
      rowId: fixture.row.id,
      cellId: fixture.row.cells[0]!.id,
    }

    expect(getNodePropertyState(fixture.items, blockRef, 'opacity')).toEqual({
      kind: 'value',
      value: 100,
    })
    expect(getNodePropertyState(fixture.items, fixture.textRef, 'opacity')).toEqual({
      kind: 'value',
      value: 100,
    })
    expect(
      updateNodeProperties(fixture.items, [
        { ref: blockRef, property: 'opacity', value: 0 },
        { ref: rowRef, property: 'opacity', value: 20 },
        { ref: cellRef, property: 'opacity', value: 30 },
        { ref: fixture.textRef, property: 'opacity', value: 45 },
      ]),
    ).toEqual({ ok: true, changed: true })
    expect(fixture.block.settings.opacity).toBe(0)
    expect(fixture.row.settings.opacity).toBe(20)
    expect(fixture.row.cells[0]!.settings.opacity).toBe(30)
    expect(fixture.text.opacity).toBe(45)

    expect(
      updateNodeProperties(fixture.items, [
        { ref: blockRef, property: 'opacity', value: 25 },
        { ref: fixture.imageRef, property: 'opacity', value: 1.5 },
      ]),
    ).toEqual({ ok: false, reason: 'invalid-value' })
    expect(fixture.block.settings.opacity).toBe(0)
    expect(fixture.image.opacity).toBeUndefined()

    expect(
      updateNodeProperty(fixture.items, { ref: blockRef, property: 'opacity', value: 100 }),
    ).toEqual({ ok: true, changed: true })
    expect(fixture.block.settings).not.toHaveProperty('opacity')

    expect(
      updateNodeProperties(fixture.items, [
        { ref: rowRef, property: 'opacity', value: 100 },
        { ref: cellRef, property: 'opacity', value: 100 },
      ]),
    ).toEqual({ ok: true, changed: true })
    expect(fixture.row.settings).not.toHaveProperty('opacity')
    expect(fixture.row.cells[0]!.settings).not.toHaveProperty('opacity')
  })

  it('resolves nested ancestry and rejects wrong ancestry or atom type', () => {
    const fixture = createFixture()
    const nestedRef: AtomRef<'text'> = {
      kind: 'atom',
      blockId: fixture.block.id,
      rowId: fixture.nestedRow.id,
      cellId: fixture.nestedRow.cells[0]!.id,
      atomId: fixture.nestedText.id,
      atomType: 'text',
    }
    expect(
      updateNodeProperty(fixture.items, {
        ref: nestedRef,
        property: 'value',
        value: '<p>Changed</p>',
      }),
    ).toEqual({ ok: true, changed: true })
    expect(fixture.nestedText.value).toBe('<p>Changed</p>')

    expect(
      updateNodeProperty(fixture.items, {
        ref: { ...nestedRef, rowId: fixture.row.id },
        property: 'value',
        value: '<p>Wrong path</p>',
      }),
    ).toEqual({ ok: false, reason: 'node-path-mismatch' })
    expect(
      updateNodeProperty(fixture.items, {
        ref: { ...fixture.textRef, atomType: 'image' },
        property: 'src',
        value: '/wrong.png',
      }),
    ).toEqual({ ok: false, reason: 'node-type-mismatch' })
    expect(
      updateNodeProperty(fixture.items, {
        ref: { ...fixture.textRef, atomId: 'missing' },
        property: 'value',
        value: '<p>Missing</p>',
      }),
    ).toEqual({ ok: false, reason: 'node-not-found' })
  })

  it('rejects unknown properties and invalid values without mutation', () => {
    const fixture = createFixture()
    const before = fixture.row.settings.gap
    const unknown = {
      ref: { kind: 'row', blockId: fixture.block.id, rowId: fixture.row.id },
      property: 'futureBorder',
      value: 1,
    } as unknown as NodePropertyCommand
    expect(updateNodeProperty(fixture.items, unknown)).toEqual({
      ok: false,
      reason: 'unsupported-property',
    })
    expect(
      getNodePropertyState(
        fixture.items,
        { kind: 'row', blockId: fixture.block.id, rowId: fixture.row.id },
        'futureBorder' as never,
      ),
    ).toEqual({ kind: 'inapplicable', reason: 'unsupported-property' })
    expect(
      updateNodeProperty(fixture.items, {
        ref: { kind: 'row', blockId: fixture.block.id, rowId: fixture.row.id },
        property: 'gap',
        value: Number.NaN,
      }),
    ).toEqual({ ok: false, reason: 'invalid-value' })
    expect(fixture.row.settings.gap).toBe(before)

    const invalidBackground = {
      ref: { kind: 'row', blockId: fixture.block.id, rowId: fixture.row.id },
      property: 'backgroundImage',
      value: { url: '', repeat: 'tile', size: 'cover', position: 'center' },
    } as unknown as NodePropertyCommand
    expect(updateNodeProperty(fixture.items, invalidBackground)).toEqual({
      ok: false,
      reason: 'invalid-value',
    })
  })

  it('normalizes valid borders and rejects invalid border batches atomically', () => {
    const fixture = createFixture()
    const rowRef: RowRef = { kind: 'row', blockId: fixture.block.id, rowId: fixture.row.id }
    const blockRef = { kind: 'block' as const, blockId: fixture.block.id }
    const cellRef: CellRef = {
      kind: 'cell',
      blockId: fixture.block.id,
      rowId: fixture.row.id,
      cellId: fixture.row.cells[0]!.id,
    }
    expect(
      updateNodeProperty(fixture.items, {
        ref: blockRef,
        property: 'border',
        value: { left: { width: 1, style: 'solid', color: '#000' } },
      }),
    ).toEqual({ ok: true, changed: true })
    expect(
      updateNodeProperty(fixture.items, {
        ref: cellRef,
        property: 'border',
        value: { bottom: { width: 3, style: 'dotted', color: '#fff' } },
      }),
    ).toEqual({ ok: true, changed: true })
    expect(getNodePropertyState(fixture.items, blockRef, 'border')).toEqual({
      kind: 'value',
      value: { left: { width: 1, style: 'solid', color: '#000000' } },
    })
    expect(getNodePropertyState(fixture.items, cellRef, 'border')).toEqual({
      kind: 'value',
      value: { bottom: { width: 3, style: 'dotted', color: '#FFFFFF' } },
    })
    expect(
      updateNodeProperty(fixture.items, {
        ref: rowRef,
        property: 'border',
        value: { top: { width: 2, style: 'dashed', color: '#abc' } },
      }),
    ).toEqual({ ok: true, changed: true })
    expect(fixture.row.settings.border).toEqual({
      top: { width: 2, style: 'dashed', color: '#AABBCC' },
    })

    for (const ref of [fixture.textRef, fixture.buttonRef, fixture.imageRef]) {
      expect(
        updateNodeProperty(fixture.items, {
          ref,
          property: 'border',
          value: { right: { width: 4, style: 'solid', color: '#456' } },
        }),
      ).toEqual({ ok: true, changed: true })
      expect(getNodePropertyState(fixture.items, ref, 'border')).toEqual({
        kind: 'value',
        value: { right: { width: 4, style: 'solid', color: '#445566' } },
      })
    }

    expect(
      updateNodeProperty(fixture.items, {
        ref: fixture.dividerRef,
        property: 'border',
        value: { top: { width: 1, style: 'solid', color: '#000000' } },
      } as unknown as NodePropertyCommand),
    ).toEqual({ ok: false, reason: 'unsupported-property' })

    const before = structuredClone(fixture.row.settings.border)
    expect(
      updateNodeProperties(fixture.items, [
        { ref: rowRef, property: 'gap', value: 12 },
        {
          ref: rowRef,
          property: 'border',
          value: { left: { width: 0, style: 'solid', color: '#000000' } },
        },
      ]),
    ).toEqual({ ok: false, reason: 'invalid-value' })
    expect(fixture.row.settings.gap).toBe(0)
    expect(fixture.row.settings.border).toEqual(before)

    expect(
      updateNodeProperty(fixture.items, {
        ref: rowRef,
        property: 'border',
        value: undefined,
      }),
    ).toEqual({ ok: true, changed: true })
    expect(fixture.row.settings.border).toBeUndefined()
  })

  it('preflights a batch atomically and applies a valid image batch', () => {
    const fixture = createFixture()
    const originalSrc = fixture.image.src
    const invalidBatch = [
      { ref: fixture.imageRef, property: 'src', value: '/new.png' },
      { ref: fixture.imageRef, property: 'width', value: -1 },
    ] as NodePropertyCommand[]
    expect(updateNodeProperties(fixture.items, invalidBatch)).toEqual({
      ok: false,
      reason: 'invalid-value',
    })
    expect(fixture.image.src).toBe(originalSrc)

    expect(
      updateNodeProperties(fixture.items, [
        { ref: fixture.imageRef, property: 'src', value: '/new.png' },
        { ref: fixture.imageRef, property: 'alt', value: 'New' },
        { ref: fixture.imageRef, property: 'link', value: 'https://example.test' },
        { ref: fixture.imageRef, property: 'width', value: 240 },
        { ref: fixture.imageRef, property: 'height', value: undefined },
      ]),
    ).toEqual({ ok: true, changed: true })
    expect(fixture.image).toMatchObject({
      src: '/new.png',
      alt: 'New',
      link: 'https://example.test',
      width: 240,
    })
    expect(fixture.image.height).toBeUndefined()
  })

  it('updates Text box geometry atomically and rejects invalid paragraph spacing', () => {
    const fixture = createFixture()
    fixture.text.widthMode = undefined
    fixture.text.paragraphSpacing = undefined

    expect(
      updateNodeProperties(fixture.items, [
        { ref: fixture.textRef, property: 'widthMode', value: 'hug' },
        { ref: fixture.textRef, property: 'paragraphSpacing', value: 18 },
        {
          ref: fixture.textRef,
          property: 'border',
          value: { top: { width: 1, style: 'solid', color: '#123' } },
        },
      ]),
    ).toEqual({ ok: true, changed: true })
    expect(fixture.text).toMatchObject({
      widthMode: 'hug',
      paragraphSpacing: 18,
      border: { top: { width: 1, style: 'solid', color: '#112233' } },
    })

    const before = structuredClone(fixture.text)
    expect(
      updateNodeProperties(fixture.items, [
        { ref: fixture.textRef, property: 'widthMode', value: 'fill' },
        { ref: fixture.textRef, property: 'paragraphSpacing', value: -1 },
      ]),
    ).toEqual({ ok: false, reason: 'invalid-value' })
    expect(fixture.text).toEqual(before)
  })

  it('rejects duplicate target properties before applying a batch', () => {
    const fixture = createFixture()
    const rowRef: RowRef = { kind: 'row', blockId: fixture.block.id, rowId: fixture.row.id }

    expect(
      updateNodeProperties(fixture.items, [
        { ref: rowRef, property: 'gap', value: 10 },
        { ref: rowRef, property: 'gap', value: 0 },
      ]),
    ).toEqual({ ok: false, reason: 'invalid-value' })
    expect(fixture.row.settings.gap).toBe(0)

    fixture.row.settings.spacing = { padding: [1, 1, 1, 1], margin: [2, 2, 2, 2] }
    expect(
      updateNodeProperties(fixture.items, [
        { ref: rowRef, property: 'spacing', value: { padding: [3, 3, 3, 3] } },
        { ref: rowRef, property: 'spacing', value: { margin: [4, 4, 4, 4] } },
      ]),
    ).toEqual({ ok: false, reason: 'invalid-value' })
    expect(fixture.row.settings.spacing).toEqual({ padding: [1, 1, 1, 1], margin: [2, 2, 2, 2] })
  })

  it('preserves an unedited spacing side and synchronizes button padding', () => {
    const fixture = createFixture()
    fixture.row.settings.spacing = { padding: [1, 2, 3, 4], margin: [5, 6, 7, 8] }
    const rowRef: RowRef = { kind: 'row', blockId: fixture.block.id, rowId: fixture.row.id }
    const controlValue = normalizeSpacingValue(fixture.row.settings.spacing, [0, 0, 0, 0], {
      includeMargin: false,
    })
    const controlPayload = createSpacingPatch(controlValue, 'padding', [9, 9, 9, 9])
    expect(controlPayload).toEqual({ padding: [9, 9, 9, 9] })
    expect(controlPayload).not.toHaveProperty('margin')

    updateNodeProperty(fixture.items, { ref: rowRef, property: 'spacing', value: controlPayload })
    expect(fixture.row.settings.spacing).toEqual({ padding: [9, 9, 9, 9], margin: [5, 6, 7, 8] })

    const atomControlValue = normalizeSpacingValue(fixture.button.spacing, fixture.button.padding)
    const atomControlPayload = createSpacingPatch(atomControlValue, 'padding', [2, 4, 6, 8])
    expect(atomControlPayload.margin).toEqual(atomControlValue.margin)
    updateNodeProperty(fixture.items, {
      ref: fixture.buttonRef,
      property: 'spacing',
      value: atomControlPayload,
    })
    expect(fixture.button.spacing?.padding).toEqual([2, 4, 6, 8])
    expect(fixture.button.padding).toEqual([2, 4, 6, 8])
  })

  it('updates strict per-corner radius values and rejects scalar or malformed commands', () => {
    const fixture = createFixture()
    const radius = { topLeft: 1, topRight: 2, bottomRight: 3, bottomLeft: 4 }

    const blockRef: BlockRef = { kind: 'block', blockId: fixture.block.id }
    const rowRef: RowRef = { kind: 'row', blockId: fixture.block.id, rowId: fixture.row.id }
    const cellRef: CellRef = {
      kind: 'cell',
      blockId: fixture.block.id,
      rowId: fixture.row.id,
      cellId: fixture.row.cells[0]!.id,
    }
    for (const ref of [blockRef, rowRef, cellRef, fixture.textRef] as const) {
      expect(
        updateNodeProperty(fixture.items, {
          ref,
          property: 'borderRadius',
          value: radius,
        }),
      ).toEqual({ ok: true, changed: true })
      expect(getNodePropertyState(fixture.items, ref, 'borderRadius')).toEqual({
        kind: 'value',
        value: radius,
      })
    }

    expect(
      updateNodeProperty(fixture.items, {
        ref: fixture.buttonRef,
        property: 'borderRadius',
        value: radius,
      }),
    ).toEqual({ ok: true, changed: true })
    expect(fixture.button.borderRadius).toEqual(radius)
    expect(getNodePropertyState(fixture.items, fixture.buttonRef, 'borderRadius')).toEqual({
      kind: 'value',
      value: radius,
    })

    expect(
      updateNodeProperty(fixture.items, {
        ref: fixture.imageRef,
        property: 'borderRadius',
        value: 4 as never,
      }),
    ).toEqual({ ok: false, reason: 'invalid-value' })
    expect(
      updateNodeProperty(fixture.items, {
        ref: fixture.imageRef,
        property: 'borderRadius',
        value: { ...radius, future: 5 } as never,
      }),
    ).toEqual({ ok: false, reason: 'invalid-value' })
  })

  it('sanitizes text and exposes current single-selection defaults', () => {
    const fixture = createFixture()
    updateNodeProperty(fixture.items, {
      ref: fixture.textRef,
      property: 'value',
      value: '<p onclick="bad()">Safe</p>',
    })
    expect(fixture.text.value).toBe('<p>Safe</p>')
    updateNodeProperty(fixture.items, {
      ref: fixture.buttonRef,
      property: 'value',
      value: '<p><a href="https://nested.example"><strong>Buy</strong></a></p>',
    })
    expect(fixture.button.value).toBe('<strong>Buy</strong>')

    fixture.row.settings.collapseOnMobile = undefined
    fixture.row.settings.hiddenOnMobile = undefined
    const rowRef: RowRef = { kind: 'row', blockId: fixture.block.id, rowId: fixture.row.id }
    expect(getNodePropertyState(fixture.items, rowRef, 'collapseOnMobile')).toEqual({
      kind: 'value',
      value: true,
    })
    expect(getNodePropertyState(fixture.items, rowRef, 'hiddenOnMobile')).toEqual({
      kind: 'value',
      value: false,
    })

    const cell = fixture.row.cells[0]!
    cell.settings.horizontalAlign = undefined
    cell.settings.borderRadius = undefined
    cell.settings.width = undefined
    cell.settings.height = undefined
    const cellRef: CellRef = {
      kind: 'cell',
      blockId: fixture.block.id,
      rowId: fixture.row.id,
      cellId: cell.id,
    }
    expect(getNodePropertyState(fixture.items, cellRef, 'horizontalAlign')).toEqual({
      kind: 'value',
      value: 'left',
    })
    expect(getNodePropertyState(fixture.items, cellRef, 'borderRadius')).toEqual({
      kind: 'value',
      value: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
    })
    expect(getNodePropertyState(fixture.items, cellRef, 'width')).toEqual({
      kind: 'value',
      value: undefined,
    })
    expect(getNodePropertyState(fixture.items, cellRef, 'height')).toEqual({
      kind: 'value',
      value: undefined,
    })
    expect(getNodePropertyState(fixture.items, cellRef, 'hiddenOnMobile')).toEqual({
      kind: 'value',
      value: false,
    })
    expect(getNodePropertyState(fixture.items, fixture.textRef, 'hiddenOnMobile')).toEqual({
      kind: 'value',
      value: false,
    })
  })

  it('does not assign on a semantic no-op', () => {
    const fixture = createFixture()
    const spacing = fixture.block.settings.spacing
    const result = updateNodeProperty(fixture.items, {
      ref: { kind: 'block', blockId: fixture.block.id },
      property: 'spacing',
      value: { padding: spacing.padding ? [...spacing.padding] : undefined },
    })
    expect(result).toEqual({ ok: true, changed: false })
    expect(fixture.block.settings.spacing).toBe(spacing)
  })
})
