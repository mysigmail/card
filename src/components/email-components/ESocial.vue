<script setup lang="ts">
import type { AlignTool } from '@/types/editor'
import type { Social } from '@/types/email-components/components'
import { MColumn, MLink, MRow } from '@mysigmail/vue-email-components'
import { computed } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  group: string
  align?: AlignTool['value']
  width?: string | number
  items: Social[]
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
    class="e-list p-hover-tools"
    :style="columnStyle"
    :class="{
      'p-edit-tool': editableId === id && editableToolName === group,
    }"
  >
    <MRow
      width="auto"
      :align="align"
    >
      <MColumn
        v-for="(i, index) in items"
        :key="index"
        class="link"
        :style="{ paddingRight: items.length === index + 1 ? '0' : '18px' }"
      >
        <MLink :href="i.link">
          <MImg
            :src="i.image.src"
            :style="{
              width: `${i.image.width}px`,
              height: `${i.image.height}px`,
            }"
            :alt="i.image.alt"
          />
        </MLink>
      </MColumn>
    </MRow>
  </MColumn>
</template>

<style lang="scss" scoped></style>
