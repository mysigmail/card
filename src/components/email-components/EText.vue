<script setup lang="ts">
import { computed } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  group: string
  value?: string
  width?: string | number
}

const props = defineProps<Props>()

const { editableId, editableToolName } = useComponentsStore()

const columnStyle = computed(() => {
  const value = props.width
  if (value === undefined || value === null || value === '')
    return undefined

  return {
    width: typeof value === 'number' ? `${value}px` : value,
  }
})
</script>

<template>
  <MColumn
    class="p-hover-tools"
    :style="columnStyle"
    :class="{
      'p-edit-tool': editableId === id && editableToolName === group,
    }"
  >
    <div v-html="value" />
  </MColumn>
</template>

<style lang="scss" scoped></style>
