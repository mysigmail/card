<script setup lang="ts">
import type { InspectorControl } from './use-settings-tools'
import type { BlockNode } from '@/entities/block'

interface Props {
  block: BlockNode
  layoutTools: InspectorControl[]
  appearanceTools: InspectorControl[]
}

defineProps<Props>()
</script>

<template>
  <EditorPanel data-slot="block-settings">
    <EditorInspectorHeader :title="block.label || 'Block'" />
    <EditorPanelItem
      title="Layout"
      state-key="block:layout"
      default-open
    >
      <div class="space-y-3 pb-2">
        <InspectorLayoutTools :tools="layoutTools" />
      </div>
    </EditorPanelItem>
    <EditorPanelItem
      title="Appearance"
      state-key="block:appearance"
    >
      <div class="space-y-3 pb-2">
        <InspectorAppearanceTools :tools="appearanceTools" />
      </div>
    </EditorPanelItem>
  </EditorPanel>
</template>
