<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { BlockNode, RowNode } from '@/entities/block'
import { ChevronDown, Copy, Grid2x2, GripVertical, Trash2 } from 'lucide-vue-next'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import TreeCell from '@/features/editor/components/tree/TreeCell.vue'
import { useCanvas, useSelection } from '@/features/editor/model'
import { Button } from '@/shared/ui/button'
import { ButtonGroup } from '@/shared/ui/button-group'
import { hasAtomInTree, hasCellInTree, hasRowInTree, TREE_NODE_INDENT_PX } from './use-tree-helpers'
import { createTreeSortable } from './use-tree-sortable'

interface Props {
  block: BlockNode
  row: RowNode
  index: number
  topLevel?: boolean
  cellId?: string
  parentRowId?: string
  indentPx?: number
  siblingsCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  topLevel: false,
  indentPx: 0,
  siblingsCount: 1,
})

const { removeRow, duplicateRow, moveCell, moveCellChild, isDragging } = useCanvas()

const { selectRow, selectedBlockId, selectedRowId, selectedCellId, selectedAtomId } = useSelection()

const isOpen = ref(true)
const cellsRef = ref<HTMLElement>()

const rowIndentPx = computed(() => {
  const ownIndent = props.topLevel ? TREE_NODE_INDENT_PX.root : TREE_NODE_INDENT_PX.level

  return props.indentPx + ownIndent
})
const cellIndentPx = computed(() => rowIndentPx.value + TREE_NODE_INDENT_PX.level)
const atomIndentPx = computed(() => cellIndentPx.value + TREE_NODE_INDENT_PX.level)
const cellSortableItemId = computed(() => `row:${props.row.id}`)
const canDragRow = computed(
  () =>
    (props.topLevel && props.block.rows.length > 1) || (!props.topLevel && props.siblingsCount > 1),
)

const canRemoveRow = computed(() => {
  if (!props.topLevel)
    return true

  return props.block.rows.length > 1
})

const cellSortKey = computed(() => props.row.cells.map(cell => cell.id).join('|'))
const atomSortKey = computed(() =>
  props.row.cells.map(cell => `${cell.id}:${cell.children.length}`).join('|'),
)

let cellSortable: ReturnType<typeof createTreeSortable> | undefined
const atomListRefMap = new Map<string, HTMLElement>()
const atomSortables = new Map<string, ReturnType<typeof createTreeSortable>>()

function destroyCellsSortable() {
  cellSortable?.destroy()
  cellSortable = undefined
}

function destroyAtomSortables() {
  atomSortables.forEach(sortable => sortable.destroy())
  atomSortables.clear()
}

function initCellsSortable() {
  if (!cellsRef.value || cellSortable)
    return

  cellSortable = createTreeSortable({
    el: cellsRef.value,
    draggable: `[data-cell-sortable-item="${cellSortableItemId.value}"]`,
    handle: '[data-cell-drag-handle]',
    ghostClass: 'tree-cell-ghost',
    isDragging,
    onMove(oldIndex, newIndex) {
      moveCell(props.block.id, props.row.id, oldIndex, newIndex)
    },
    getDragName(dragEl) {
      return dragEl.getAttribute('data-name') || 'Cell'
    },
  })
}

function setAtomListRef(cellId: string, el: Element | ComponentPublicInstance | null) {
  if (el instanceof HTMLElement) {
    atomListRefMap.set(cellId, el)
    return
  }

  atomListRefMap.delete(cellId)
}

function initAtomSortables() {
  if (atomSortables.size > 0)
    return

  props.row.cells.forEach((cell) => {
    const atomListEl = atomListRefMap.get(cell.id)
    if (!atomListEl)
      return

    const sortable = createTreeSortable({
      el: atomListEl,
      draggable: '[data-cell-child-sortable-item="true"]',
      handle: '[data-cell-child-drag-handle]',
      ghostClass: 'tree-atom-ghost',
      isDragging,
      onMove(oldIndex, newIndex) {
        moveCellChild(props.block.id, props.row.id, cell.id, oldIndex, newIndex)
      },
      getDragName(dragEl) {
        return dragEl.getAttribute('data-name') || 'Atom'
      },
    })

    atomSortables.set(cell.id, sortable)
  })
}

