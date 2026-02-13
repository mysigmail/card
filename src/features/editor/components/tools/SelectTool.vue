<script setup lang="ts">
import type { SelectTool } from '@/features/editor/model'
import { ref, watch } from 'vue'
import { useComponentsStore } from '@/features/editor/model'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

interface Props {
  id: string
  title: string
  value: SelectTool['value']
  options: SelectTool['options']
}

const props = defineProps<Props>()

const { updateToolById } = useComponentsStore()
const localValue = ref(props.value)

watch(
  () => props.value,
  () => {
    localValue.value = props.value
  },
)

watch(localValue, () => {
  updateToolById<SelectTool>(props.id, 'value', localValue.value)
})
</script>

<template>
  <div data-slot="input-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="flex">
      <Select v-model="localValue">
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
