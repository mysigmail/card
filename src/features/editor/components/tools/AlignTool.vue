<script setup lang="ts">
import type { AlignTool } from '@/features/editor/model'
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-vue-next'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'

interface Props {
  id: string
  title: string
  value: AlignTool['value']
}

const props = defineProps<Props>()

const emit = defineEmits<{ (e: 'update:value', value: AlignTool['value']): void }>()
</script>

<template>
  <div data-slot="align-tool">
    <EditorToolLabel>{{ title }}</EditorToolLabel>
    <ToggleGroup
      :model-value="props.value"
      :spacing="0"
      type="single"
      size="sm"
      variant="outline"
      @update:model-value="(value) => emit('update:value', value as AlignTool['value'])"
    >
      <ToggleGroupItem value="left">
        <AlignLeft :size="16" />
      </ToggleGroupItem>
      <ToggleGroupItem value="center">
        <AlignCenter :size="16" />
      </ToggleGroupItem>
      <ToggleGroupItem value="right">
        <AlignRight :size="16" />
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
</template>
