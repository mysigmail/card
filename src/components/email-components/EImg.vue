<script setup lang="ts">
import type { AlignTool } from '@/types/editor'
import { computed } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  group: string
  imgAttrs?: HTMLImageElement
  align?: AlignTool['value']
  link?: string
  width?: string | number
}

const props = defineProps<Props>()

const { editableId, editableToolName } = useComponentsStore()

const columnStyle = computed(() => {
  const value = props.width
  if (value === undefined || value === null || value === '')
    return { width: '100%' }

  return {
    width: typeof value === 'number' ? `${value}px` : value,
  }
})
</script>

<template>
  <MColumn
    class="p-hover-tools"
    :align="align"
    :class="{
      'p-edit-tool': editableId === id && editableToolName === group,
    }"
    :style="columnStyle"
  >
    <MLink :href="link">
      <MImg v-bind="imgAttrs" />
    </MLink>
  </MColumn>
</template>

<style lang="scss" scoped></style>
