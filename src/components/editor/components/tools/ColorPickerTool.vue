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

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useComponentsStore } from '@/store/components'
import type { ColorPickerTool } from '@/types/editor'

interface Props {
  id: string
  value?: string
  modelValue?: string
  title: string
  autoUpdate?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  autoUpdate: true,
})

const emit = defineEmits<Emits>()

const componentsStore = useComponentsStore()

const localValue = ref(props.modelValue)

watch(localValue, () => {
  if (!localValue.value)
    return

  if (props.autoUpdate)
    componentsStore.updateToolById<ColorPickerTool>(props.id, 'value', localValue.value)
  else
    emit('update:modelValue', localValue.value)
})
</script>

<style lang="scss" scoped>
.body {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
