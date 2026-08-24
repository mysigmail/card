// @vitest-environment jsdom
import { render as renderEmailHtml } from '@mysigmail/vue-email-components'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import {
  createAtom,
  createBlockNode,
  createCellNode,
  createImageAtom,
  createRowNode,
  createTextMenuRow,
} from '@/entities/block'
import {
  createRuntimeComponents,
  createTemplateExportPayload,
  parseTemplateExportPayload,
  TEMPLATE_EXPORT_VERSION,
  TEMPLATE_LOCAL_STORAGE_KEY,
} from '@/entities/template'
import {
  useCanvas,
  useHistory,
  usePersistence,
  useSelection,
  useTemplateIO,
} from '@/features/editor/model'
import {
  content,
  cta,
  ecommerce,
  feature,
  footer,
  header,
  menu,
  transactional,
} from '@/features/email-preview/catalog/load-blocks'
import BlockRendererRowNode from '@/features/email-preview/ui/BlockRendererRowNode.vue'
import EmailExportDocument from '@/features/email-preview/ui/EmailExportDocument.vue'
import ExportBlockRendererRowNode from '@/features/email-preview/ui/ExportBlockRendererRowNode.vue'

const general = {
  padding: [0, 0, 0, 0] as [number, number, number, number],
  background: {
    color: '#ffffff',
    image: '',
    repeat: 'no-repeat' as const,
    size: 'cover' as const,
    position: 'center' as const,
  },
  font: 'Arial',
  previewText: '',
}

function envelope(component: unknown, version = 1) {
  return {
    version,
    meta: {
      id: 'template',
      title: 'Fixture',
      createdAt: '1970-01-01T00:00:00.000Z',
      updatedAt: '1970-01-01T00:00:00.000Z',
    },
    editor: {
      general: {
        ...general,
        padding: [...general.padding] as [number, number, number, number],
        background: { ...general.background },
      },
    },
    canvas: { components: [component] },
  }
}

function assertCanonicalCatalogButtons(value: unknown) {
  if (Array.isArray(value)) {
    value.forEach(assertCanonicalCatalogButtons)
    return
  }
  if (typeof value !== 'object' || value === null)
    return

  const record = value as Record<string, unknown>
  if (record.type === 'button') {
    expect(record).not.toHaveProperty('text')
    expect(record).not.toHaveProperty('color')
    expect(record).not.toHaveProperty('fontSize')
    expect(record.value).toEqual(
      expect.stringMatching(/^<span style="color:#[0-9A-F]{6};font-size:\d+px">.+<\/span>$/),
    )
  }
  Object.values(record).forEach(assertCanonicalCatalogButtons)
}

