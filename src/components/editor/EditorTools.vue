<script setup lang="ts">
import { useComponentsStore } from '@/store/components'

const { editableToolsGroupName, editableToolsGroupLabel, editableTools, editableId }
  = useComponentsStore()
</script>

<template>
  <div class="h-full min-h-0 overflow-y-auto border-l border-border pb-8">
    <EditorGeneralTools v-if="!editableId" />
    <EditorPanel v-if="editableToolsGroupName">
      <EditorPanelItem
        type="opened"
        :title="editableToolsGroupLabel || editableToolsGroupName"
      >
        <EditorComponentTools
          v-if="editableTools"
          :tools="editableTools"
        />
      </EditorPanelItem>
    </EditorPanel>
  </div>
</template>
