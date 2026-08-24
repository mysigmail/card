// @vitest-environment jsdom
import { render } from '@mysigmail/vue-email-components'
import { Editor } from '@tiptap/vue-3'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { createBlockNode, createButtonAtom } from '@/entities/block'
import {
  parseTemplateExportPayload,
  sanitizeButtonEditorHtml,
  TEMPLATE_EXPORT_VERSION,
} from '@/entities/template'
import { useInlineTextEditing } from '@/features/editor/components/tools/text/composables/use-inline-text-editing'
import { createInlineButtonExtensions } from '@/features/editor/components/tools/text/text-editor-core'
import { useCanvas, useHistory } from '@/features/editor/model'
import BlockRendererRowNode from '@/features/email-preview/ui/BlockRendererRowNode.vue'
import ExportBlockRenderer from '@/features/email-preview/ui/ExportBlockRenderer.vue'

function templateWithButton(button = createButtonAtom()) {
  const block = createBlockNode('Button')
  block.rows[0]!.cells[0]!.children = [button]
  return {
    block,
    payload: {
      version: TEMPLATE_EXPORT_VERSION,
      meta: {
        id: 'button-template',
        title: 'Button',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      editor: {
        general: {
          padding: [0, 0, 0, 0],
          background: {
            color: '#FFFFFF',
            image: '',
            repeat: 'no-repeat',
            size: 'cover',
            position: 'center',
          },
          font: 'Arial',
          previewText: '',
        },
      },
      canvas: { components: [{ id: 'button-component', version: 1 as const, block }] },
    },
  }
}

describe('button inline editing contract', () => {
  it('keeps only email-safe inline markup and never persists nested links or breaks', () => {
    const sanitized = sanitizeButtonEditorHtml(
      '<p><a href="https://nested.example"><strong>Buy</strong><br><span style="color:#abc;font-size:18px;text-align:right"> now</span></a></p><ul><li>Today</li></ul>',
    )

    expect(sanitized).toBe(
      '<strong>Buy</strong><span style="color:#AABBCC;font-size:18px"> now</span>Today',
    )
    expect(sanitized).not.toMatch(/<(?:a|br|p|ul|li)\b/i)
  })

  it('uses an inline-only Tiptap schema for button labels', () => {
    const editor = new Editor({
      content: '<p>One<br><a href="https://nested.example">Two</a></p><ul><li>Three</li></ul>',
      extensions: createInlineButtonExtensions(),
    })

    const html = editor.getHTML()
    expect(html).toBe('One TwoThree')
    expect(html).not.toMatch(/<(?:a|br|p|ul|li)\b/i)
    editor.destroy()
  })

  it('exposes persisted button typography as active Tiptap text-style attributes', () => {
    const button = createButtonAtom()
    const editor = new Editor({
      content: button.value,
      extensions: createInlineButtonExtensions(),
    })
    editor.commands.setTextSelection(1)

    expect(editor.getAttributes('textStyle')).toMatchObject({
      color: 'rgb(255, 255, 255)',
      fontSize: '16px',
    })
    editor.destroy()
  })

  it('strictly accepts value, rejects legacy text, and sanitizes the round-trip', () => {
    const button = createButtonAtom()
    button.value = '<p><a href="https://nested.example"><em>Buy</em></a></p>'
    const { payload } = templateWithButton(button)
    const result = parseTemplateExportPayload(payload)

    expect(result.issues).toEqual([])
    const parsedButton = result.payload!.canvas.components[0]!.block.rows[0]!.cells[0]!.children[0]!
    expect(parsedButton).toMatchObject({ type: 'button', value: '<em>Buy</em>' })

    const legacy = structuredClone(payload)
    const legacyButton = legacy.canvas.components[0]!.block.rows[0]!.cells[0]!.children[0]!
    Object.assign(legacyButton, { text: 'Legacy' })
    delete (legacyButton as { value?: string }).value
    const legacyResult = parseTemplateExportPayload(legacy)
    expect(legacyResult.payload).toBeUndefined()
    expect(legacyResult.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: expect.stringContaining('.text') }),
        expect.objectContaining({ path: expect.stringContaining('.value') }),
      ]),
    )

    const obsolete = structuredClone(payload)
    const obsoleteButton = obsolete.canvas.components[0]!.block.rows[0]!.cells[0]!.children[0]!
    Object.assign(obsoleteButton, { color: '#FFFFFF', fontSize: 16 })
    const obsoleteResult = parseTemplateExportPayload(obsolete)
    expect(obsoleteResult.payload).toBeUndefined()
    expect(obsoleteResult.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: expect.stringContaining('.color') }),
        expect.objectContaining({ path: expect.stringContaining('.fontSize') }),
      ]),
    )
  })

  it('renders one outer button link and sanitized inline label HTML in export', () => {
    const button = createButtonAtom()
    button.link = 'https://outer.example'
    button.value = '<strong>Buy</strong><a href="https://nested.example"> now</a>'
    const { block } = templateWithButton(button)
    const Root = defineComponent({ setup: () => () => h(ExportBlockRenderer, { block }) })
    const html = render(Root)

    expect(html).toContain('<strong>Buy</strong> now')
    expect(html.match(/<a\b/g)).toHaveLength(1)
    expect(html).toContain('href="https://outer.example"')
    expect(html).not.toContain('nested.example')
  })

  it('groups typed gateway updates into app history and supports undo/redo', () => {
    vi.useFakeTimers()
    const canvas = useCanvas()
    const history = useHistory()
    const button = createButtonAtom()
    const { block } = templateWithButton(button)
    const ref = {
      kind: 'atom' as const,
      blockId: block.id,
      rowId: block.rows[0]!.id,
      cellId: block.rows[0]!.cells[0]!.id,
      atomId: button.id,
      atomType: 'button' as const,
    }
    canvas.installed.value = [{ id: 'button-component', version: 1, block }]
    history.resetHistory()

    canvas.updateNodeProperty({ ref, property: 'value', value: '<strong>B</strong>' })
    canvas.updateNodeProperty({ ref, property: 'value', value: '<strong>Buy</strong>' })
    vi.advanceTimersByTime(301)
    expect(history.undo()).toBe(true)
    expect(canvas.getNodePropertyState(ref, 'value')).toMatchObject({
      value: '<span style="color:#FFFFFF;font-size:16px">Button</span>',
    })
    expect(history.redo()).toBe(true)
    expect(canvas.getNodePropertyState(ref, 'value')).toMatchObject({
      value: '<strong>Buy</strong>',
    })

    canvas.installed.value = []
    history.resetHistory()
    vi.useRealTimers()
  })

  it('removes the navigation target while the button label is being edited', () => {
    const button = createButtonAtom()
    button.link = 'https://navigation-must-be-disabled.example'
    const { block } = templateWithButton(button)
    const { editingAtomId, stopEditing } = useInlineTextEditing()
    editingAtomId.value = button.id
    const Root = defineComponent({
      setup: () => () => h(BlockRendererRowNode, { blockId: block.id, row: block.rows[0]! }),
    })

    const html = render(Root)
    expect(html).not.toContain('navigation-must-be-disabled.example')
    stopEditing(button.id)
  })
})
