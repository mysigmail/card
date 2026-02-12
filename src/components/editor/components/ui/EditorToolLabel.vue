<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary'
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
})
</script>

<template>
  <div
    data-slot="editor-tool-label"
    class="my-2 mt-3 text-xs font-bold text-foreground uppercase"
    :class="type === 'secondary' ? 'text-[11px] text-muted-foreground' : ''"
  >
    <slot />
  </div>
</template>
