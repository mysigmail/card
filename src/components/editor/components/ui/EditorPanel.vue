<template>
  <div class="app-collapse">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue'

interface Props {
  type?: 'default' | 'bordered'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default'
})

const localValue = ref()

provide('type', props.type)
</script>

<style lang="scss" scoped></style>
