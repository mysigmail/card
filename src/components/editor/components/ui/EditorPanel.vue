<template>
  <div class="app-collapse">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'

interface Props {
  type?: 'default' | 'bordered'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'default',
})

provide('type', props.type)
</script>

<style lang="scss" scoped></style>
