<script setup lang="ts">
import type { AlignTool } from '@/types/editor'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  group: string
  imgAttrs?: HTMLImageElement
  align?: AlignTool['value']
  link?: string
}

defineProps<Props>()

const { editableId, editableToolName } = useComponentsStore()
</script>

<template>
  <MColumn
    class="p-hover-tools"
    :align="align"
    :class="{
      'p-edit-tool': editableId === id && editableToolName === group,
    }"
    style="width: 100%"
  >
    <MLink :href="link">
      <MImg v-bind="imgAttrs" />
    </MLink>
  </MColumn>
</template>

<style lang="scss" scoped></style>
