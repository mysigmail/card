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

<script setup lang="ts">
import { MColumn, MLink, MRow } from '@mysigmail/vue-email-components'
import type { Social } from '@/types/email-components/components'
import type { AlignTool } from '@/types/editor'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  group: string
  align?: AlignTool['value']
  items: Social[]
}

defineProps<Props>()

const { editableId, editableToolName } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
