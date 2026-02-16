<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { AtomType, BlockNode, RowNode } from '@/entities/block'
import {
  ChevronDown,
  Copy,
  Grid2x2,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Minus,
  MousePointerClick,
  Text,
  Trash2,
} from 'lucide-vue-next'
import Sortable from 'sortablejs'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useCanvas, useSelection } from '@/features/editor/model'
import { addGhost, removeGhost } from '@/features/email-preview'
import { Button } from '@/shared/ui/button'
import { ButtonGroup } from '@/shared/ui/button-group'

interface Props {
  block: BlockNode
  row: RowNode
  index: number
  topLevel?: boolean
  cellId?: string
  parentRowId?: string
  indentPx?: number
}

const props = withDefaults(defineProps<Props>(), {
  topLevel: false,
  indentPx: 0,
})

const {
  removeRow,
  duplicateRow,
  removeCell,
  duplicateCell,
  removeAtom,
  duplicateAtom,
  moveCell,
  moveAtom,
  isDragging,
} = useCanvas()

const {
  selectRow,
  selectCell,
  selectAtom,
  selectedBlockId,
  selectedRowId,
  selectedCellId,
  selectedAtomId,
} = useSelection()

const isOpen = ref(true)
const cellsRef = ref<HTMLElement>()
const TOP_LEVEL_INDENT_PX = 4
const NESTED_ROW_INDENT_PX = 8
const CELL_INDENT_PX = 24
const ATOM_INDENT_PX = 8

const rowIndentPx = computed(() => {
  const ownIndent = props.topLevel ? TOP_LEVEL_INDENT_PX : NESTED_ROW_INDENT_PX
  return props.indentPx + ownIndent
})
const cellIndentPx = computed(() => rowIndentPx.value + CELL_INDENT_PX)
const atomIndentPx = computed(() => cellIndentPx.value + ATOM_INDENT_PX)
const cellSortableItemId = computed(() => `row:${props.row.id}`)
const canRemoveRow = computed(() => {
  if (!props.topLevel)
    return true

  return props.block.rows.length > 1
})
const cellSortKey = computed(() => props.row.cells.map(cell => cell.id).join('|'))
const atomSortKey = computed(() =>
  props.row.cells.map(cell => `${cell.id}:${cell.atoms.length}`).join('|'),
)

let cellSortable: Sortable | undefined
const atomListRefMap = new Map<string, HTMLElement>()
const atomSortables = new Map<string, Sortable>()

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

  cellSortable = Sortable.create(cellsRef.value, {
    animation: 150,
    draggable: `[data-cell-sortable-item="${cellSortableItemId.value}"]`,
    handle: '[data-cell-drag-handle]',
    ghostClass: 'tree-cell-ghost',
    swapThreshold: 0.5,
    onStart() {
      isDragging.value = true
    },
    onEnd(e) {
      removeGhost()
      isDragging.value = false

      if (e.oldIndex === undefined || e.newIndex === undefined)
        return

      moveCell(props.block.id, props.row.id, e.oldIndex, e.newIndex)
    },
    setData(dataTransfer, dragEl) {
      const name = dragEl.getAttribute('data-name') || 'Cell'
      addGhost(dataTransfer, name, 'sm')
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

    const sortable = Sortable.create(atomListEl, {
      animation: 150,
      draggable: '[data-atom-sortable-item="true"]',
      handle: '[data-atom-drag-handle]',
      ghostClass: 'tree-atom-ghost',
      swapThreshold: 0.5,
      onStart() {
        isDragging.value = true
      },
      onEnd(e) {
        removeGhost()
        isDragging.value = false

        if (e.oldIndex === undefined || e.newIndex === undefined)
          return

        moveAtom(props.block.id, props.row.id, cell.id, e.oldIndex, e.newIndex)
      },
      setData(dataTransfer, dragEl) {
        const name = dragEl.getAttribute('data-name') || 'Atom'
        addGhost(dataTransfer, name, 'sm')
      },
    })

    atomSortables.set(cell.id, sortable)
  })
}

