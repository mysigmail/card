<script setup lang="ts">
import { Hash } from 'lucide-vue-next'
import { Input } from '@/shared/ui/input'
import ScrubbableNumberField from './number/ScrubbableNumberField.vue'

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
      <ScrubbableNumberField
        v-if="type === 'number'"
        class="w-full"
        :model-value="Number(props.value)"
        :default-value="0"
        :label="title"
        :min="0"
        :max="9999"
        :step="1"
        :precision="1"
        @update:model-value="(value) => value !== undefined && emit('update:value', value)"
      >
        <template #prefix>
          <Hash />
        </template>
      </ScrubbableNumberField>
      <Input
        v-else
        size="sm"
        :model-value="props.value"
        :placeholder="placeholder"
        type="text"
        @update:model-value="(value) => emit('update:value', value)"
      />
    </div>
  </div>
</template>
