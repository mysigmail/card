<template>
  <MColumn
    class="p-hover-tools"
    :class="{
      'p-edit-tool': editableId === id && editableToolName === group,
    }"
  >
    <div v-html="value" />
  </MColumn>
</template>

<script setup lang="ts">
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  group: string
  value?: string
}

defineProps<Props>()

const { editableId, editableToolName } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
