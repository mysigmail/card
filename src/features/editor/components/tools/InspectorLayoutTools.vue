<script setup lang="ts">
import type { InspectorControl } from './use-settings-tools'
import { computed } from 'vue'

const props = defineProps<{ tools: InspectorControl[] }>()

const numericTools = computed(() => props.tools.filter(tool => tool.type === 'inputNumber'))
const remaining = computed(() => props.tools.filter(tool => tool.type !== 'inputNumber'))
</script>

<template>
  <div data-slot="inspector-layout-tools">
    <EditorComponentTools
      v-if="remaining.length"
      :tools="remaining"
    />
    <div
      v-if="numericTools.length"
      class="grid grid-cols-2 gap-2"
    >
      <EditorComponentTools
        v-for="tool in numericTools"
        :key="tool.id"
        :tools="[tool]"
      />
    </div>
  </div>
</template>
