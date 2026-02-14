<script setup lang="ts">
import { useCanvas, useSelection } from '@/features/editor/model'

const { editableId } = useCanvas()
const { selectionLevel } = useSelection()
</script>

<template>
  <div class="h-full min-h-0 overflow-y-auto border-l border-border pb-8">
    <EditorGeneralTools v-if="!editableId" />
    <BlockSettingsPanel v-if="selectionLevel" />
  </div>
</template>
