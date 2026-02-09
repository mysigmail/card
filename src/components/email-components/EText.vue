<script setup lang="ts">
import { computed } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  group: string
  link?: string
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

const blockLinkStyle = {
  color: 'inherit',
  display: 'block',
  height: '100%',
  textDecoration: 'none',
  width: '100%',
} as const

const isBlockLink = computed(() => {
  const value = props.value?.trim() || ''

  return !value || value === '&nbsp;' || value.includes('min-height:')
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
    <MLink
      v-if="link"
      :href="link"
      :style="isBlockLink ? blockLinkStyle : undefined"
    >
      <div v-html="value" />
    </MLink>
    <div
      v-else
      v-html="value"
    />
    <slot />
  </MColumn>
</template>

<style lang="scss" scoped></style>
