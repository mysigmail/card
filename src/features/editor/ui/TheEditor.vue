<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useComponentsStore } from '@/features/editor/model'
import Editor from '@/features/editor/ui/EditorCanvas.vue'
import { renderToShadowDom } from '@/shared/lib/shadow-dom'

const previewRef = ref()

const { general, resetSelection, hydrateTemplateFromLocalStorage } = useComponentsStore()

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
      :style="{
        backgroundColor: general.background.color,
      }"
    />
    <EditorTools />
  </div>
</template>
