<template>
  <EmailBase
    v-bind="layoutAttrs"
    :index="index"
    @click.self="onEditTool('Layout', index)"
  >
    <MRow v-if="isShowLogo">
      <EImg
        :id="id"
        :img-attrs="logoAttrs"
        group="Logo"
        :link="logoImage?.link"
        :align="logoAlign"
        @click="onEditTool('Logo', index)"
      />
    </MRow>
    <MRow
      v-if="isShowMenu"
      :style="menuPadding"
    >
      <EMenu
        :id="id"
        :items="menuItems"
        group="Menu"
        :align="menuAlign"
        @click="onEditTool('Menu', index)"
      />
    </MRow>
  </EmailBase>
</template>

<script setup lang="ts">
import { MRow } from '@mysigmail/vue-email-components'
import { useCommon } from './composables/common'
import type { Tool } from '@/types/editor'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  index: number
  tools: Tool[]
}

const props = defineProps<Props>()

const {
  layoutAttrs,
  logoAttrs,
  logoImage,
  isShowMenu,
  isShowLogo,
  menuItems,
  logoAlign,
  menuAlign,
  menuPadding,
} = useCommon(props.tools)

const { onEditTool } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
