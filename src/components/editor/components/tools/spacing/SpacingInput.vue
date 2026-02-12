<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/components/ui/input'

interface Props {
  modelValue: number
}

interface Emits {
  (e: 'update:model-value', value: number): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

const localValue = computed({
  get: () => props.modelValue,
  set: (v) => {
    emit('update:model-value', v)
  },
})
</script>

<template>
  <Input
    v-model="localValue"
    type="number"
    size="xs"
    class="h-5 border-none shadow-none text-center"
  />
</template>
