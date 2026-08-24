<script setup lang="ts">
import type {
  BorderInspectorControl,
  InspectorControl,
  OpacityInspectorControl,
  RadiusInspectorControl,
} from './use-settings-tools'
import { computed } from 'vue'

const props = defineProps<{ tools: InspectorControl[] }>()

const opacity = computed(() =>
  props.tools.find((tool): tool is OpacityInspectorControl => tool.type === 'opacity'),
)
const radius = computed(() =>
  props.tools.find((tool): tool is RadiusInspectorControl => tool.type === 'radius'),
)
const border = computed(() =>
  props.tools.find((tool): tool is BorderInspectorControl => tool.type === 'border'),
)
const remaining = computed(() =>
  props.tools.filter(
    tool => tool.type !== 'opacity' && tool.type !== 'radius' && tool.type !== 'border',
  ),
)
</script>

<template>
  <div
    data-slot="inspector-appearance-tools"
    class="space-y-3"
  >
    <OpacitySettings
      v-if="opacity"
      :id="opacity.id"
      :title="opacity.label"
      :value="opacity.value"
      compact
      @update:value="opacity.onUpdate"
    />
    <InspectorBorderTools
      v-if="radius"
      :radius="radius"
      :border="border"
    />
    <div
      v-if="remaining.length"
      class="pt-1"
    >
      <EditorComponentTools :tools="remaining" />
    </div>
  </div>
</template>
