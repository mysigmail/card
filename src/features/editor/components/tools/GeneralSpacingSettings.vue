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
      @update:value="
        (value) => {
          if (value.padding) general.padding = value.padding
        }
      "
    />
  </EditorPanelItem>
</template>
