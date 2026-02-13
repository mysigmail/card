<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { MBody, MContainer, MHtml, MPreview } from '@mysigmail/vue-email-components'
import Sortable from 'sortablejs'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useComponentsStore } from '@/features/editor/model'
import { addGhost, BlockRenderer, removeGhost } from '@/features/email-preview'

const {
  installed,
  isDragging,
  moveComponent,
  general,
  isCanvasBlockInstance,
  selectionLevel,
  selectedBlockId,
  selectedRowId,
  selectedCellId,
  selectedAtomId,
  selectedBlock,
  selectedAtom,
} = useComponentsStore()

const listRef = ref<HTMLElement>()
const surfaceRef = ref<HTMLElement>()
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

const EMAIL_TEMPLATE_WIDTH = 600

const container: CSSProperties = {
  position: 'relative',
  width: `${EMAIL_TEMPLATE_WIDTH}px`,
  maxWidth: '100%',
  margin: '0 auto',
  tableLayout: 'fixed',
}

const style = computed<CSSProperties>(() => {
  return {
    backgroundImage: general.background.image ? `url(${general.background.image})` : '',
    backgroundRepeat: general.background.repeat,
    backgroundColor: general.background.color,
    backgroundSize: general.background.size,
    backgroundPosition: general.background.position,
    fontFamily: general.font,
    padding: general.padding.map(i => `${i}px`).join(' '),
  }
})

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

function initSortable() {
  Sortable.create(listRef.value!, {
    group: 'components',
    animation: 150,
    ghostClass: 'p-ghost',
    swapThreshold: 0.5,
    onStart() {
      isDragging.value = true
    },
    onEnd() {
      removeGhost()
      isDragging.value = false
    },
    onUpdate(e) {
      if (e.oldIndex === undefined || e.newIndex === undefined)
        return
      moveComponent(e.oldIndex, e.newIndex)
    },
    setData(dataTransfer, el) {
      const name = el.getAttribute('data-name')
      addGhost(dataTransfer, name!)
    },
  })
}

onMounted(() => {
  initSortable()

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
</script>

<template>
  <MHtml class="p-html">
    <MPreview :text="general.previewText" />
    <MBody
      :style="style"
      class="p-body"
    >
      <MContainer :style="container">
        <div
          ref="surfaceRef"
          class="p-canvas-surface"
        >
          <div
            ref="listRef"
            :class="{
              'p-is-empty': installed.length === 0,
            }"
          >
            <template
              v-for="(i, index) in installed"
              :key="i.id"
            >
              <BlockRenderer
                v-if="isCanvasBlockInstance(i)"
                :id="i.id"
                :data-name="i.block.label"
                :index="index"
                :block="i.block"
              />
            </template>
          </div>

          <div
            v-if="selectionOverlay.visible"
            class="p-selection-overlay"
            :style="selectionOverlayStyle"
          >
            <div
              v-if="selectionOverlay.label"
              class="p-selection-overlay__label"
            >
              {{ selectionOverlay.label }}
            </div>
          </div>
        </div>
      </MContainer>
    </MBody>
  </MHtml>
</template>

<style scoped></style>
