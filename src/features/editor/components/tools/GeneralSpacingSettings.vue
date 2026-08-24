<script setup lang="ts">
import { useCanvas } from '@/features/editor/model'

const { general } = useCanvas()
</script>

<template>
  <EditorPanelItem
    data-slot="general-spacing-settings"
    title="Layout"
    state-key="main:layout"
  >
    <SpacingTool
      id="general-padding"
      :value="{ padding: general.padding }"
      title="Padding"
      @update:value="general.padding = $event.padding ?? general.padding"
    />
  </EditorPanelItem>
</template>
