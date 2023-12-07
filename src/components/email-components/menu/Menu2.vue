<template>
  <EmailBase
    v-bind="layoutAttrs"
    :index="index"
    @click.self="onEditTool('Layout', index)"
  >
    <MRow v-if="isShowLogo">
      <EImg
        :id="id"
        group="Logo"
        :img-attrs="logoAttrs"
        :link="logoImage?.link"
        :align="logoAlign"
        @click="onEditTool('Logo', index)"
      />
    </MRow>

    <EDivider
      v-if="isShowDivider"
      :id="id"
      :color="dividerColor"
      group="Divider"
      :style="dividerPadding"
      @click="onEditTool('Divider', index)"
    />
    <MRow
      v-if="isShowMenu"
      :style="menuPadding"
    >
      <EMenu
        :id="id"
        group="Menu"
        :items="menuItems"
        :align="menuAlign"
        @click="onEditTool('Menu', index)"
      />
    </MRow>
  </EmailBase>
</template>

<script setup lang="ts">
import { MRow } from '@mysigmail/vue-email-components'
import { useMenu2 } from './composables/menu-2'
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
  menuItems,
  isShowMenu,
  dividerColor,
  dividerPadding,
  logoImage,
  isShowLogo,
  isShowDivider,
  logoAlign,
  menuAlign,
  menuPadding,
} = useMenu2(props.tools)

const { onEditTool } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
