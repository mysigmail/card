import type { CSSProperties, Ref } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import { useCanvas, useSelection } from '@/features/editor/model'

interface SelectionRect {
  top: number
  right: number
  bottom: number
  left: number
  width: number
  height: number
}

const TEXT_BLOCK_SELECTOR = 'p,h1,h2,h3,h4,h5,h6,blockquote,li'

export function resolveSelectionVisualTarget(
  nodeTarget: HTMLElement,
  selectionLevel?: 'block' | 'row' | 'cell' | 'atom',
) {
  return selectionLevel === 'atom'
    ? nodeTarget.querySelector<HTMLElement>('[data-selection-owner]') || nodeTarget
    : nodeTarget
}

function measureTextContent(container: HTMLElement): SelectionRect | undefined {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let bounds: SelectionRect | undefined
  let current = walker.nextNode()

  while (current) {
    if (current.textContent?.trim()) {
      const range = document.createRange()
      range.selectNodeContents(current)
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width <= 0 || rect.height <= 0)
          continue
        const block = current.parentElement?.closest<HTMLElement>(TEXT_BLOCK_SELECTOR)
        const blockRect = block?.getBoundingClientRect()
        const top = blockRect?.top ?? rect.top
        const bottom = blockRect?.bottom ?? rect.bottom
        bounds = bounds
          ? {
              top: Math.min(bounds.top, top),
              right: Math.max(bounds.right, rect.right),
              bottom: Math.max(bounds.bottom, bottom),
              left: Math.min(bounds.left, rect.left),
              width: 0,
              height: 0,
            }
          : {
              top,
              right: rect.right,
              bottom,
              left: rect.left,
              width: 0,
              height: 0,
            }
        bounds.width = bounds.right - bounds.left
        bounds.height = bounds.bottom - bounds.top
      }
    }
    current = walker.nextNode()
  }

  return bounds
}

export function useSelectionOverlay(surfaceRef: Ref<HTMLElement | undefined>) {
  const { installed } = useCanvas()
  const {
    selectionLevel,
    selectedBlockId,
    selectedRowId,
    selectedCellId,
    selectedAtomId,
    selectedBlock,
    selectedAtom,
  } = useSelection()

  const selectionOverlay = reactive({
    visible: false,
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    label: '',
  })

  let overlayRafId: number | undefined
  let overlayMutationObserver: MutationObserver | undefined
  let overlayResizeObserver: ResizeObserver | undefined
  let observedSelectionTarget: HTMLElement | undefined

  const selectedNodeId = computed(() => {
    switch (selectionLevel.value) {
      case 'block':
        return selectedBlockId.value ? `block:${selectedBlockId.value}` : undefined
      case 'row':
        return selectedRowId.value ? `row:${selectedRowId.value}` : undefined
      case 'cell':
        return selectedCellId.value ? `cell:${selectedCellId.value}` : undefined
      case 'atom':
        return selectedAtomId.value ? `atom:${selectedAtomId.value}` : undefined
      default:
        return undefined
    }
  })

  const selectedNodeLabel = computed(() => {
    switch (selectionLevel.value) {
      case 'block':
        return selectedBlock.value?.label || 'Block'
      case 'row':
        return 'Row'
      case 'cell':
        return 'Cell'
      case 'atom':
        if (!selectedAtom.value)
          return 'Atom'

        return selectedAtom.value.type.charAt(0).toUpperCase() + selectedAtom.value.type.slice(1)
      default:
        return ''
    }
  })

  const showInlineEditHint = computed(() => {
    return (
      selectionLevel.value === 'atom'
      && (selectedAtom.value?.type === 'text' || selectedAtom.value?.type === 'button')
    )
  })

  const selectionOverlayStyle = computed<CSSProperties>(() => {
    return {
      top: `${selectionOverlay.top}px`,
      left: `${selectionOverlay.left}px`,
      width: `${selectionOverlay.width}px`,
      height: `${selectionOverlay.height}px`,
    }
  })

  function resetSelectionOverlay() {
    selectionOverlay.visible = false
    selectionOverlay.label = ''
  }

  function observeSelectionTarget(target?: HTMLElement) {
    if (observedSelectionTarget === target)
      return

    if (observedSelectionTarget)
      overlayResizeObserver?.unobserve(observedSelectionTarget)

    observedSelectionTarget = target
    if (target)
      overlayResizeObserver?.observe(target)
  }

  function measureSelectionOverlay() {
    const surface = surfaceRef.value
    const nodeId = selectedNodeId.value

    if (!surface || !nodeId) {
      observeSelectionTarget()
      resetSelectionOverlay()
      return
    }

    const nodeTarget = surface.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`)
    if (!nodeTarget) {
      observeSelectionTarget()
      resetSelectionOverlay()
      return
    }

    const visualTarget = resolveSelectionVisualTarget(nodeTarget, selectionLevel.value)
    observeSelectionTarget(visualTarget)

    const surfaceRect = surface.getBoundingClientRect()
    const textContent
      = selectionLevel.value === 'atom' && selectedAtom.value?.type === 'text'
        ? nodeTarget.querySelector<HTMLElement>('[data-selection-content]')
        : undefined
    const targetRect
      = visualTarget === nodeTarget && textContent
        ? measureTextContent(textContent) || nodeTarget.getBoundingClientRect()
        : visualTarget.getBoundingClientRect()

    if (targetRect.width <= 0 || targetRect.height <= 0) {
      resetSelectionOverlay()
      return
    }

    selectionOverlay.visible = true
    selectionOverlay.top = targetRect.top - surfaceRect.top
    selectionOverlay.left = targetRect.left - surfaceRect.left
    selectionOverlay.width = targetRect.width
    selectionOverlay.height = targetRect.height
    selectionOverlay.label = selectedNodeLabel.value
  }

  function scheduleSelectionOverlayMeasure() {
    if (typeof window === 'undefined' || overlayRafId !== undefined)
      return

    overlayRafId = window.requestAnimationFrame(() => {
      overlayRafId = undefined
      measureSelectionOverlay()
    })
  }

  function onWindowResize() {
    scheduleSelectionOverlayMeasure()
  }

  onMounted(() => {
    window.addEventListener('resize', onWindowResize)

    if (surfaceRef.value) {
      overlayMutationObserver = new MutationObserver(() => {
        scheduleSelectionOverlayMeasure()
      })

      overlayMutationObserver.observe(surfaceRef.value, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
      })

      overlayResizeObserver = new ResizeObserver(() => {
        scheduleSelectionOverlayMeasure()
      })

      overlayResizeObserver.observe(surfaceRef.value)
    }

    scheduleSelectionOverlayMeasure()
  })

  onBeforeUnmount(() => {
    overlayMutationObserver?.disconnect()
    overlayResizeObserver?.disconnect()
    overlayMutationObserver = undefined
    overlayResizeObserver = undefined
    observedSelectionTarget = undefined

    if (overlayRafId !== undefined) {
      window.cancelAnimationFrame(overlayRafId)
      overlayRafId = undefined
    }

    window.removeEventListener('resize', onWindowResize)
  })

  watch(
    [
      selectionLevel,
      selectedBlockId,
      selectedRowId,
      selectedCellId,
      selectedAtomId,
      selectedNodeLabel,
    ],
    async () => {
      await nextTick()
      scheduleSelectionOverlayMeasure()
    },
    { flush: 'post', immediate: true },
  )

  watch(
    installed,
    async () => {
      await nextTick()
      scheduleSelectionOverlayMeasure()
    },
    { deep: true, flush: 'post' },
  )

  return {
    selectionOverlay,
    selectionOverlayStyle,
    showInlineEditHint,
  }
}
