<script setup lang="ts">
interface Props {
  type: 'default' | 'danger'
}

defineProps<Props>()
</script>

<template>
  <div
    data-slot="editor-action-button"
    class="flex [&_svg]:transition-colors"
    :class="type === 'danger' ? 'hover:[&_svg]:text-destructive' : 'hover:[&_svg]:text-foreground'"
  >
    <slot />
  </div>
</template>
