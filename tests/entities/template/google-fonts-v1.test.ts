// @vitest-environment jsdom
import type { CanvasBlockInstance } from '@/entities/template'
import { render as renderEmailHtml } from '@mysigmail/vue-email-components'
import { describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick } from 'vue'
import { createBlockNode } from '@/entities/block'
import { parseTemplateExportJson, TEMPLATE_EXPORT_VERSION } from '@/entities/template'
import { useCanvas, useTemplateIO } from '@/features/editor/model'
import EditorCanvas from '@/features/editor/ui/EditorCanvas.vue'
import EmailExportDocument from '@/features/email-preview/ui/EmailExportDocument.vue'

const googleFontStack = '"Inter", Arial, Helvetica, sans-serif'
const customFallbackStack = '"Inter", Verdana, Arial, sans-serif'

function general(font: string) {
  return {
    padding: [0, 0, 0, 0] as [number, number, number, number],
    background: {
      color: '#ffffff',
      image: '',
      repeat: 'no-repeat' as const,
      size: 'cover' as const,
      position: 'center' as const,
    },
    font,
    previewText: '',
  }
}

function render(font: string, components: CanvasBlockInstance[] = []) {
  const Root = defineComponent({
    setup: () => () => h(EmailExportDocument, { components, general: general(font) }),
  })
  return renderEmailHtml(Root)
}

describe('google Fonts template v1 integration', () => {
  it('loads a Google stylesheet in the document head for the Shadow DOM preview', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe() {}
        disconnect() {}
      },
    )
    const canvas = useCanvas()
    const previousFont = canvas.general.font
    canvas.general.font = googleFontStack
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(EditorCanvas)

    try {
      app.mount(host)
      await nextTick()

      const link = document.head.querySelector<HTMLLinkElement>('link[data-card-google-font]')
      expect(link?.href).toBe(
        'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap',
      )
    }
    finally {
      app.unmount()
      host.remove()
      canvas.general.font = previousFont
      vi.unstubAllGlobals()
    }

    expect(document.head.querySelector('link[data-card-google-font]')).toBeNull()
  })

  it('exports a Google stylesheet resource while preserving the inline fallback stack', () => {
    const html = render(customFallbackStack)

    expect(html).toContain(
      'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900',
    )
    expect(html).toContain('font-family: &quot;Inter&quot;, Verdana, Arial, sans-serif')
  })

  it('exports Google resources used by inline text styles', () => {
    const block = createBlockNode('Inline font')
    const atom = block.rows[0]!.cells[0]!.children[0]!
    if (atom.type !== 'text')
      throw new Error('Expected a text atom fixture')
    atom.value = '<span style="font-family: &quot;Roboto Slab&quot;, Georgia, serif;">Text</span>'

    const html = render('Arial, Helvetica, sans-serif', [{ id: 'inline-font', version: 1, block }])

    expect(html).toContain('fonts.googleapis.com/css2?family=Roboto+Slab:')
    expect(html).not.toContain('family=Inter:')
  })

  it('keeps global and inline fonts in the final sanitized email export', () => {
    const canvas = useCanvas()
    const previousComponents = canvas.installed.value
    const previousGeneral = JSON.parse(JSON.stringify(canvas.general))
    const block = createBlockNode('Final export')
    const atom = block.rows[0]!.cells[0]!.children[0]!
    if (atom.type !== 'text')
      throw new Error('Expected a text atom fixture')
    atom.value = '<span style="font-family: &quot;Roboto Slab&quot;, Georgia, serif;">Text</span>'

    canvas.installed.value = [{ id: 'final-export-font', version: 1, block }]
    Object.assign(canvas.general, general(customFallbackStack))

    try {
      const html = useTemplateIO().exportTemplateHtml()
      expect(html).toContain('family=Inter:')
      expect(html).toContain('family=Roboto+Slab:')
      expect(html).toContain('font-family: &quot;Inter&quot;, Verdana, Arial, sans-serif')
      expect(html).toContain('font-family:&quot;Roboto Slab&quot;, Georgia, serif')
    }
    finally {
      canvas.installed.value = previousComponents
      Object.assign(canvas.general, previousGeneral)
    }
  })

  it('does not request Google Fonts for system or unknown font stacks', () => {
    expect(render('Arial, Helvetica, sans-serif')).not.toContain('fonts.googleapis.com')
    expect(render('"Unknown Font", Arial, sans-serif')).not.toContain('fonts.googleapis.com')
  })

  it('keeps the font stack through JSON export/import without changing contract version', () => {
    const payload = {
      version: TEMPLATE_EXPORT_VERSION,
      meta: {
        id: 'font-test',
        title: 'Font test',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      editor: { general: general(googleFontStack) },
      canvas: { components: [] },
    }
    const result = parseTemplateExportJson(JSON.stringify(payload))

    expect(result.issues).toEqual([])
    expect(result.payload?.version).toBe(1)
    expect(result.payload?.editor.general.font).toBe(googleFontStack)
  })
})
