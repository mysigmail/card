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
      <MRow v-if="isShowLogo">
        <MLink :href="logoImage?.link">
          <MImg
            v-bind="logoAttrs"
            style="margin: 0 auto"
          />
        </MLink>
      </MRow>
      <MRow v-if="isShowDivider">
        <MHr v-bind="dividerAttrs" />
      </MRow>
      <MRow
        v-if="isShowMenu"
        :style="{
          marginTop: !isShowDivider && isShowLogo ? '20px' : null,
        }"
      >
        <MenuItems
          v-if="itemsText"
          :items="itemsText"
        />
      </MRow>
    </MColumn>
  </EmailBase>
</template>

<script setup lang="ts">
import { MColumn, MHr, MImg, MLink, MRow } from '@mysigmail/vue-email-components'
import { useMenu2 } from './composables/menu-2'
import type { Tool } from '@/types/editor'

interface Props {
  index: number
  tools: Tool[]
}

const props = defineProps<Props>()

const {
  logoContainerWidth,
  layoutAttrs,
  logoAttrs,
  itemsText,
  isShowMenu,
  dividerAttrs,
  logoImage,
  isShowLogo,
  isShowDivider,
} = useMenu2(props.tools)
</script>

<style lang="scss" scoped></style>
