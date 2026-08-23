<script setup lang="ts">
import { useCanvas } from '@/features/editor/model'

const { general } = useCanvas()
</script>

<template>
  <EditorPanelItem
    data-slot="general-spacing-settings"
    title="Spacing"
    type="opened"
  >
    <SpacingTool
      id="general-padding"
      :value="{ padding: general.padding }"
      title="Spacing"
      @update:value="
        (value) => {
          if (value.padding) general.padding = value.padding
        }
      "
    />
  </EditorPanelItem>
</template>
