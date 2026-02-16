<script setup lang="ts">
import type { TreeInsertType } from '@/features/editor/components/tree/use-tree-helpers'
import { Plus } from 'lucide-vue-next'
import { ref } from 'vue'
import TreeBlock from '@/features/editor/components/tree/TreeBlock.vue'
import TreeInsertLine from '@/features/editor/components/tree/TreeInsertLine.vue'
import { useCanvas, useSelection } from '@/features/editor/model'
import { useTreeScrollSync } from './use-tree-helpers'
import { useTreeInsertion } from './use-tree-insertion'
import './tree-ghost.css'

const {
  installed,
  isCanvasBlockInstance,
  insertBlockToCanvas,
  insertRowToBlock,
  insertCellToRow,
  insertAtomToCell,
  insertRowToCell,
} = useCanvas()

const {
  sidebarActiveTab,
  treeScrollTarget,
  treeScrollRequestId,
  selectBlock,
  selectRow,
  selectCell,
  selectAtom,
} = useSelection()

const rootRef = ref<HTMLElement>()

const {
  activeInsertionPoint,
  allowedTypes,
  handleOpenChange,
  insertionLineTop,
  insertionLineVisible,
  resetInsertionState,
  setTreeHovering,
} = useTreeInsertion({
  rootRef,
  installed,
  sidebarActiveTab,
})

useTreeScrollSync({
  rootRef,
  sidebarActiveTab,
  treeScrollTarget,
  treeScrollRequestId,
})

function handleSelect(type: TreeInsertType) {
  if (!activeInsertionPoint.value)
    return

  const { blockId, rowId, cellId, index, type: targetType } = activeInsertionPoint.value.path

  if (type === 'block') {
    const block = insertBlockToCanvas('Block', index)
    selectBlock(block.block.id)
  }
  else if (type === 'row') {
    if (targetType === 'row' && blockId) {
      if (cellId && rowId) {
        const row = insertRowToCell(blockId, rowId, cellId, index)
        if (row)
          selectRow(blockId, row.id)
      }
      else {
        const row = insertRowToBlock(blockId, index)
        if (row)
          selectRow(blockId, row.id)
      }
    }
    else if ((targetType === 'cell' || targetType === 'atom') && blockId && rowId && cellId) {
      const row = insertRowToCell(blockId, rowId, cellId, index)
      if (row)
        selectRow(blockId, row.id)
    }
  }
  else if (type === 'cell') {
    if (targetType === 'cell' && blockId && rowId) {
      const cell = insertCellToRow(blockId, rowId, index)
      if (cell)
        selectCell(blockId, rowId, cell.id)
    }
  }
  else if (blockId && rowId && cellId) {
    const atom = insertAtomToCell(blockId, rowId, cellId, type, index)
    if (atom)
      selectAtom(blockId, rowId, cellId, atom.id)
  }

  resetInsertionState()
}
</script>

<template>
  <div
    ref="rootRef"
    class="relative"
    @mouseenter="setTreeHovering(true)"
    @mouseleave="setTreeHovering(false)"
  >
    <div
      class="flex cursor-pointer items-center gap-2 border-b border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted"
      @click="insertBlockToCanvas('Block')"
    >
      <Plus class="size-4" />
      Add Block
    </div>

    <TreeInsertLine
      :visible="insertionLineVisible"
      :allowed-types="allowedTypes"
      :style="{ top: `${insertionLineTop}px` }"
      @select="handleSelect"
      @open-change="handleOpenChange"
    />

    <template
      v-for="(item, index) in installed"
      :key="item.id"
    >
      <TreeBlock
        v-if="isCanvasBlockInstance(item)"
        :id="item.id"
        :index="index"
        :block="item.block"
      />
    </template>
    <div
      v-if="!installed.length"
      class="p-6 text-center text-muted-foreground"
    >
      <p class="mt-1 text-xs">
        Add a new empty block or drag & drop from the catalog.
      </p>
    </div>
  </div>
</template>
