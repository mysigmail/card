<script setup lang="ts">
interface Props {
  type: 'default' | 'danger'
}

defineProps<Props>()
</script>

<template>
  <div
    class="editor-action-button"
    :class="{ danger: type === 'danger' }"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.editor-action-button {
  display: flex;
  &.danger {
    &:hover {
      :deep(svg) {
        fill: var(--color-danger);
      }
    }
  }
  &:hover {
    :deep(svg) {
      fill: var(--color-contrast-hight);
    }
  }
  :deep(svg) {
    fill: var(--color-contrast-medium);
  }
}
</style>
