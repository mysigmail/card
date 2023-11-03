<template>
  <EmailBase
    v-bind="layoutAttrs"
    :index="index"
  >
    <MColumn
      v-if="isShowLogo"
      class="sss"
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
    <MColumn>
      <MenuItemsImg
        v-if="isShowMenu"
        :items="itemsImg"
      />
    </MColumn>
  </EmailBase>
</template>

<script setup lang="ts">
import { MColumn, MImg, MLink, MRow, MSection } from '@mysigmail/vue-email-components'
import { useCommon } from './composables/common'
import type { Tool } from '@/types/editor'

interface Props {
  index: number
  tools: Tool[]
}

const props = defineProps<Props>()

const { isShowLogo, isShowMenu, itemsImg, layoutAttrs, logoAttrs, logoContainerWidth, logoImage }
  = useCommon(props.tools)
</script>

<style lang="scss" scoped></style>
