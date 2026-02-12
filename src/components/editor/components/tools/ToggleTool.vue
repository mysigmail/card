<script setup lang="ts">
import type { ToggleTool } from '@/types/editor'
import { ref, watch } from 'vue'
import { Switch } from '@/components/ui/switch'
import { useComponentsStore } from '@/store/components'

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
