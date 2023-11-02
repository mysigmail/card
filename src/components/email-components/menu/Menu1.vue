<template>
  <EmailBase
    v-bind="layoutAttrs"
    :index="index"
  >
    <MColumn
      :style="{
        width: `${logoContainerWidth}px`,
      }"
    >
      <MImg v-bind="logoAttrs" />
    </MColumn>
    <MColumn>
      <MenuItems
        v-if="items"
        :items="items"
      />
    </MColumn>
  </EmailBase>
</template>

<script setup lang="ts">
import { MColumn, MImg } from '@mysigmail/vue-email-components'
import { useMenu } from './composables'
import type { Tool } from '@/types/editor'

interface Props {
  index: number
  tools: Tool[]
}

const props = defineProps<Props>()

const { logoContainerWidth, layoutAttrs, logoAttrs, items } = useMenu(props.tools)
</script>

<style lang="scss" scoped></style>
