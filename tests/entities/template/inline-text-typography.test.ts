// @vitest-environment jsdom
import { Editor } from '@tiptap/vue-3'
import { describe, expect, it, vi } from 'vitest'
import { createBlockNode } from '@/entities/block'
import {
  createRuntimeComponents,
  parseTemplateExportPayload,
  sanitizeTextEditorHtml,
  TEMPLATE_EXPORT_VERSION,
} from '@/entities/template'
import {
  canPersistInlineTextOnUnmount,
  replaceEditorContent,
  textSelectionPositionAtOffset,
} from '@/features/editor/components/tools/text/inline-text-session'
import {
  createInlineTextExtensions,
  normalizeInlineEditorHtml,
} from '@/features/editor/components/tools/text/text-editor-core'
import { useCanvas, useHistory, useTemplateIO } from '@/features/editor/model'

describe('inline text typography contract', () => {
  it('maps a visual text offset to the matching Tiptap selection', () => {
    const editor = new Editor({
      content: '<p><strong>Before</strong> menu<br>next</p>',
      extensions: createInlineTextExtensions(),
    })

    const middlePosition = textSelectionPositionAtOffset(editor, 7)
    editor.chain().setTextSelection(middlePosition).insertContent('X').run()
    expect(editor.getHTML()).toContain('<strong>Before</strong> Xmenu')

    const afterBreakPosition = textSelectionPositionAtOffset(editor, 13)
    editor.chain().setTextSelection(afterBreakPosition).insertContent('Y').run()
    expect(editor.getHTML()).toContain('<br>Ynext')
    editor.destroy()
  })

  it('keeps inherited and nested colors across sanitizer and Tiptap round-trips', () => {
    const input = sanitizeTextEditorHtml(
      '<div style="color:#1F1712"><p>Base <span style="color:#FF6B00">accent</span></p><ul><li>List item</li></ul><p>Second root</p></div>',
    )
    const editor = new Editor({ content: input, extensions: createInlineTextExtensions() })

    const output = sanitizeTextEditorHtml(editor.getHTML())
    editor.destroy()

    expect(output).toContain('<div style="color:rgb(31, 23, 18)">')
    expect(output).toContain('<span style="color:rgb(255, 107, 0)">accent</span>')
    expect(output).toContain('<ul><li><p>List item</p></li></ul>')

    const secondEditor = new Editor({ content: output, extensions: createInlineTextExtensions() })
    expect(sanitizeTextEditorHtml(secondEditor.getHTML())).toBe(output)
    secondEditor.destroy()
  })

  it('drops legacy top-level text color from the canonical payload', () => {
    const component = {
      id: 'component',
      version: 3 as const,
      block: createBlockNode('Text'),
    }
    const atom = component.block.rows[0]!.cells[0]!.children[0]!
    Object.assign(atom, { color: '#1F1712', unknown: 'drop-me' })

    const result = parseTemplateExportPayload({
      version: TEMPLATE_EXPORT_VERSION,
      meta: {
        id: 'template',
        title: 'Text',
        createdAt: '1970-01-01T00:00:00.000Z',
        updatedAt: '1970-01-01T00:00:00.000Z',
      },
      editor: {
        general: {
          padding: [0, 0, 0, 0],
          background: {
            color: '#ffffff',
            image: '',
            repeat: 'no-repeat',
            size: 'cover',
            position: 'center',
          },
          font: 'Arial',
          previewText: '',
        },
      },
      canvas: { components: [component] },
    })

    expect(result.issues).toEqual([])
    expect(
      result.payload?.canvas.components[0]!.block.rows[0]!.cells[0]!.children[0],
    ).not.toHaveProperty('color')
    expect(
      result.payload?.canvas.components[0]!.block.rows[0]!.cells[0]!.children[0],
    ).not.toHaveProperty('unknown')
  })

  it('keeps legacy HTML and accepted typography while removing unsafe content', () => {
    const input = [
      '<p onclick="alert(1)" style="text-align: center">Legacy <strong>bold</strong></p>',
      '<ul><li><span style="font-family: Arial, Helvetica, sans-serif; font-size: 24px; font-weight: 700; line-height: 1.5; letter-spacing: 1px; color: #123456">Item <sup>2</sup><sub>x</sub></span></li></ul>',
      '<a href="javascript:alert(1)" style="position: fixed">unsafe</a>',
      '<script>alert(1)</script>',
    ].join('')

    const output = sanitizeTextEditorHtml(input)

    expect(output).toContain('<p style="text-align:center">Legacy <strong>bold</strong></p>')
    expect(output).toContain('<ul><li><span')
    expect(output).toContain('font-family:Arial, Helvetica, sans-serif')
    expect(output).toContain('<sup>2</sup><sub>x</sub>')
    expect(output).not.toContain('onclick')
    expect(output).not.toContain('javascript:')
    expect(output).not.toContain('position')
    expect(output).not.toContain('<script')
  })

  it('round-trips supported marks through the shared Tiptap schema', () => {
    const input = sanitizeTextEditorHtml(
      '<ol><li><p style="text-align: right"><span style="font-family: Arial, Helvetica, sans-serif; font-size: 20px; font-weight: 600; line-height: 1.4; letter-spacing: 0.5px; color: #396bdd"><strong><u>Text</u></strong><sup>2</sup></span></p></li></ol>',
    )
    const editor = new Editor({ content: input, extensions: createInlineTextExtensions() })

    const output = sanitizeTextEditorHtml(editor.getHTML())
    editor.destroy()

    expect(output).toContain('<ol>')
    expect(output).toContain('text-align:right')
    expect(output).toContain('font-size:20px')
    expect(output).toContain('font-weight:600')
    expect(output).toContain('line-height:1.4')
    expect(output).toContain('letter-spacing:0.5px')
    expect(output).toContain('<strong><u>Text</u><sup>2</sup></strong>')
    expect(output).toContain('<sup>2</sup>')
  })

  it('preserves legacy typography values and allowed block structure', () => {
    const legacy = sanitizeTextEditorHtml(
      '<h1 style="font-family: Inter, Arial, sans-serif; color: #123456; text-align: center">Heading</h1><blockquote style="line-height: 1.4"><p><code style="color: #654321">Code</code></p></blockquote><div style="font-size: 18px"><h2 style="font-weight: 700">Nested heading</h2><p style="line-height: 1.2em">Nested paragraph</p></div><div><span style="font-family: Inter, Arial, sans-serif; font-size: 1.2em; line-height: 24px; letter-spacing: 1.2">Legacy</span></div><p style="font-size: 120%; line-height: 1.2em; letter-spacing: 0.1rem; text-align: right">Units</p><ul style="font-family: Inter, Arial, sans-serif; line-height: 1.4"><li>Bullet</li></ul><ol style="font-size: 18px; color: #123456"><li>Ordered</li></ol><hr>',
    )
    const editor = new Editor({ content: legacy, extensions: createInlineTextExtensions() })
    const editorHtml = editor.getHTML()
    const output = sanitizeTextEditorHtml(editorHtml)
    editor.destroy()

    expect(editorHtml).toContain(
      '<h1 style="text-align: center; color: rgb(18, 52, 86); font-family: Inter, Arial, sans-serif;">Heading</h1>',
    )
    expect(editorHtml).toContain(
      '<blockquote style="line-height: 1.4;"><p><code style="color: rgb(101, 67, 33);">Code</code></p></blockquote>',
    )
    expect(editorHtml).toContain(
      '<div style="font-size: 18px;"><h2 style="font-weight: 700;"><strong>Nested heading</strong></h2><p style="line-height: 1.2em;">Nested paragraph</p></div>',
    )
    expect(editorHtml).toContain(
      '<ul style="font-family: Inter, Arial, sans-serif; line-height: 1.4;"><li><p>Bullet</p></li></ul>',
    )
    expect(editorHtml).toContain(
      '<ol style="color: rgb(18, 52, 86); font-size: 18px;"><li><p>Ordered</p></li></ol>',
    )
    expect(output).toContain('<div><span')
    expect(output).toContain('font-family:Inter, Arial, sans-serif')
    expect(output).toContain('font-size:1.2em')
    expect(output).toContain('line-height:24px')
    expect(output).toContain('letter-spacing:1.2')
    expect(output).toContain('font-size:120%')
    expect(output).toContain('line-height:1.2em')
    expect(output).toContain('letter-spacing:0.1rem')
    expect(output).toContain('<hr />')
  })

  it('normalizes mixed div inline runs without losing order or typography', () => {
    const input = sanitizeTextEditorHtml(
      '<div style="font-family: Inter, Arial, sans-serif">Intro<p style="line-height: 1.4">Body</p><span style="color: #123456">Outro</span></div>',
    )
    const normalized = normalizeInlineEditorHtml(input)

    expect(normalized).toBe(
      '<div style="font-family:Inter, Arial, sans-serif"><p>Intro</p><p style="line-height:1.4">Body</p><p><span style="color:#123456">Outro</span></p></div>',
    )

    const firstEditor = new Editor({
      content: normalized,
      extensions: createInlineTextExtensions(),
    })
    const firstRoundTrip = firstEditor.getHTML()
    firstEditor.destroy()

    expect(firstRoundTrip.indexOf('Intro')).toBeLessThan(firstRoundTrip.indexOf('Body'))
    expect(firstRoundTrip.indexOf('Body')).toBeLessThan(firstRoundTrip.indexOf('Outro'))
    expect(firstRoundTrip).toContain('font-family: Inter, Arial, sans-serif;')
    expect(firstRoundTrip).toContain('line-height: 1.4;')
    expect(firstRoundTrip).toContain('color: rgb(18, 52, 86);')

    const secondEditor = new Editor({
      content: normalizeInlineEditorHtml(firstRoundTrip),
      extensions: createInlineTextExtensions(),
    })
    expect(secondEditor.getHTML()).toBe(firstRoundTrip)
    secondEditor.destroy()
  })

  it('replaces external content outside Tiptap history', () => {
    const editor = new Editor({
      content: '<p>Initial</p>',
      extensions: createInlineTextExtensions(),
    })
    editor.commands.focus('end')
    editor.commands.insertContent(' typed')
    expect(editor.getHTML()).toBe('<p>Initial typed</p>')

    replaceEditorContent(editor, '<p>External snapshot</p>')

    expect(editor.getHTML()).toBe('<p>External snapshot</p>')
    expect(editor.commands.undo()).toBe(false)
    expect(editor.getHTML()).toBe('<p>External snapshot</p>')
    editor.destroy()
  })

  it('keeps template v3 and remaps every runtime id', () => {
    const component = {
      id: 'component-id',
      version: 3 as const,
      block: createBlockNode('Typography'),
    }
    const sourceIds = [
      component.id,
      component.block.id,
      component.block.rows[0]!.id,
      component.block.rows[0]!.cells[0]!.id,
      component.block.rows[0]!.cells[0]!.children[0]!.id,
    ]

    const [runtime] = createRuntimeComponents([component])
    const runtimeIds = [
      runtime!.id,
      runtime!.block.id,
      runtime!.block.rows[0]!.id,
      runtime!.block.rows[0]!.cells[0]!.id,
      runtime!.block.rows[0]!.cells[0]!.children[0]!.id,
    ]

    expect(TEMPLATE_EXPORT_VERSION).toBe(3)
    expect(runtime!.version).toBe(3)
    expect(runtimeIds).not.toEqual(sourceIds)
  })

  it('updates text by atom id and keeps replace/append imports independent of selection', () => {
    const canvas = useCanvas()
    const templateIO = useTemplateIO()
    const block = createBlockNode('Inline text')
    const atom = block.rows[0]!.cells[0]!.children[0]!
    canvas.installed.value = [{ id: 'source-component', version: 3, block }]

    expect(canvas.updateTextAtomValue(atom.id, '<p onclick="bad()"><sup>Safe</sup></p>')).toBe(true)
    expect(atom.type === 'text' ? atom.value : '').toBe('<p><sup>Safe</sup></p>')

    const payload = templateIO.exportTemplate('Inline text fixture')
    templateIO.applyImportedTemplate(payload, 'replace')
    expect(canvas.installed.value).toHaveLength(1)
    expect(canvas.installed.value[0]!.id).not.toBe('source-component')

    templateIO.applyImportedTemplate(payload, 'append')
    expect(canvas.installed.value).toHaveLength(2)
    expect(canvas.installed.value[0]!.id).not.toBe(canvas.installed.value[1]!.id)

    canvas.installed.value = []
  })

  it('does not let a stale editor overwrite an app undo snapshot on unmount', () => {
    vi.useFakeTimers()
    const canvas = useCanvas()
    const history = useHistory()
    const block = createBlockNode('Undo')
    const atom = block.rows[0]!.cells[0]!.children[0]!
    const originalValue = atom.type === 'text' ? atom.value : ''
    canvas.installed.value = [{ id: 'undo-component', version: 3, block }]
    history.resetHistory()

    const staleEditorValue = '<p>Typed value</p>'
    canvas.updateTextAtomValue(atom.id, staleEditorValue)
    vi.advanceTimersByTime(301)
    expect(history.undo()).toBe(true)
    expect(canvas.getTextAtomValue(atom.id)).toBe(originalValue)

    const canPersist = canPersistInlineTextOnUnmount({
      currentModelValue: canvas.getTextAtomValue(atom.id),
      finished: false,
      lastModelValue: staleEditorValue,
    })
    if (canPersist)
      canvas.updateTextAtomValue(atom.id, staleEditorValue)

    expect(canPersist).toBe(false)
    expect(canvas.getTextAtomValue(atom.id)).toBe(originalValue)
    canvas.installed.value = []
    history.resetHistory()
    vi.useRealTimers()
  })
})
