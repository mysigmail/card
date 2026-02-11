<script setup lang="ts">
import { computed } from 'vue'

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
  <input
    v-model="localValue"
    class="m-0 w-10 rounded border-0 bg-transparent p-0 text-center text-foreground outline-none [appearance:textfield] hover:outline hover:outline-1 hover:outline-border focus:outline focus:outline-1 focus:outline-primary disabled:cursor-not-allowed disabled:bg-background disabled:text-muted-foreground disabled:hover:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    type="number"
  >
</template>
