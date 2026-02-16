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
      id="layoutPadding"
      :value="{ padding: general.padding }"
      title="Spacing"
    />
  </EditorPanelItem>
</template>
