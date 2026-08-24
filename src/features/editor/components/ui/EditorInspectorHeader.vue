<script setup lang="ts">
interface Props {
  title: string
}

defineProps<Props>()
</script>

<template>
  <div
    data-slot="editor-inspector-header"
    class="border-b border-border px-4 py-4"
  >
    <h2 class="font-bold text-foreground uppercase">
      {{ title }}
    </h2>
  </div>
</template>
