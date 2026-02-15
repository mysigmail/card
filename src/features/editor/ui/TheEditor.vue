<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCanvas, usePersistence, useSelection } from '@/features/editor/model'
import Editor from '@/features/editor/ui/EditorCanvas.vue'
import { renderToShadowDom } from '@/shared/lib/shadow-dom'

const previewRef = ref()

const { general } = useCanvas()
const { resetSelection } = useSelection()
const { hydrateTemplateFromLocalStorage } = usePersistence()

const previewHostStyle = computed(() => {
  return {
    backgroundColor: general.background.color,
    width: '100%',
    maxWidth: '100%',
    justifySelf: 'stretch',
  }
})

onMounted(() => {
  hydrateTemplateFromLocalStorage()

  const shadow = renderToShadowDom(previewRef.value!, Editor)

  shadow.addEventListener('click', (e) => {
    if (e.target instanceof HTMLBodyElement) {
      resetSelection()
    }
  })
})
</script>

<template>
  <div
    class="grid h-full min-h-0 [grid-template-columns:var(--editor-component-list-width)_1fr_var(--editor-tools-width)]"
  >
    <TheSidebar />
    <div
      ref="previewRef"
      :style="previewHostStyle"
    />
    <EditorTools />
  </div>
</template>
