<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { MBody, MContainer, MHead, MHtml, MPreview } from '@mysigmail/vue-email-components'
import Sortable from 'sortablejs'
import { computed, onMounted, ref } from 'vue'
import { useCanvas } from '@/features/editor/model'
import { addGhost, BlockRenderer, removeGhost } from '@/features/email-preview'
import { EMAIL_RESPONSIVE_CSS } from '@/features/email-preview/constants'
import { useSelectionOverlay } from './use-selection-overlay'

const { installed, isDragging, moveComponent, general, previewMode, isCanvasBlockInstance }
  = useCanvas()

const listRef = ref<HTMLElement>()
const surfaceRef = ref<HTMLElement>()

const { selectionOverlay, selectionOverlayStyle } = useSelectionOverlay(surfaceRef)

const DESKTOP_TEMPLATE_WIDTH = 600
const MOBILE_TEMPLATE_WIDTH = 375
const HEAD_STYLE_TAG = 'style'

const containerStyle = computed<CSSProperties>(() => {
  return {
    position: 'relative',
    width: `${previewMode.value === 'mobile' ? MOBILE_TEMPLATE_WIDTH : DESKTOP_TEMPLATE_WIDTH}px`,
    maxWidth: '100%',
    margin: '0 auto',
    tableLayout: 'fixed',
  }
})

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

const bodyClass = computed(() => {
  return {
    'p-body': true,
    'p-preview-mobile': previewMode.value === 'mobile',
  }
})

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
})
</script>

<template>
  <MHtml
    data-slot="editor-canvas"
    class="p-html"
  >
    <MHead>
      <component :is="HEAD_STYLE_TAG">
        {{ EMAIL_RESPONSIVE_CSS }}
      </component>
    </MHead>
    <MPreview :text="general.previewText" />
    <MBody
      :style="style"
      :class="bodyClass"
    >
      <MContainer :style="containerStyle">
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
