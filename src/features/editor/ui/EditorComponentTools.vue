<!-- eslint-disable vue/no-extra-parens ломает подсевку синтаксиса -->
<script setup lang="ts">
import type { InspectorControl } from '@/features/editor/components/tools/use-settings-tools'
import type { Tool } from '@/features/editor/model'

import { provide } from 'vue'

interface Props {
  tools: Array<Tool | InspectorControl>
  parentMultiToolId?: string
}

const props = defineProps<Props>()

provide('parentMultiToolId', props.parentMultiToolId)

function update(tool: Tool | InspectorControl, value: unknown) {
  if ('onUpdate' in tool)
    tool.onUpdate(value as never)
}
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
        @update:value="update(i, $event)"
      />
      <InputTool
        v-if="i.type === 'input' || i.type === 'inputNumber'"
        :id="i.id"
        :key="i.id"
        :title="i.label"
        :type="i.type === 'input' ? 'string' : 'number'"
        :value="i.value as string"
        @update:value="update(i, $event)"
      />
      <SpacingTool
        v-if="i.type === 'spacing'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
        @update:value="update(i, $event)"
      />
      <ColorPickerTool
        v-if="i.type === 'colorPicker'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
        :reset-value="i.resetValue"
        @update:value="update(i, $event)"
      />
      <BorderSettings
        v-if="i.type === 'border'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
        @update:value="update(i, $event)"
      />
      <RadiusSettings
        v-if="i.type === 'radius'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
        @update:value="update(i, $event)"
      />
      <OpacitySettings
        v-if="i.type === 'opacity'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
        @update:value="update(i, $event)"
      />
      <ToggleTool
        v-if="i.type === 'toggle'"
        :id="i.id"
        :title="i.label"
        :value="i.value"
        @update:value="update(i, $event)"
      />
      <ImageTool
        v-if="
          i.type === 'image'
            || i.type === 'bgImage'
            || i.type === 'imageContent'
            || i.type === 'imageDimensions'
        "
        :id="i.id"
        :type="i.type"
        :title="i.label"
        :value="i.value"
        @update:value="update(i, $event)"
      />
      <AlignTool
        v-if="i.type === 'align'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
        @update:value="update(i, $event)"
      />
      <MultiTool
        v-if="i.type === 'multi'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
      />
      <ColumnCollectionTool
        v-if="i.type === 'columns'"
        :id="i.id"
        :value="i.value"
        :title="i.label"
      />
    </template>
  </div>
</template>

<style scoped></style>
