<script setup lang="ts">
import type { SelectTool } from '@/features/editor/model'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

interface Props {
  id: string
  title: string
  value: SelectTool['value']
  options: SelectTool['options']
}

const props = defineProps<Props>()

const emit = defineEmits<{ (e: 'update:value', value: string): void }>()
</script>

<template>
  <div data-slot="select-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="flex">
      <Select
        :model-value="props.value"
        @update:model-value="(value) => emit('update:value', String(value))"
      >
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
</template>
