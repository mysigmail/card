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

<script setup lang="ts">
import { useComponentsStore } from '@/store/components'
import type { AlignTool } from '@/types/editor'

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

<style lang="scss" scoped></style>
