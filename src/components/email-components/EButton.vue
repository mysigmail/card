<script setup lang="ts">
import type { AlignTool } from '@/types/editor'
import { MButton, MColumn } from '@mysigmail/vue-email-components'
import { computed } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  group: string
  text?: string
  attrs?: Record<string, unknown>
  align?: AlignTool['value']
  width?: string | number
  inline?: boolean
}

const props = defineProps<Props>()

const { editableId, editableToolName } = useComponentsStore()

const isEditable = computed(() => {
  return editableId.value === props.id && editableToolName.value === props.group
})

const columnStyle = computed(() => {
  const value = props.width
  if (value === undefined || value === null || value === '')
    return undefined

  return {
    width: typeof value === 'number' ? `${value}px` : value,
  }
})

const inlineStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.align)
    style.textAlign = props.align

  const value = props.width

  if (value !== undefined && value !== null && value !== '')
    style.width = typeof value === 'number' ? `${value}px` : value

  if (!Object.keys(style).length)
    return undefined

  return style
})
</script>

<template>
  <div
    v-if="inline"
    class="p-hover-tools"
    :style="inlineStyle"
    :class="{
      'p-edit-tool': isEditable,
    }"
  >
    <MButton v-bind="attrs">
      {{ text }}
    </MButton>
  </div>

  <MColumn
    v-else
    class="p-hover-tools"
    :align="align"
    :style="columnStyle"
    :class="{
      'p-edit-tool': isEditable,
    }"
  >
    <MButton v-bind="attrs">
      {{ text }}
    </MButton>
  </MColumn>
</template>

<style lang="scss" scoped></style>
