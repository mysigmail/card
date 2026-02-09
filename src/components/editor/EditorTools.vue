<script setup lang="ts">
import { useComponentsStore } from '@/store/components'

const { editableToolsGroupName, editableTools, editableId } = useComponentsStore()
</script>

<template>
  <div class="editor-tools-panel">
    <EditorGeneralTools v-if="!editableId" />
    <EditorPanel v-if="editableToolsGroupName">
      <EditorPanelItem
        type="opened"
        :title="editableToolsGroupName"
      >
        <EditorComponentTools
          v-if="editableTools"
          :tools="editableTools"
        />
      </EditorPanelItem>
    </EditorPanel>
  </div>
</template>

<style lang="scss" scoped>
.editor-tools-panel {
  height: calc(100vh - var(--header-height));
  overflow-y: auto;
  border-left: 1px solid var(--color-border);
  padding-bottom: var(--spacing-lg);
  .item {
    + .item {
      margin-top: var(--spacing-sm);
    }
  }
}
</style>
