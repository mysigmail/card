import type { Editor } from '@tiptap/vue-3'
import type { CSSProperties, Ref } from 'vue'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const VIEWPORT_PADDING = 8
const TOOLBAR_GAP = 8

function samePosition(current: CSSProperties, next: CSSProperties) {
  return (
    current.top === next.top && current.left === next.left && current.visibility === next.visibility
  )
}

export function useInlineToolbarPosition(editor: Editor, toolbar: Ref<HTMLElement | undefined>) {
  const toolbarPosition = ref<CSSProperties>({ visibility: 'hidden' })
  let positionFrame: number | undefined

  function setPosition(nextPosition: CSSProperties) {
    if (!samePosition(toolbarPosition.value, nextPosition))
      toolbarPosition.value = nextPosition
  }

  function updatePosition() {
    if (!toolbar.value || editor.isDestroyed)
      return

    const editorRect = editor.view.dom.getBoundingClientRect()
    const toolbarRect = toolbar.value.getBoundingClientRect()
    const editorIsVisible
      = editorRect.bottom > 0
        && editorRect.top < window.innerHeight
        && editorRect.right > 0
        && editorRect.left < window.innerWidth

    if (!editorIsVisible) {
      setPosition({ visibility: 'hidden' })
      return
    }

    const top
      = editorRect.top - toolbarRect.height - TOOLBAR_GAP >= VIEWPORT_PADDING
        ? editorRect.top - toolbarRect.height - TOOLBAR_GAP
        : editorRect.bottom + TOOLBAR_GAP
    const maxLeft = Math.max(
      VIEWPORT_PADDING,
      window.innerWidth - toolbarRect.width - VIEWPORT_PADDING,
    )

    setPosition({
      top: `${Math.max(VIEWPORT_PADDING, top)}px`,
      left: `${Math.min(Math.max(VIEWPORT_PADDING, editorRect.left), maxLeft)}px`,
      visibility: 'visible',
    })
  }

  function trackPosition() {
    updatePosition()
    positionFrame = window.requestAnimationFrame(trackPosition)
  }

  onMounted(() => {
    positionFrame = window.requestAnimationFrame(trackPosition)
  })

  onBeforeUnmount(() => {
    if (positionFrame !== undefined)
      window.cancelAnimationFrame(positionFrame)
  })

  return {
    toolbarPosition,
  }
}
