<script setup lang="ts">
import type { ColorPickerTool } from '@/features/editor/model'
import { ref, watch } from 'vue'
import { useCanvas } from '@/features/editor/model'
import { ColorPicker } from '@/shared/ui/color-picker'

interface Props {
  id: string
  value: string
  title: string
  autoUpdate?: boolean
  pressets?: string[]
}

interface Emits {
  (e: 'update:value', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  autoUpdate: true,
  pressets: () => ['#F56C6C', '#E6A23C', '#67C23A', '#396BDD', '#000000', '#FFFFFF'],
})

const emit = defineEmits<Emits>()

const { updateToolById } = useCanvas()

const localValue = ref(props.value)

watch(
  () => props.value,
  () => {
    localValue.value = props.value
  },
)

watch(localValue, () => {
  if (props.autoUpdate)
    updateToolById<ColorPickerTool>(props.id, 'value', localValue.value)
  else emit('update:value', localValue.value)
})
</script>

<template>
  <div data-slot="color-picker-tool">
    <EditorToolLabel>{{ title }}</EditorToolLabel>
    <ColorPicker
      v-model="localValue"
      :presets="props.pressets"
    />
  </div>
</template>
