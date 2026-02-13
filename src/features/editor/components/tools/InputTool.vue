<script setup lang="ts">
import type { InputNumberTool, InputTool } from '@/features/editor/model'
import { ref, watch } from 'vue'
import { useComponentsStore } from '@/features/editor/model'
import { Input } from '@/shared/ui/input'

interface Props {
  id: string
  value: string | number
  type?: 'string' | 'number'
  title: string
  placeholder?: string
  updateParentLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'string',
})

const { updateToolById } = useComponentsStore()

const localValue = ref(props.value)

watch(
  () => props.value,
  () => {
    localValue.value = props.value
  },
  { deep: true },
)

watch(localValue, () => {
  updateToolById<InputTool | InputNumberTool>(props.id, 'value', localValue.value)
})
</script>

<template>
  <div data-slot="input-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="flex">
      <Input
        v-model="localValue"
        :placeholder="placeholder"
        :type="type === 'number' ? 'number' : 'text'"
      />
    </div>
  </div>
</template>
