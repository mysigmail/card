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
      <ESocial
        v-if="isShowSocial"
        :id="id"
        :items="socialItems"
        group="Social"
        :align="socialAlign"
        @click="onEditTool('Social', index)"
      />
    </MRow>
  </EmailBase>
</template>

<script setup lang="ts">
import { MRow } from '@mysigmail/vue-email-components'
import { useMenu3 } from './composables/menu-3'
import type { Tool } from '@/types/editor'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  index: number
  tools: Tool[]
}

const props = defineProps<Props>()

const {
  isShowLogo,
  isShowSocial,
  socialItems,
  layoutAttrs,
  logoAttrs,
  logoImage,
  logoAlign,
  socialAlign,
} = useMenu3(props.tools)

const { onEditTool } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
