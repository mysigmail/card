// @vitest-environment jsdom

import type { Editor } from '@tiptap/vue-3'
import type { CSSProperties, Ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, ref } from 'vue'
import { useInlineToolbarPosition } from '@/features/editor/components/tools/text/composables/use-inline-toolbar-position'

function rect(top: number, height: number, width = 400, left = 200): DOMRect {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    top,
    width,
    x: left,
    y: top,
    toJSON: () => ({}),
  }
}

describe('inline toolbar positioning', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('tracks reference movement after reorder or scroll without relying on events', async () => {
    const frameCallbacks = new Map<number, FrameRequestCallback>()
    let frameId = 0
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frameId += 1
      frameCallbacks.set(frameId, callback)
      return frameId
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frameCallbacks.delete(id))

    const editorElement = document.createElement('div')
    const toolbarElement = document.createElement('div')
    let editorTop = 200
    vi.spyOn(editorElement, 'getBoundingClientRect').mockImplementation(() => rect(editorTop, 60))
    vi.spyOn(toolbarElement, 'getBoundingClientRect').mockImplementation(() => rect(0, 40, 300))

    const editor = {
      isDestroyed: false,
      view: { dom: editorElement },
    } as Editor
    const toolbar = ref<HTMLElement>(toolbarElement)
    let toolbarPosition: Ref<CSSProperties> | undefined
    const host = document.createElement('div')
    const app = createApp(
      defineComponent({
        setup() {
          toolbarPosition = useInlineToolbarPosition(editor, toolbar).toolbarPosition
          return () => h('div')
        },
      }),
    )

    app.mount(host)

    const runFrame = () => {
      const callback = frameCallbacks.values().next().value as FrameRequestCallback | undefined
      expect(callback).toBeTypeOf('function')
      frameCallbacks.clear()
      callback?.(performance.now())
    }

    runFrame()
    expect(toolbarPosition?.value).toMatchObject({ top: '152px', visibility: 'visible' })

    const stablePosition = toolbarPosition?.value
    runFrame()
    expect(toolbarPosition?.value).toBe(stablePosition)

    editorTop = 360
    runFrame()
    expect(toolbarPosition?.value).toMatchObject({ top: '312px', visibility: 'visible' })

    editorTop = -100
    runFrame()
    expect(toolbarPosition?.value).toEqual({ visibility: 'hidden' })

    app.unmount()
  })
})
