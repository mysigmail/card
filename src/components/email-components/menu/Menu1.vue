<template>
  <EmailBase
    v-bind="layoutAttrs"
    :index="index"
    @click.self="onEditTool('Layout', index)"
  >
    <MColumn
      v-if="isShowLogo"
      class="p-hover-tools"
      :class="{
        'p-edit-tool': editableId === id && editableToolName === 'Logo',
      }"
      :style="{
        width: `${logoContainerWidth}px`,
      }"
      @click="onEditTool('Logo', index)"
    >
      <MRow>
        <MColumn>
          <MLink :href="logoImage?.link">
            <MImg v-bind="logoAttrs" />
          </MLink>
        </MColumn>
      </MRow>
    </MColumn>
    <MColumn
      v-if="isShowMenu"
      class="p-hover-tools"
      :class="{
        'p-edit-tool': editableId === id && editableToolName === 'Menu',
      }"
      @click="onEditTool('Menu', index)"
    >
      <MenuItems
        v-if="itemsText"
        class="menu-items"
        :items="itemsText"
      />
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

const { logoContainerWidth, layoutAttrs, logoAttrs, logoImage, isShowMenu, isShowLogo, itemsText }
  = useCommon(props.tools)

const { onEditTool, editableToolName, editableId } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
