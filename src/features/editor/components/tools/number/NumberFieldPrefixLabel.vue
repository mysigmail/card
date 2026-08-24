<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <span
    data-slot="number-field-prefix-label"
    class="text-[10px] leading-none font-semibold tracking-tight"
  >
    {{ label }}
  </span>
</template>
