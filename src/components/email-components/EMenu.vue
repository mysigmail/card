<script setup lang="ts">
import type { AlignTool } from '@/types/editor'
import type { Menu } from '@/types/email-components/components'
import { MColumn, MLink, MRow } from '@mysigmail/vue-email-components'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  group: string
  align?: AlignTool['value']
  items: Menu[]
}

defineProps<Props>()

const { editableId, editableToolName } = useComponentsStore()
</script>

<template>
  <MColumn
    class="e-list p-hover-tools"
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
        :style="{ paddingRight: items.length === index + 1 ? '0' : '10px' }"
      >
        <MLink
          :href="i.link"
          :style="{
            color: i.color,
            fontSize: `${i.fontSize}px`,
          }"
        >
          <template v-if="!$slots.item">
            {{ i.text }}
          </template>
          <slot
            name="item"
            :item="i"
          />
        </MLink>
      </MColumn>
    </MRow>
  </MColumn>
</template>

<style lang="scss" scoped></style>
