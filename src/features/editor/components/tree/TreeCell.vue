<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { CellNode } from '@/entities/block'
import { Copy, GripVertical, LayoutGrid, Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'
import TreeAtom from '@/features/editor/components/tree/TreeAtom.vue'
import { useCanvas, useSelection } from '@/features/editor/model'
import { Button } from '@/shared/ui/button'
import { ButtonGroup } from '@/shared/ui/button-group'

interface Props {
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

const { duplicateCell, removeCell } = useCanvas()
const { selectCell, selectedCellId, selectedAtomId } = useSelection()

const isCellActive = computed(() => {
  return selectedCellId.value === props.cell.id && !selectedAtomId.value
})
</script>

<template>
  <div
    :data-cell-sortable-item="cellSortableItemId"
    :data-name="`Cell ${index + 1}`"
    class="pl-6"
  >
    <div
      :data-tree-id="`cell:${cell.id}`"
      :data-block-id="blockId"
      :data-row-id="rowId"
      :data-cell-id="cell.id"
      :data-atom-count="cell.atoms.length"
      :data-index="index"
      data-type="cell"
      class="relative z-0 flex h-8 cursor-pointer items-center justify-between gap-2 rounded-sm px-2 text-xs text-muted-foreground before:absolute before:inset-y-0 before:right-0 before:left-[calc(var(--tree-node-left-offset)*-1)] before:-z-10 before:rounded-sm before:transition-colors hover:before:bg-muted/60"
      :class="{ 'before:bg-muted/70 text-foreground!': isCellActive }"
      :style="{ '--tree-node-left-offset': `${cellIndentPx}px` }"
      @click="selectCell(blockId, rowId, cell.id, { syncTree: false })"
    >
      <div class="flex min-w-0 flex-1 items-center gap-1.5">
        <GripVertical
          v-if="rowCellsCount > 1"
          data-cell-drag-handle
          class="size-3.5 shrink-0 cursor-grab text-muted-foreground/80"
        />
        <LayoutGrid class="size-3.5 shrink-0" />
        <span class="truncate">Cell {{ index + 1 }}</span>
      </div>

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

    <div :ref="(el) => setAtomListRef(cell.id, el)">
      <TreeAtom
        v-for="(atom, atomIndex) in cell.atoms"
        :key="atom.id"
        :block-id="blockId"
        :row-id="rowId"
        :cell-id="cell.id"
        :cell-index="index"
        :atom="atom"
        :index="atomIndex"
        :atoms-count="cell.atoms.length"
        :indent-px="atomIndentPx"
      />
    </div>
  </div>
</template>
