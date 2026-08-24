<script setup lang="ts">
interface Props {
  level?: 'property' | 'parameter'
}

withDefaults(defineProps<Props>(), {
  level: 'property',
})
</script>

<template>
  <div
    data-slot="editor-tool-label"
    class="my-2 mt-3 text-xs font-bold text-foreground uppercase"
    :class="level === 'parameter' ? 'text-[11px] text-muted-foreground' : ''"
  >
    <slot />
  </div>
</template>
