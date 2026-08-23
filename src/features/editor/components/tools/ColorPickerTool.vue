<script setup lang="ts">
import { ColorPicker } from '@/shared/ui/color-picker'

interface Props {
  id: string
  value: string
  title: string
  pressets?: string[]
}

interface Emits {
  (e: 'update:value', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  pressets: () => ['#F56C6C', '#E6A23C', '#67C23A', '#396BDD', '#000000', '#FFFFFF'],
})

const emit = defineEmits<Emits>()
</script>

<template>
  <div data-slot="color-picker-tool">
    <EditorToolLabel>{{ title }}</EditorToolLabel>
    <ColorPicker
      :model-value="props.value"
      :presets="props.pressets"
      @update:model-value="(value) => emit('update:value', value)"
    />
  </div>
</template>
