<script setup lang="ts">
import type { SelectTool } from '@/types/editor'
import { ref, watch } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useComponentsStore } from '@/store/components'

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
  <div class="input-tool">
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
