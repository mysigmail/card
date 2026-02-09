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
    class="spacing-input"
    type="number"
  >
</template>

<style lang="scss" scoped>
.spacing-input {
  border: none;
  width: 40px;
  text-align: center;
  margin: 0;
  outline: none;
  border-radius: 4px;
  color: var(--color-text-primary);
  &:hover {
    outline: 1px solid var(--color-border);
  }
  &:focus {
    outline: 1px solid var(--color-primary);
  }
  &[disabled] {
    background-color: var(--color-background);
    color: var(--color-grey-500);
    cursor: not-allowed;
    &:hover {
      outline: none;
    }
  }
}

input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
