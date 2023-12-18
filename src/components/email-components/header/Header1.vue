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
    <MRow
      v-if="isShowText"
      :style="{ margin: textMargin }"
    >
      <EText
        v-bind="textAttrs"
        :id="id"
        :value="text"
        group="Text"
        @click="onEditTool('Text', index)"
      />
    </MRow>
  </EmailBase>
</template>

<script setup lang="ts">
import { MRow } from '@mysigmail/vue-email-components'
import type { Tool } from '@/types/editor'
import { useComponentsStore } from '@/store/components'
import { useCommon } from '@/components/email-components/composables'

interface Props {
  id: string
  index: number
  tools: Tool[]
}

const props = defineProps<Props>()

const {
  isShowLogo,
  isShowText,
  layoutAttrs,
  logoAlign,
  logoAttrs,
  logoImage,
  text,
  textAttrs,
  textMargin,
  menuAlign,
  menuItems,
  isShowMenu,
} = useCommon(props.tools)

const { onEditTool } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
