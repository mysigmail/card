<script setup lang="ts">
import { useComponentsStore } from '@/features/editor/model'

const { editableId, selectionLevel } = useComponentsStore()
</script>

<template>
  <div class="h-full min-h-0 overflow-y-auto border-l border-border pb-8">
    <EditorGeneralTools v-if="!editableId" />
    <BlockSettingsPanel v-if="selectionLevel" />
  </div>
</template>
