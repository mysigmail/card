<script setup lang="ts">
import type { BackgroundImageTool } from '@/features/editor/model'

interface Props {
  id: string
  value: BackgroundImageTool['value']
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:value', value: BackgroundImageTool['value']): void }>()

function updateValue(value: unknown) {
  emit('update:value', value as BackgroundImageTool['value'])
}
</script>

<template>
  <ImageTool
    :id="props.id"
    type="bgImage"
    :title="props.title"
    :value="props.value"
    @update:value="updateValue"
  />
</template>
