<script setup lang="ts">
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
const emit = defineEmits<{ (e: 'update:value', value: string | number): void }>()
</script>

<template>
  <div data-slot="input-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="flex">
      <Input
        :model-value="props.value"
        :placeholder="placeholder"
        :type="type === 'number' ? 'number' : 'text'"
        @update:model-value="(value) => emit('update:value', value)"
      />
    </div>
  </div>
</template>
