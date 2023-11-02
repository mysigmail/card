<template>
  <div class="editor-tools-panel">
    <EditorGeneralTools v-if="editableIndex === -1" />
    <EditorPanel
      v-for="(v, k) in editableToolsByGroup"
      :key="k"
    >
      <EditorPanelItem :title="k">
        <EditorComponentTools :tools="v" />
      </EditorPanelItem>
    </EditorPanel>
  </div>
</template>

<script setup lang="ts">
import { useComponentsStore } from '@/store/components'

const { editableToolsByGroup, editableIndex } = useComponentsStore()
</script>

<style lang="scss" scoped>
.editor-tools-panel {
  height: calc(100vh - var(--header-height));
  overflow-y: auto;
  border-left: 1px solid var(--color-border);
  .item {
    + .item {
      margin-top: var(--spacing-sm);
    }
  }
}
</style>
