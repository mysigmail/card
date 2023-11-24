<template>
  <EmailBase
    v-bind="layoutAttrs"
    :index="index"
    @click.self="onEditTool('Layout', index)"
  >
    <MRow>
      <MColumn
        v-if="isShowLogo"
        class="p-hover-tools"
        style="width: 100%"
        :class="{
          'p-edit-tool': editableId === id && editableToolName === 'Logo',
        }"
        @click="onEditTool('Logo', index)"
      >
        <MLink :href="logoImage?.link">
          <MImg v-bind="logoAttrs" />
        </MLink>
      </MColumn>
      <MColumn
        v-if="isShowSocial"
        class="p-hover-tools"
        align="right"
        :class="{
          'p-edit-tool': editableId === id && editableToolName === 'Social',
        }"
        @click="onEditTool('Social', index)"
      >
        <MenuItemsImg :items="itemsImg" />
      </MColumn>
    </MRow>
  </EmailBase>
</template>

<script setup lang="ts">
import { MColumn, MImg, MLink, MRow } from '@mysigmail/vue-email-components'
import { useMenu3 } from './composables/menu-3'
import type { Tool } from '@/types/editor'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  index: number
  tools: Tool[]
}

const props = defineProps<Props>()

const { isShowLogo, isShowSocial, itemsImg, layoutAttrs, logoAttrs, logoImage } = useMenu3(
  props.tools,
)

const { onEditTool, editableToolName, editableId } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
