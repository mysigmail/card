<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { BlockNode, CellNode } from '@/entities/block'
import { ChevronDown, Copy, GripVertical, LayoutGrid, Trash2 } from 'lucide-vue-next'
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import TreeAtom from '@/features/editor/components/tree/TreeAtom.vue'
import { useCanvas, useSelection } from '@/features/editor/model'
import { Button } from '@/shared/ui/button'
import { ButtonGroup } from '@/shared/ui/button-group'
import { hasAtomInTree, hasCellInTree, hasRowInTree } from './use-tree-helpers'

interface Props {
  block: BlockNode
  blockId: string
  rowId: string
  cell: CellNode
  index: number
  rowCellsCount: number
  cellSortableItemId: string
  cellIndentPx: number
  atomIndentPx: number
  setAtomListRef: (cellId: string, el: Element | ComponentPublicInstance | null) => void
}

const props = defineProps<Props>()
const TreeRow = defineAsyncComponent(() => import('./TreeRow.vue'))

const { duplicateCell, removeCell } = useCanvas()
const { selectCell, selectedBlockId, selectedRowId, selectedCellId, selectedAtomId }
  = useSelection()

const isOpen = ref(true)
const nestedRows = computed(() => props.cell.children.filter(child => child.type === 'row'))

const isCellActive = computed(() => {
  return selectedCellId.value === props.cell.id && !selectedAtomId.value
})

const shouldExpand = computed(() => {
  if (selectedBlockId.value !== props.block.id)
    return false

  const rowId = selectedRowId.value
  if (rowId && nestedRows.value.some(row => hasRowInTree(row, rowId)))
    return true

  const cellId = selectedCellId.value
  if (
    cellId
    && cellId !== props.cell.id
    && nestedRows.value.some(row => hasCellInTree(row, cellId))
  ) {
    return true
  }

  const atomId = selectedAtomId.value
  if (!atomId)
    return false

  return (
    props.cell.children.some(child => child.type !== 'row' && child.id === atomId)
    || nestedRows.value.some(row => hasAtomInTree(row, atomId))
  )
})

watch(
  shouldExpand,
  (value) => {
    if (value)
      isOpen.value = true
  },
  { immediate: true },
)
</script>

<template>
  <div
    :data-cell-sortable-item="cellSortableItemId"
    :data-name="`Cell ${index + 1}`"
    class="pl-3"
  >
    <div
      :data-tree-id="`cell:${cell.id}`"
      :data-block-id="blockId"
      :data-row-id="rowId"
      :data-cell-id="cell.id"
      :data-atom-count="cell.children.filter((child) => child.type !== 'row').length"
      :data-index="index"
      data-type="cell"
      class="relative z-0 flex h-8 cursor-pointer items-center justify-between gap-2 rounded-sm px-2 text-xs text-muted-foreground before:absolute before:inset-y-0 before:right-0 before:left-[calc(var(--tree-node-left-offset)*-1)] before:-z-10 before:rounded-sm before:transition-colors hover:before:bg-muted/60"
      :class="{ 'before:bg-muted/70 text-foreground!': isCellActive }"
      :style="{ '--tree-node-left-offset': `${cellIndentPx}px` }"
      @click="selectCell(blockId, rowId, cell.id, { syncTree: false })"
    >
      <div
        class="grid min-w-0 flex-1 grid-cols-[0.75rem_0.75rem_minmax(0,1fr)] items-center gap-0.5"
      >
        <ChevronDown
          v-if="cell.children.length"
          class="size-3 shrink-0 transition-transform"
          :class="{ '-rotate-90': !isOpen }"
          @click.stop="isOpen = !isOpen"
        />
        <span
          v-else
          aria-hidden="true"
          class="size-3 shrink-0"
        />
        <div
          class="col-span-2 grid min-w-0 grid-cols-[0.75rem_minmax(0,1fr)] items-center gap-0.5"
          :data-cell-drag-handle="rowCellsCount > 1 ? '' : undefined"
        >
          <LayoutGrid class="size-3 shrink-0" />
          <span class="truncate">Cell {{ index + 1 }}</span>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-0.5">
        <GripVertical
          v-if="rowCellsCount > 1"
          data-cell-drag-handle
          class="size-3 shrink-0 cursor-grab text-muted-foreground/80"
        />
        <ButtonGroup>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Copy Cell"
            @click.stop="duplicateCell(blockId, rowId, cell.id)"
          >
            <Copy class="size-3" />
          </Button>
          <Button
            v-if="rowCellsCount > 1"
            variant="outline"
            size="icon-xs"
            aria-label="Remove Cell"
            @click.stop="removeCell(blockId, rowId, cell.id)"
          >
            <Trash2 class="size-3 text-destructive" />
          </Button>
        </ButtonGroup>
      </div>
    </div>

    <div
      v-show="isOpen"
      :ref="(el) => setAtomListRef(cell.id, el)"
    >
      <template
        v-for="(child, childIndex) in cell.children"
        :key="child.id"
      >
        <TreeRow
          v-if="child.type === 'row'"
          :block="block"
          :row="child"
          :cell-id="cell.id"
          :parent-row-id="rowId"
          :index="childIndex"
          :siblings-count="cell.children.length"
          :indent-px="cellIndentPx"
        />
        <TreeAtom
          v-else
          :block-id="blockId"
          :row-id="rowId"
          :cell-id="cell.id"
          :cell-index="index"
          :atom="child"
          :index="childIndex"
          :atoms-count="cell.children.length"
          :indent-px="atomIndentPx"
        />
      </template>
    </div>
  </div>
</template>
