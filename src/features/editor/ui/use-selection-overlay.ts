import type { CSSProperties, Ref } from 'vue'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import { useCanvas, useSelection } from '@/features/editor/model'

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

  function measureSelectionOverlay() {
    const surface = surfaceRef.value
    const nodeId = selectedNodeId.value

    if (!surface || !nodeId) {
      resetSelectionOverlay()
      return
    }

    const target = surface.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`)
    if (!target) {
      resetSelectionOverlay()
      return
    }

    const surfaceRect = surface.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()

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
  }
}
