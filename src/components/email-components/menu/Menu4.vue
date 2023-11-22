<template>
  <EmailBase
    v-bind="layoutAttrs"
    :index="index"
    @click.self="onEditTool('General', index)"
  >
    <MColumn
      :style="{
        width: `${logoContainerWidth}px`,
      }"
    >
      <MRow
        v-if="isShowLogo"
        class="p-hover-tools"
        :class="{
          'p-edit-tool': editableId === id && editableToolName === 'Logo',
        }"
        @click="onEditTool('Logo', index)"
      >
        <MLink :href="logoImage?.link">
          <MImg v-bind="logoAttrs" />
        </MLink>
      </MRow>
      <MRow v-if="isShowMenu">
        <MenuItems
          v-if="itemsText"
          class="p-hover-tools"
          :class="{
            'p-edit-tool': editableId === id && editableToolName === 'Menu',
          }"
          :items="itemsText"
          align="left"
          :style="{
            marginTop: isShowLogo ? '20px' : null,
          }"
          @click="onEditTool('Menu', index)"
        />
      </MRow>
    </MColumn>
  </EmailBase>
</template>

<script setup lang="ts">
import { MColumn, MImg, MLink, MRow } from '@mysigmail/vue-email-components'
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
  logoContainerWidth,
  layoutAttrs,
  logoAttrs,
  logoImage,
  isShowMenu,
  isShowLogo,
  itemsText,
} = useCommon(props.tools)

const { onEditTool, editableToolName, editableId } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
