<script setup lang="ts">
import type { Atom } from '@/entities/block'
import { Copy, GripVertical, Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'
import { useCanvas, useSelection } from '@/features/editor/model'
import { Button } from '@/shared/ui/button'
import { ButtonGroup } from '@/shared/ui/button-group'
import { getTreeAtomMeta } from './use-tree-helpers'

interface Props {
  blockId: string
  rowId: string
  cellId: string
  cellIndex: number
  atom: Atom
  index: number
  atomsCount: number
  indentPx: number
}

const props = defineProps<Props>()

const { duplicateAtom, removeAtom } = useCanvas()
const { selectAtom, selectedAtomId } = useSelection()

const atomMeta = computed(() => getTreeAtomMeta(props.atom.type))
const isAtomActive = computed(() => selectedAtomId.value === props.atom.id)
</script>

<template>
  <div
    data-atom-sortable-item="true"
    :data-name="atomMeta.label"
    class="pl-2"
  >
    <div
      :data-tree-id="`atom:${atom.id}`"
      :data-block-id="blockId"
      :data-row-id="rowId"
      :data-cell-id="cellId"
      :data-atom-id="atom.id"
      :data-parent-cell-index="cellIndex"
      :data-index="index"
      data-type="atom"
      class="relative z-0 flex h-8 cursor-pointer items-center justify-between gap-2 rounded-sm px-2 text-xs text-muted-foreground before:absolute before:inset-y-0 before:right-0 before:left-[calc(var(--tree-node-left-offset)*-1)] before:-z-10 before:rounded-sm before:transition-colors hover:before:bg-muted/60"
      :class="{ 'before:bg-muted/70 text-foreground!': isAtomActive }"
      :style="{ '--tree-node-left-offset': `${indentPx}px` }"
      @click="selectAtom(blockId, rowId, cellId, atom.id, { syncTree: false })"
    >
      <div class="flex min-w-0 flex-1 items-center gap-1.5">
        <GripVertical
          v-if="atomsCount > 1"
          data-atom-drag-handle
          class="size-3.5 shrink-0 cursor-grab text-muted-foreground/80"
        />
        <component
          :is="atomMeta.icon"
          class="size-3.5 shrink-0"
        />
        <span class="truncate">{{ atomMeta.label }}</span>
      </div>
      <ButtonGroup>
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Copy Atom"
          @click.stop="duplicateAtom(blockId, rowId, cellId, atom.id)"
        >
          <Copy class="size-3" />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Remove Atom"
          @click.stop="removeAtom(blockId, rowId, cellId, atom.id)"
        >
          <Trash2 class="size-3 text-destructive" />
        </Button>
      </ButtonGroup>
    </div>
  </div>
</template>
