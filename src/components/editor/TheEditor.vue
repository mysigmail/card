<template>
  <div class="editor">
    <EditorComponentList />
    <div
      ref="previewRef"
      class="preview"
      :style="{
        backgroundColor: generalStore.$state.background.color,
      }"
      @click="onClick"
    />
    <EditorTools />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { renderToShadowDom } from '@/utils'
import Editor from '@/components/editor/EditorCanvas.vue'
import { useComponentsStore } from '@/store/components'
import { useGeneralStore } from '@/store/general'

const previewRef = ref()

const componentStore = useComponentsStore()
const generalStore = useGeneralStore()

function onClick() {
  componentStore.setEditable(null)
}

onMounted(() => {
  renderToShadowDom(previewRef.value!, Editor)
})
</script>

<style lang="scss" scoped>
.editor {
  display: grid;
  grid-template-columns: var(--editor-component-list-width) 1fr var(
      --editor-tools-width
    );

}
</style>
