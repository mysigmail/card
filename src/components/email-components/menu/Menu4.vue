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
          <MImg v-bind="logoAttrs" />
        </MLink>
      </MRow>
      <MRow v-if="isShowMenu">
        <MenuItems
          v-if="itemsText"
          :items="itemsText"
          align="left"
          :style="{
            marginTop: isShowLogo ? '20px' : null,
          }"
        />
      </MRow>
    </MColumn>
  </EmailBase>
</template>

<script setup lang="ts">
import { MColumn, MImg, MLink, MRow } from '@mysigmail/vue-email-components'
import { useCommon } from './composables/common'
import type { Tool } from '@/types/editor'

interface Props {
  index: number
  tools: Tool[]
}

const props = defineProps<Props>()

const { logoContainerWidth, layoutAttrs, logoAttrs, logoImage, isShowMenu, isShowLogo, itemsText }
  = useCommon(props.tools)
</script>

<style lang="scss" scoped></style>
