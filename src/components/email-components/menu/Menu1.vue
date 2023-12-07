<template>
  <EmailBase
    v-bind="layoutAttrs"
    :index="index"
    @click.self="onEditTool('Layout', index)"
  >
    <MRow>
      <EImg
        v-if="isShowLogo"
        :id="id"
        group="Logo"
        :img-attrs="logoAttrs"
        :link="logoImage?.link"
        :align="logoAlign"
        @click="onEditTool('Logo', index)"
      />
      <EMenu
        v-if="isShowMenu"
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
  menuAlign,
  logoAlign,
} = useCommon(props.tools)

const { onEditTool } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
