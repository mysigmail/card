// @vitest-environment jsdom
import { render as renderEmailHtml } from '@mysigmail/vue-email-components'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { createBlockNode, createCellNode, createRowNode, createTextMenuRow } from '@/entities/block'
import {
  createRuntimeComponents,
  createTemplateExportPayload,
  parseTemplateExportPayload,
  TEMPLATE_EXPORT_VERSION,
  TEMPLATE_LEGACY_LOCAL_STORAGE_KEY,
  TEMPLATE_LOCAL_STORAGE_KEY,
} from '@/entities/template'
import { useCanvas, usePersistence } from '@/features/editor/model'
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

function envelope(component: unknown, version: 2 | 3 = 3) {
  return {
    version,
    meta: {
      id: 'template',
      title: 'Fixture',
      createdAt: '1970-01-01T00:00:00.000Z',
      updatedAt: '1970-01-01T00:00:00.000Z',
    },
    editor: { general },
    canvas: { components: [component] },
  }
}

describe('ordered cell children v3', () => {
  beforeEach(() => {
    useCanvas().installed.value = []
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
      installed: [{ id: 'component', version: 3, block }],
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

  it('migrates a v2 menu atom to an ordinary hug row with editable leaf atoms', () => {
    const block = createBlockNode('Legacy menu') as unknown as Record<string, any>
    const cell = block.rows[0].cells[0]
    cell.atoms = [
      {
        id: 'menu',
        type: 'menu',
        itemType: 'text',
        gap: 12,
        items: [
          {
            type: 'text',
            text: 'Docs',
            link: 'https://example.com/docs',
            color: '#123456',
            fontSize: 15,
          },
          {
            type: 'image',
            name: 'Logo',
            link: 'https://example.com',
            url: '/logo.png',
            alt: 'Logo',
            width: 20,
          },
        ],
        spacing: {},
      },
    ]
    cell.rows = []
    delete cell.children
    delete block.rows[0].type
    delete block.rows[0].settings.widthMode

    const result = parseTemplateExportPayload(envelope({ id: 'legacy', version: 2, block }, 2))
    expect(result.issues).toEqual([])
    const menu = result.payload!.canvas.components[0]!.block.rows[0]!.cells[0]!.children[0]!
    expect(menu.type).toBe('row')
    if (menu.type !== 'row')
      throw new Error('Expected migrated menu row')
    expect(menu.settings.widthMode).toBe('hug')
    expect(menu.settings.collapseOnMobile).toBe(false)
    expect(menu.settings.gap).toBe(12)
    expect(menu.cells.map(item => item.children[0]!.type)).toEqual(['text', 'image'])
    expect(JSON.stringify(result.payload)).not.toContain('"type":"menu"')
  })

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

  it('loads all catalog presets as strict v3 payloads', () => {
    const presets = [content, cta, ecommerce, feature, footer, header, menu, transactional].flat()
    expect(presets).toHaveLength(78)
    for (const preset of presets) {
      const result = parseTemplateExportPayload(envelope(preset))
      expect(result.issues, preset.name).toEqual([])
    }
  })

  it('hydrates a legacy v2 localStorage payload when the v3 key is absent', () => {
    const block = createBlockNode('Legacy storage') as unknown as Record<string, any>
    const row = block.rows[0]
    const cell = row.cells[0]
    row.settings.widthMode = undefined
    delete row.type
    cell.atoms = cell.children
    cell.rows = []
    delete cell.children
    const payload = envelope({ id: 'legacy-storage', version: 2, block }, 2)

    window.localStorage.setItem(TEMPLATE_LEGACY_LOCAL_STORAGE_KEY, JSON.stringify(payload))
    expect(window.localStorage.getItem(TEMPLATE_LOCAL_STORAGE_KEY)).toBeNull()

    const result = usePersistence().hydrateTemplateFromLocalStorage()
    expect(result).toEqual({ ok: true, issues: [] })
    expect(useCanvas().installed.value[0]!.version).toBe(3)
    expect(useCanvas().installed.value[0]!.block.rows[0]!.type).toBe('row')
  })

  it('aligns nested hug rows and preserves migrated menu margins in export HTML', () => {
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
          components: [{ id: 'component', version: 3, block }],
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
