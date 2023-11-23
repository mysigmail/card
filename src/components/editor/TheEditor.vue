<template>
  <div class="editor">
    <TheSidebar />
    <div
      ref="previewRef"
      class="preview"
      :style="{
        backgroundColor: general.background.color,
      }"
    />
    <EditorTools />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { renderToShadowDom } from '@/utils'
import Editor from '@/components/editor/EditorCanvas.vue'
import { useComponentsStore } from '@/store/components'

const previewRef = ref()

const { general, editableId, editableToolsGroupName } = useComponentsStore()

onMounted(() => {
  const shadow = renderToShadowDom(previewRef.value!, Editor)

  shadow.addEventListener('click', (e) => {
    if (e.target instanceof HTMLBodyElement) {
      editableId.value = undefined
      editableToolsGroupName.value = undefined
    }
  })
})
</script>

<style lang="scss" scoped>
.editor {
  display: grid;
  grid-template-columns: var(--editor-component-list-width) 1fr var(--editor-tools-width);
}
</style>
