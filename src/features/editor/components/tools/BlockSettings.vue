<script setup lang="ts">
import type { BlockNode } from '@/entities/block'
import type { Tool } from '@/features/editor/model'

interface Props {
  block: BlockNode
  tools: Tool[]
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
