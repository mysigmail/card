<script setup lang="ts">
import type { ToggleTool } from '@/features/editor/model'
import { ref, watch } from 'vue'
import { useComponentsStore } from '@/features/editor/model'
import { Switch } from '@/shared/ui/switch'

interface Props {
  id: string
  value: boolean
  title: string
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
  updateToolById<ToggleTool>(props.id, 'value', localValue.value)
})
</script>

<template>
  <div data-slot="toggle-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <Switch v-model="localValue" />
  </div>
</template>
