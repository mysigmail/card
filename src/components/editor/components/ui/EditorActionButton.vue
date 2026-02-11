<script setup lang="ts">
interface Props {
  type: 'default' | 'danger'
}

defineProps<Props>()
</script>

<template>
  <div
    class="flex [&_svg]:text-muted-foreground [&_svg]:transition-colors"
    :class="type === 'danger' ? 'hover:[&_svg]:text-destructive' : 'hover:[&_svg]:text-foreground'"
  >
    <slot />
  </div>
</template>
