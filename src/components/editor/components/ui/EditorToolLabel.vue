<template>
  <div
    class="app-tool-label"
    :class="{ secondary: type === 'secondary' }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary'
}

withDefaults(defineProps<Props>(), {
  type: 'primary'
})
</script>

<style lang="scss" scoped>
.app-tool-label {
  margin: 0;
  margin-top: var(--spacing-xs);
  margin-bottom: var(--spacing-xs);
  font-size: var(--text-sm);
  text-transform: uppercase;
  color: var(--color-contrast-high);
  font-weight: bold;
  &.secondary {
    font-size: 11px;
    color: var(--color-contrast-medium);
  }
}
</style>
