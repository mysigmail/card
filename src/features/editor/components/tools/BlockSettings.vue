<script setup lang="ts">
import type { InspectorControl } from './use-settings-tools'
import type { BlockNode } from '@/entities/block'

interface Props {
  block: BlockNode
  tools: InspectorControl[]
}

defineProps<Props>()
</script>

<template>
  <EditorPanel data-slot="block-settings">
    <EditorPanelItem
      type="opened"
      :title="block.label || 'Block'"
    >
      <div class="space-y-3 pb-2">
        <EditorComponentTools :tools="tools" />
      </div>
    </EditorPanelItem>
  </EditorPanel>
</template>
