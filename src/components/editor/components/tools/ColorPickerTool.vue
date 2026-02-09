<script setup lang="ts">
import type { ColorPickerTool } from '@/types/editor'
import { ref, watch } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  value: string
  title: string
  autoUpdate?: boolean
}

interface Emits {
  (e: 'update:value', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  autoUpdate: true,
})

const emit = defineEmits<Emits>()

const { updateToolById } = useComponentsStore()

const localValue = ref(props.value)

watch(localValue, () => {
  if (props.autoUpdate)
    updateToolById<ColorPickerTool>(props.id, 'value', localValue.value)
  else emit('update:value', localValue.value)
})
</script>

<template>
  <div class="color-picker-tool">
    <EditorToolLabel>{{ title }}</EditorToolLabel>
    <div class="body">
      <ElColorPicker
        v-model="localValue"
        color-format="hex"
      />
      <ElInput v-model="localValue" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.body {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