describe('ordered cell children v1', () => {
  beforeEach(() => {
    useCanvas().installed.value = []
    useSelection().resetSelection()
    useHistory().resetHistory()
    const values = new Map<string, string>()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        clear: () => values.clear(),
        getItem: (key: string) => values.get(key) ?? null,
        key: (index: number) => [...values.keys()][index] ?? null,
        get length() {
          return values.size
        },
        removeItem: (key: string) => values.delete(key),
        setItem: (key: string, value: string) => values.set(key, value),
      } satisfies Storage,
    })
  })

  it('round-trips mixed atom/row order and remaps every child id', () => {
    const block = createBlockNode('Ordered')
    const cell = block.rows[0]!.cells[0]!
    const first = cell.children[0]!
    const nested = createTextMenuRow(['One', 'Two'])
    cell.children.push(nested)

    const payload = createTemplateExportPayload({
      installed: [{ id: 'component', version: 1, block }],
      general,
    })
    const parsed = parseTemplateExportPayload(payload)
    expect(parsed.issues).toEqual([])
    expect(parsed.payload?.version).toBe(TEMPLATE_EXPORT_VERSION)
    expect(
      parsed.payload?.canvas.components[0]!.block.rows[0]!.cells[0]!.children.map(
        child => child.type,
      ),
    ).toEqual(['text', 'row'])

    const [runtime] = createRuntimeComponents(parsed.payload!.canvas.components)
    expect(runtime!.block.rows[0]!.cells[0]!.children[0]!.id).not.toBe(first.id)
    expect(runtime!.block.rows[0]!.cells[0]!.children[1]!.id).not.toBe(nested.id)
  })

  it('rejects an old root version before interpreting its schema', () => {
    const block = createBlockNode('Old contract') as unknown as Record<string, any>
    const cell = block.rows[0].cells[0]
    cell.atoms = cell.children
    cell.rows = []
    delete cell.children

    const result = parseTemplateExportPayload(envelope({ id: 'old', version: 2, block }, 2))

    expect(result.payload).toBeUndefined()
    expect(result.issues).toEqual([
      { path: '$.version', message: 'Unsupported template version 2. Expected 1' },
    ])
  })

  it('rejects legacy cell fields even when ordered children are also present', () => {
    const block = createBlockNode('Hybrid contract') as unknown as Record<string, any>
    const cell = block.rows[0].cells[0]
    cell.atoms = []
    cell.rows = []

    const result = parseTemplateExportPayload(envelope({ id: 'hybrid', version: 1, block }))

    expect(result.payload).toBeUndefined()
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '$.canvas.components[0].block.rows[0].cells[0].atoms' }),
        expect.objectContaining({ path: '$.canvas.components[0].block.rows[0].cells[0].rows' }),
      ]),
    )
  })

  it('requires image link and alt exactly as declared by the v1 contract', () => {
    const image = createImageAtom() as unknown as Record<string, unknown>
    delete image.link
    delete image.alt
    const block = createBlockNode('Invalid image', [
      createRowNode([createCellNode([image as any])]),
    ])

    const result = parseTemplateExportPayload(envelope({ id: 'invalid-image', version: 1, block }))

    const atomPath = '$.canvas.components[0].block.rows[0].cells[0].children[0]'
    expect(result.payload).toBeUndefined()
    expect(result.issues).toContainEqual({
      path: `${atomPath}.link`,
      message: 'image atom link must be a string',
    })
    expect(result.issues).toContainEqual({
      path: `${atomPath}.alt`,
      message: 'image atom alt must be a string',
    })
  })

  it.each([
    [
      'root',
      (payload: any) => {
        payload.unexpected = true
      },
      '$.unexpected',
    ],
    [
      'meta',
      (payload: any) => {
        payload.meta.unexpected = true
      },
      '$.meta.unexpected',
    ],
    [
      'editor',
      (payload: any) => {
        payload.editor.unexpected = true
      },
      '$.editor.unexpected',
    ],
    [
      'general',
      (payload: any) => {
        payload.editor.general.unexpected = true
      },
      '$.editor.general.unexpected',
    ],
    [
      'general background',
      (payload: any) => {
        payload.editor.general.background.unexpected = true
      },
      '$.editor.general.background.unexpected',
    ],
    [
      'canvas',
      (payload: any) => {
        payload.canvas.unexpected = true
      },
      '$.canvas.unexpected',
    ],
    [
      'component',
      (payload: any) => {
        payload.canvas.components[0].unexpected = true
      },
      '$.canvas.components[0].unexpected',
    ],
    [
      'block',
      (payload: any) => {
        payload.canvas.components[0].block.unexpected = true
      },
      '$.canvas.components[0].block.unexpected',
    ],
    [
      'block settings',
      (payload: any) => {
        payload.canvas.components[0].block.settings.unexpected = true
      },
      '$.canvas.components[0].block.settings.unexpected',
    ],
    [
      'background image settings',
      (payload: any) => {
        payload.canvas.components[0].block.settings.backgroundImage = {
          url: '',
          repeat: 'no-repeat',
          size: 'cover',
          position: 'center',
          unexpected: true,
        }
      },
      '$.canvas.components[0].block.settings.backgroundImage.unexpected',
    ],
    [
      'row',
      (payload: any) => {
        payload.canvas.components[0].block.rows[0].unexpected = true
      },
      '$.canvas.components[0].block.rows[0].unexpected',
    ],
    [
      'row settings',
      (payload: any) => {
        payload.canvas.components[0].block.rows[0].settings.unexpected = true
      },
      '$.canvas.components[0].block.rows[0].settings.unexpected',
    ],
    [
      'cell',
      (payload: any) => {
        payload.canvas.components[0].block.rows[0].cells[0].unexpected = true
      },
      '$.canvas.components[0].block.rows[0].cells[0].unexpected',
    ],
    [
      'cell settings',
      (payload: any) => {
        payload.canvas.components[0].block.rows[0].cells[0].settings.unexpected = true
      },
      '$.canvas.components[0].block.rows[0].cells[0].settings.unexpected',
    ],
    [
      'atom',
      (payload: any) => {
        payload.canvas.components[0].block.rows[0].cells[0].children[0].unexpected = true
      },
      '$.canvas.components[0].block.rows[0].cells[0].children[0].unexpected',
    ],
    [
      'atom spacing',
      (payload: any) => {
        payload.canvas.components[0].block.rows[0].cells[0].children[0].spacing.unexpected = true
      },
      '$.canvas.components[0].block.rows[0].cells[0].children[0].spacing.unexpected',
    ],
  ] as const)('rejects unknown properties in %s', (_label, mutate, expectedPath) => {
    const payload = envelope({ id: 'strict', version: 1, block: createBlockNode('Strict') })
    mutate(payload)

    const result = parseTemplateExportPayload(payload)

    expect(result.payload).toBeUndefined()
    expect(result.issues).toContainEqual({
      path: expectedPath,
      message: 'Unknown property "unexpected"',
    })
  })

  it.each(['text', 'button', 'divider', 'image'] as const)(
    'rejects unknown properties in %s atoms',
    (type) => {
      const atom = createAtom(type) as unknown as Record<string, unknown>
      atom.unexpected = true
      const block = createBlockNode('Strict atom', [createRowNode([createCellNode([atom as any])])])

      const result = parseTemplateExportPayload(
        envelope({ id: `strict-${type}`, version: 1, block }),
      )

      expect(result.payload).toBeUndefined()
      expect(result.issues).toContainEqual({
        path: '$.canvas.components[0].block.rows[0].cells[0].children[0].unexpected',
        message: 'Unknown property "unexpected"',
      })
    },
  )

  it('rejects an old component version inside a v1 envelope', () => {
    const result = parseTemplateExportPayload(
      envelope({ id: 'old-component', version: 3, block: createBlockNode('Old') }),
    )

    expect(result.payload).toBeUndefined()
    expect(result.issues).toContainEqual({
      path: '$.canvas.components[0].version',
      message: 'Only block-v1 components are supported (component.version must be 1)',
    })
  })

  it.each(['replace', 'append'] as const)(
    'keeps editor state and storage unchanged when an old JSON %s import is rejected',
    (mode) => {
      const canvas = useCanvas()
      const current = canvas.insertBlockToCanvas('Current')
      canvas.general.previewText = 'Keep me'
      useSelection().selectBlock(current.id, { syncTree: false })
      useHistory().resetHistory()
      window.localStorage.setItem(TEMPLATE_LOCAL_STORAGE_KEY, 'keep-storage')

      const canvasBefore = JSON.stringify(canvas.installed.value)
      const generalBefore = JSON.stringify(canvas.general)
      const selectionBefore = useSelection().captureSelectionSnapshot()
      const canUndoBefore = useHistory().canUndo.value
      const oldBlock = createBlockNode('Old')
      const oldPayload = envelope({ id: 'old-component', version: 3, block: oldBlock }, 3)

      const result = useTemplateIO().importTemplateFromJson(JSON.stringify(oldPayload), mode)

      expect(result.ok).toBe(false)
      expect(result.issues).toContainEqual({
        path: '$.version',
        message: 'Unsupported template version 3. Expected 1',
      })
      expect(JSON.stringify(canvas.installed.value)).toBe(canvasBefore)
      expect(JSON.stringify(canvas.general)).toBe(generalBefore)
      expect(useSelection().captureSelectionSnapshot()).toEqual(selectionBefore)
      expect(useHistory().canUndo.value).toBe(canUndoBefore)
      expect(window.localStorage.getItem(TEMPLATE_LOCAL_STORAGE_KEY)).toBe('keep-storage')
    },
  )

  it('uses the same ordered array for nested row and atom CRUD', () => {
    const canvas = useCanvas()
    const component = canvas.insertBlockToCanvas('CRUD')!
    const row = component.block.rows[0]!
    const cell = row.cells[0]!
    const nested = canvas.insertRowToCell(component.block.id, row.id, cell.id)!
    const image = canvas.insertAtomToCell(component.block.id, row.id, cell.id, 'image')!

    expect(cell.children.map(child => child.id)).toEqual([
      cell.children[0]!.id,
      nested.id,
      image.id,
    ])
    expect(canvas.findRowById(nested.id)?.id).toBe(nested.id)
    expect(canvas.findCellById(nested.cells[0]!.id)?.id).toBe(nested.cells[0]!.id)
  })

  it('loads all catalog presets as strict v1 payloads', () => {
    const presets = [content, cta, ecommerce, feature, footer, header, menu, transactional].flat()
    expect(presets).toHaveLength(78)
    for (const preset of presets) {
      assertCanonicalCatalogButtons(preset.block)
      const result = parseTemplateExportPayload(
        envelope({
          id: preset.id,
          version: preset.version,
          block: preset.block,
        }),
      )
      expect(result.issues, preset.name).toEqual([])
    }
  })

  it('hydrates the current v1 localStorage payload', () => {
    const block = createBlockNode('Current storage')
    const payload = envelope({ id: 'current-storage', version: 1, block })

    window.localStorage.setItem(TEMPLATE_LOCAL_STORAGE_KEY, JSON.stringify(payload))

    const result = usePersistence().hydrateTemplateFromLocalStorage()
    expect(result).toEqual({ ok: true, issues: [] })
    expect(useCanvas().installed.value[0]!.version).toBe(1)
    expect(useCanvas().installed.value[0]!.block.rows[0]!.type).toBe('row')
  })

  it('aligns nested hug rows and preserves row margins in export HTML', () => {
    const centered = createTextMenuRow(['Center'])
    centered.settings.spacing.margin = [3, 4, 5, 6]
    const right = createTextMenuRow(['Right'])
    const row = createRowNode([createCellNode([centered]), createCellNode([right])])
    row.cells[0]!.settings.horizontalAlign = 'center'
    row.cells[1]!.settings.horizontalAlign = 'right'

    const ExportRoot = defineComponent({
      setup: () => () => h(ExportBlockRendererRowNode, { row }),
    })
    const PreviewRoot = defineComponent({
      setup: () => () => h(BlockRendererRowNode, { blockId: 'block', row }),
    })

    for (const html of [renderEmailHtml(PreviewRoot), renderEmailHtml(ExportRoot)]) {
      expect(html).toContain('padding: 3px 4px 5px 6px; text-align: center')
      expect(html).toContain('align="center"')
      expect(html).toContain('margin-left: auto; margin-right: auto')
      expect(html).toContain('text-align: right')
      expect(html).toContain('align="right"')
      expect(html).toContain('margin-left: auto; margin-right: 0px')
    }
  })

  it('exports align variants with email-safe table wrappers', () => {
    const alignments = [
      { horizontal: 'left', vertical: 'top' },
      { horizontal: 'center', vertical: 'middle' },
      { horizontal: 'right', vertical: 'bottom' },
    ] as const
    const cells = alignments.map(({ horizontal, vertical }) => {
      const nested = createTextMenuRow([horizontal])
      const cell = createCellNode([nested])
      cell.settings.horizontalAlign = horizontal
      cell.settings.verticalAlign = vertical
      cell.settings.height = 120
      return cell
    })
    const block = createBlockNode('Align matrix', [createRowNode(cells)])
    const ExportRoot = defineComponent({
      setup: () => () =>
        h(EmailExportDocument, {
          components: [{ id: 'component', version: 1, block }],
          general,
        }),
    })

    const html = renderEmailHtml(ExportRoot)
    const document = new DOMParser().parseFromString(html, 'text/html')
    const tables = [...document.querySelectorAll('table')]
    const cellsInHtml = [...document.querySelectorAll('td')]

    expect(html).toContain('<!DOCTYPE html')
    expect(html).not.toMatch(/<script|contenteditable|display:\s*(?:flex|grid)/i)
    expect(tables.length).toBeGreaterThanOrEqual(8)
    expect(tables.every(table => table.querySelector(':scope > tbody > tr > td'))).toBe(true)

    for (const { horizontal, vertical } of alignments) {
      expect(cellsInHtml.some(cell => cell.getAttribute('align') === horizontal)).toBe(true)
      expect(cellsInHtml.some(cell => cell.style.verticalAlign === vertical)).toBe(true)
    }

    expect(html).toContain('width: auto; table-layout: auto')
    expect(html).toContain('margin-left: auto; margin-right: auto')
    expect(html).toContain('margin-left: auto; margin-right: 0px')
  })
})
