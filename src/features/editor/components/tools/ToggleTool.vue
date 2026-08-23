<script setup lang="ts">
import { Switch } from '@/shared/ui/switch'

interface Props {
  id: string
  value: boolean
  title: string
}

const props = defineProps<Props>()

const emit = defineEmits<{ (e: 'update:value', value: boolean): void }>()
</script>

<template>
  <div data-slot="toggle-tool">
    <EditorToolLabel>{{ title }}</EditorToolLabel>
    <Switch
      :model-value="props.value"
      @update:model-value="(value) => emit('update:value', value)"
    />
  </div>
</template>
