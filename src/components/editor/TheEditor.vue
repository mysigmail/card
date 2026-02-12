<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Editor from '@/components/editor/EditorCanvas.vue'
import { useComponentsStore } from '@/store/components'
import { renderToShadowDom } from '@/utils'

const previewRef = ref()

const { general, editableId, editableToolsGroupName, hydrateTemplateFromLocalStorage }
  = useComponentsStore()

onMounted(() => {
  hydrateTemplateFromLocalStorage()

  const shadow = renderToShadowDom(previewRef.value!, Editor)

  shadow.addEventListener('click', (e) => {
    if (e.target instanceof HTMLBodyElement) {
      editableId.value = undefined
      editableToolsGroupName.value = undefined
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