const shouldExpand = computed(() => {
  if (selectedBlockId.value !== props.block.id)
    return false

  if (selectedRowId.value && hasRowInTree(props.row, selectedRowId.value))
    return true

  if (selectedCellId.value && hasCellInTree(props.row, selectedCellId.value))
    return true

  if (selectedAtomId.value && hasAtomInTree(props.row, selectedAtomId.value))
    return true

  return false
})

watch(
  shouldExpand,
  (value) => {
    if (value)
      isOpen.value = true
  },
  { immediate: true },
)

watch(
  [isOpen, cellSortKey, atomSortKey],
  async ([open]) => {
    if (!open) {
      destroyCellsSortable()
      destroyAtomSortables()
      return
    }

    await nextTick()
    destroyCellsSortable()
    destroyAtomSortables()
    initCellsSortable()
    initAtomSortables()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  destroyCellsSortable()
  destroyAtomSortables()
})

function isRowActive(rowId: string) {
  return selectedRowId.value === rowId && !selectedCellId.value && !selectedAtomId.value
}
</script>

<template>
  <div
    :data-cell-child-sortable-item="topLevel ? undefined : 'true'"
    :data-row-scope-id="`row-scope:${row.id}`"
    :data-row-sortable-item="topLevel ? 'true' : undefined"
    :data-name="topLevel ? `Row ${index + 1}` : undefined"
    :data-row-scope-block-id="block.id"
    :data-row-scope-row-id="parentRowId || row.id"
    :data-row-scope-cell-id="cellId"
    :data-row-scope-index="index"
    :class="topLevel ? 'pl-1' : 'pl-3'"
  >
    <div
      :data-tree-id="`row:${row.id}`"
      :data-block-id="block.id"
      :data-row-id="parentRowId || row.id"
      :data-cell-id="cellId"
      :data-index="index"
      data-type="row"
      class="relative z-0 flex h-8 cursor-pointer items-center justify-between gap-2 rounded-sm px-2 text-xs text-muted-foreground before:absolute before:inset-y-0 before:right-0 before:left-[calc(var(--tree-node-left-offset)*-1)] before:-z-10 before:rounded-sm before:transition-colors hover:before:bg-muted/60"
      :class="{ 'before:bg-muted/70 text-foreground!': isRowActive(row.id) }"
      :style="{ '--tree-node-left-offset': `${rowIndentPx}px` }"
      @click="selectRow(block.id, row.id, { syncTree: false })"
    >
      <div
        class="grid min-w-0 flex-1 grid-cols-[0.75rem_0.75rem_minmax(0,1fr)] items-center gap-0.5"
      >
        <ChevronDown
          class="size-3 transition-transform"
          :class="{ '-rotate-90': !isOpen }"
          @click.stop="isOpen = !isOpen"
        />
        <div
          class="col-span-2 grid min-w-0 grid-cols-[0.75rem_minmax(0,1fr)] items-center gap-0.5"
          :data-row-drag-handle="canDragRow && topLevel ? '' : undefined"
          :data-cell-child-drag-handle="canDragRow && !topLevel ? '' : undefined"
        >
          <Grid2x2 class="size-3 shrink-0" />
          <span class="truncate">Row {{ index + 1 }}</span>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-0.5">
        <GripVertical
          v-if="canDragRow"
          :data-row-drag-handle="topLevel ? '' : undefined"
          :data-cell-child-drag-handle="topLevel ? undefined : ''"
          class="size-3 shrink-0 cursor-grab text-muted-foreground/80"
        />
        <ButtonGroup>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Copy Row"
            @click.stop="duplicateRow(block.id, row.id)"
          >
            <Copy class="size-3" />
          </Button>
          <Button
            v-if="canRemoveRow"
            variant="outline"
            size="icon-xs"
            aria-label="Remove Row"
            @click.stop="removeRow(block.id, row.id)"
          >
            <Trash2 class="size-3 text-destructive" />
          </Button>
        </ButtonGroup>
      </div>
    </div>

    <div
      v-if="isOpen"
      ref="cellsRef"
    >
      <template
        v-for="(cell, cellIndex) in row.cells"
        :key="cell.id"
      >
        <TreeCell
          :block="block"
          :block-id="block.id"
          :row-id="row.id"
          :cell="cell"
          :index="cellIndex"
          :row-cells-count="row.cells.length"
          :cell-sortable-item-id="cellSortableItemId"
          :cell-indent-px="cellIndentPx"
          :atom-indent-px="atomIndentPx"
          :set-atom-list-ref="setAtomListRef"
        />
      </template>
    </div>
  </div>
</template>
