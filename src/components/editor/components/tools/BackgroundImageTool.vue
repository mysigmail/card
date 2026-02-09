<script setup lang="ts">
import type { BackgroundImageTool } from '@/types/editor'

interface Props {
  id: string
  value: BackgroundImageTool['value']
  title: string
}

const props = defineProps<Props>()
</script>

<template>
  <ImageTool
    :id="props.id"
    type="bgImage"
    :title="props.title"
    :value="props.value"
  />
</template>
