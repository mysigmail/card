<template>
  <EmailBase
    v-bind="layoutAttrs"
    :index="index"
    @click.self="onEditTool('Layout', index)"
  >
    <MRow
      v-if="isShowLogo"
      class="p-hover-tools"
      :class="{
        'p-edit-tool': editableId === id && editableToolName === 'Logo',
      }"
      @click="onEditTool('Logo', index)"
    >
      <MColumn align="center">
        <MLink :href="logoImage?.link">
          <MImg
            v-bind="logoAttrs"
            style="display: unset"
          />
        </MLink>
      </MColumn>
    </MRow>
    <MRow
      v-if="isShowDivider"
      class="p-hover-tools"
      :class="{
        'p-edit-tool': editableId === id && editableToolName === 'Divider',
      }"
      @click="onEditTool('Divider', index)"
    >
      <MColumn>
        <MHr v-bind="dividerAttrs" />
      </MColumn>
    </MRow>
    <MRow
      v-if="isShowMenu"
      :style="{
        marginTop: !isShowDivider && isShowLogo ? '20px' : null,
      }"
      class="p-hover-tools"
      :class="{
        'p-edit-tool': editableId === id && editableToolName === 'Menu',
      }"
      @click="onEditTool('Menu', index)"
    >
      <MColumn align="center">
        <MenuItems
          v-if="itemsText"
          :items="itemsText"
        />
      </MColumn>
    </MRow>
  </EmailBase>
</template>

<script setup lang="ts">
import { MColumn, MHr, MImg, MLink, MRow } from '@mysigmail/vue-email-components'
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
  itemsText,
  isShowMenu,
  dividerAttrs,
  logoImage,
  isShowLogo,
  isShowDivider,
} = useMenu2(props.tools)

const { onEditTool, editableToolName, editableId } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
