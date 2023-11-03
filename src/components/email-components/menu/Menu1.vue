<template>
  <EmailBase
    v-bind="layoutAttrs"
    :index="index"
  >
    <MColumn
      v-if="isShowLogo"
      :style="{
        width: `${logoContainerWidth}px`,
      }"
    >
      <MRow>
        <MLink :href="logoImage?.link">
          <MImg v-bind="logoAttrs" />
        </MLink>
      </MRow>
    </MColumn>
    <MColumn v-if="isShowMenu">
      <MenuItems
        v-if="itemsText"
        :items="itemsText"
      />
    </MColumn>
  </EmailBase>
</template>

<script setup lang="ts">
import { MColumn, MImg, MLink, MRow } from '@mysigmail/vue-email-components'
import { useMenu1 } from './composables/menu-1'
import type { Tool } from '@/types/editor'

interface Props {
  index: number
  tools: Tool[]
}

const props = defineProps<Props>()

const { logoContainerWidth, layoutAttrs, logoAttrs, logoImage, isShowMenu, isShowLogo, itemsText }
  = useMenu1(props.tools)
</script>

<style lang="scss" scoped></style>
