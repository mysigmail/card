<script setup lang="ts">
import type { BorderInspectorControl, RadiusInspectorControl } from './use-settings-tools'

defineProps<{
  border?: BorderInspectorControl
  radius: RadiusInspectorControl
}>()
</script>

<template>
  <div
    data-slot="inspector-border-tools"
    class="space-y-3"
  >
    <div class="space-y-3">
      <RadiusSettings
        :id="radius.id"
        :title="radius.label"
        :value="radius.value"
        compact
        @update:value="radius.onUpdate"
      />
      <BorderSettings
        v-if="border"
        :id="border.id"
        title="Stroke"
        :value="border.value"
        @update:value="border.onUpdate"
      />
    </div>
  </div>
</template>
