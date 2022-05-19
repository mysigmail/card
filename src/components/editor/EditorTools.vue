<template>
  <div class="tools">
    <template
      v-for="(i, index) in tools"
      :key="index"
    >
      <InputTool
        v-if="i.type === 'input' || i.type === 'inputNumber'"
        :id="i.id"
        :title="i.label"
        :type="i.type === 'input' ? 'string' : 'number'"
        :value="(i.value as string)"
        :update-parent-label="i.updateParentLabel"
      />
      <PaddingTool
        v-if="i.type === 'padding'"
        :id="i.id"
        :value="(i.value as PaddingToolValue)"
        :title="i.label"
      />
      <ColorPickerTool
        v-if="i.type === 'colorPicker'"
        :id="i.id"
        :title="i.label"
        :value="(i.value as string)"
      />
      <ToggleTool
        v-if="i.type === 'toggle'"
        :id="i.id"
        :title="i.label"
        :value="(i.value as boolean)"
      />
      <ImageTool
        v-if="i.type === 'image'"
        :id="i.id"
        :title="i.label"
        :value="(i.value as ImageToolValue)"
      />
      <MultiTool
        v-if="i.type === 'multi'"
        :id="i.id"
        :value="(i.value as Tool[])"
        :title="i.label"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Tool, PaddingToolValue, ImageToolValue } from '@/types/editor'
import { provide } from 'vue'

interface Props {
  tools: Tool[]
  parentMultiToolId?: string
}

const props = defineProps<Props>()

provide('parentMultiToolId', props.parentMultiToolId)
</script>

<style lang="scss" scoped></style>
