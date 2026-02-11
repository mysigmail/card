<!-- eslint-disable vue/no-extra-parens ломает подсевку синтаксиса -->
<script setup lang="ts">
import type { Tool } from '@/types/editor'

import { provide } from 'vue'

interface Props {
  tools: Tool[]
  parentMultiToolId?: string
}

const props = defineProps<Props>()

provide('parentMultiToolId', props.parentMultiToolId)
</script>

<template>
  <div class="tools">
    <template
      v-for="i in tools"
      :key="i.id"
    >
      <SelectTool
        v-if="i.type === 'select'"
        :id="i.id"
        :key="i.id"
        :title="i.label"
        :value="i.value as string"
        :options="i.options"
      />
      <InputTool
        v-if="i.type === 'input' || i.type === 'inputNumber'"
        :id="i.id"
        :key="i.id"
        :title="i.label"
        :type="i.type === 'input' ? 'string' : 'number'"
        :value="i.value as string"
      />
      <PaddingTool
        v-if="i.type === 'padding'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
      />
      <SpacingTool
        v-if="i.type === 'spacing'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
      />
      <ColorPickerTool
        v-if="i.type === 'colorPicker'"
        :id="i.id"
        v-model:value="i.value"
        :title="i.label"
      />
      <ToggleTool
        v-if="i.type === 'toggle'"
        :id="i.id"
        :title="i.label"
        :value="i.value"
      />
      <ImageTool
        v-if="i.type === 'image' || i.type === 'bgImage'"
        :id="i.id"
        :type="i.type"
        :title="i.label"
        :value="i.value"
      />
      <AlignTool
        v-if="i.type === 'align'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
      />
      <TextEditorTool
        v-if="i.type === 'textEditor'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
      />
      <MultiTool
        v-if="i.type === 'multi'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
      />
      <GridTool
        v-if="i.type === 'grid'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
      />
    </template>
  </div>
</template>

<style scoped></style>