function hasRowInTree(row: RowNode, rowId: string): boolean {
  if (row.id === rowId)
    return true

  return row.cells.some(cell => cell.rows.some(nested => hasRowInTree(nested, rowId)))
}

function hasCellInTree(row: RowNode, cellId: string): boolean {
  return row.cells.some((cell) => {
    if (cell.id === cellId)
      return true

    return cell.rows.some(nested => hasCellInTree(nested, cellId))
  })
}

function hasAtomInTree(row: RowNode, atomId: string): boolean {
  return row.cells.some((cell) => {
    if (cell.atoms.some(atom => atom.id === atomId))
      return true

    return cell.rows.some(nested => hasAtomInTree(nested, atomId))
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

function atomLabel(type: AtomType) {
  switch (type) {
    case 'text':
      return 'Text'
    case 'button':
      return 'Button'
    case 'divider':
      return 'Divider'
    case 'image':
      return 'Image'
    case 'menu':
      return 'Menu'
  }
}

function isRowActive(rowId: string) {
  return selectedRowId.value === rowId && !selectedCellId.value && !selectedAtomId.value
}

function isCellActive(cellId: string) {
  return selectedCellId.value === cellId && !selectedAtomId.value
}

function isAtomActive(atomId: string) {
  return selectedAtomId.value === atomId
}
</script>

<template>
  <div
    :data-row-scope-id="`row-scope:${row.id}`"
    :data-row-sortable-item="topLevel ? 'true' : undefined"
    :data-name="topLevel ? `Row ${index + 1}` : undefined"
    :data-row-scope-block-id="block.id"
    :data-row-scope-row-id="parentRowId || row.id"
    :data-row-scope-cell-id="cellId"
    :data-row-scope-index="index"
    :class="topLevel ? 'pl-1' : 'pl-2'"
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
      <div class="flex min-w-0 flex-1 items-center gap-1">
        <GripVertical
          v-if="topLevel && block.rows.length > 1"
          data-row-drag-handle
          class="size-3.5 shrink-0 cursor-grab text-muted-foreground/80"
        />
        <ChevronDown
          class="size-3.5 transition-transform"
          :class="{ '-rotate-90': !isOpen }"
          @click.stop="isOpen = !isOpen"
        />
        <Grid2x2 class="size-3.5 shrink-0" />
        <span class="truncate">Row {{ index + 1 }}</span>
      </div>

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

    <div
      v-if="isOpen"
      ref="cellsRef"
    >
      <div
        v-for="(cell, cellIndex) in row.cells"
        :key="cell.id"
        :data-cell-sortable-item="cellSortableItemId"
        :data-name="`Cell ${cellIndex + 1}`"
        class="pl-6"
      >
        <div
          :data-tree-id="`cell:${cell.id}`"
          :data-block-id="block.id"
          :data-row-id="row.id"
          :data-cell-id="cell.id"
          :data-atom-count="cell.atoms.length"
          :data-index="cellIndex"
          data-type="cell"
          class="relative z-0 flex h-8 cursor-pointer items-center justify-between gap-2 rounded-sm px-2 text-xs text-muted-foreground before:absolute before:inset-y-0 before:right-0 before:left-[calc(var(--tree-node-left-offset)*-1)] before:-z-10 before:rounded-sm before:transition-colors hover:before:bg-muted/60"
          :class="{
            'before:bg-muted/70 text-foreground!': isCellActive(cell.id),
          }"
          :style="{ '--tree-node-left-offset': `${cellIndentPx}px` }"
          @click="selectCell(block.id, row.id, cell.id, { syncTree: false })"
        >
          <div class="flex min-w-0 flex-1 items-center gap-1.5">
            <GripVertical
              v-if="row.cells.length > 1"
              data-cell-drag-handle
              class="size-3.5 shrink-0 cursor-grab text-muted-foreground/80"
            />
            <LayoutGrid class="size-3.5 shrink-0" />
            <span class="truncate">Cell {{ cellIndex + 1 }}</span>
          </div>

          <ButtonGroup>
            <Button
              variant="outline"
              size="icon-xs"
              aria-label="Copy Cell"
              @click.stop="duplicateCell(block.id, row.id, cell.id)"
            >
              <Copy class="size-3" />
            </Button>
            <Button
              v-if="row.cells.length > 1"
              variant="outline"
              size="icon-xs"
              aria-label="Remove Cell"
              @click.stop="removeCell(block.id, row.id, cell.id)"
            >
              <Trash2 class="size-3 text-destructive" />
            </Button>
          </ButtonGroup>
        </div>

        <div :ref="(el) => setAtomListRef(cell.id, el)">
          <div
            v-for="(atom, atomIndex) in cell.atoms"
            :key="atom.id"
            data-atom-sortable-item="true"
            :data-name="atomLabel(atom.type)"
            class="pl-2"
          >
            <div
              :data-tree-id="`atom:${atom.id}`"
              :data-block-id="block.id"
              :data-row-id="row.id"
              :data-cell-id="cell.id"
              :data-atom-id="atom.id"
              :data-parent-cell-index="cellIndex"
              :data-index="atomIndex"
              data-type="atom"
              class="relative z-0 flex h-8 cursor-pointer items-center justify-between gap-2 rounded-sm px-2 text-xs text-muted-foreground before:absolute before:inset-y-0 before:right-0 before:left-[calc(var(--tree-node-left-offset)*-1)] before:-z-10 before:rounded-sm before:transition-colors hover:before:bg-muted/60"
              :class="{ 'before:bg-muted/70 text-foreground!': isAtomActive(atom.id) }"
              :style="{ '--tree-node-left-offset': `${atomIndentPx}px` }"
              @click="selectAtom(block.id, row.id, cell.id, atom.id, { syncTree: false })"
            >
              <div class="flex min-w-0 flex-1 items-center gap-1.5">
                <GripVertical
                  v-if="cell.atoms.length > 1"
                  data-atom-drag-handle
                  class="size-3.5 shrink-0 cursor-grab text-muted-foreground/80"
                />
                <Text
                  v-if="atom.type === 'text'"
                  class="size-3.5 shrink-0"
                />
                <MousePointerClick
                  v-else-if="atom.type === 'button'"
                  class="size-3.5 shrink-0"
                />
                <ImageIcon
                  v-else-if="atom.type === 'image'"
                  class="size-3.5 shrink-0"
                />
                <List
                  v-else-if="atom.type === 'menu'"
                  class="size-3.5 shrink-0"
                />
                <Minus
                  v-else
                  class="size-3.5 shrink-0"
                />
                <span class="truncate">{{ atomLabel(atom.type) }}</span>
              </div>
              <ButtonGroup>
                <Button
                  variant="outline"
                  size="icon-xs"
                  aria-label="Copy Atom"
                  @click.stop="duplicateAtom(block.id, row.id, cell.id, atom.id)"
                >
                  <Copy class="size-3" />
                </Button>
                <Button
                  variant="outline"
                  size="icon-xs"
                  aria-label="Remove Atom"
                  @click.stop="removeAtom(block.id, row.id, cell.id, atom.id)"
                >
                  <Trash2 class="size-3 text-destructive" />
                </Button>
              </ButtonGroup>
            </div>
          </div>
        </div>

        <TreeBlockRowNode
          v-for="(nestedRow, nestedRowIndex) in cell.rows"
          :key="nestedRow.id"
          :block="block"
          :row="nestedRow"
          :cell-id="cell.id"
          :parent-row-id="row.id"
          :index="nestedRowIndex"
          :indent-px="cellIndentPx"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.tree-cell-ghost,
.tree-atom-ghost {
  background-color: color-mix(in oklch, var(--primary), transparent 90%) !important;
  border: 2px dashed var(--primary) !important;
  border-radius: var(--radius-sm) !important;
  height: 28px !important;
  width: 90% !important;
  margin: 4px auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  opacity: 1 !important;
}

.tree-cell-ghost > *,
.tree-atom-ghost > * {
  display: none !important;
}

.tree-cell-ghost::after,
.tree-atom-ghost::after {
  content: 'Drop Here';
  font-size: 10px !important;
  font-weight: 700 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
  color: var(--primary) !important;
  display: block !important;
}
</style>
