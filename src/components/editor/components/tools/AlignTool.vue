<script setup lang="ts">
import type { AlignTool } from '@/types/editor'
import { AlignCenter, AlignLeft, AlignRight } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  title: string
  value: AlignTool['value']
}

const props = defineProps<Props>()

const localValue = ref(props.value)

const { updateToolById } = useComponentsStore()

watch(
  () => props.value,
  () => {
    localValue.value = props.value
  },
)

watch(localValue, () => {
  updateToolById<AlignTool>(props.id, 'value', localValue.value)
})
</script>

<template>
  <div>
    <EditorToolLabel>{{ title }}</EditorToolLabel>
    <ToggleGroup
      v-model="localValue"
      :spacing="0"
      type="single"
      size="sm"
      variant="outline"
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
