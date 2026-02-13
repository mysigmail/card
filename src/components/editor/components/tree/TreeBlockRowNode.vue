<script setup lang="ts">
import type { AtomType, BlockNode, RowNode } from '@/types/block'
import {
  ChevronDown,
  Grid2x2,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Minus,
  MousePointerClick,
  Plus,
  Text,
  Trash2,
} from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useComponentsStore } from '@/store/components'

interface Props {
  block: BlockNode
  row: RowNode
  index: number
  topLevel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  topLevel: false,
})

const {
  selectRow,
  selectCell,
  selectAtom,
  selectedBlockId,
  selectedRowId,
  selectedCellId,
  selectedAtomId,
  insertCellToRow,
  removeRow,
  removeCell,
  insertAtomToCell,
  insertRowToCell,
  removeAtom,
} = useComponentsStore()

const isOpen = ref(true)
const itemPopoverId = ref<string | null>(null)

const canRemoveRow = computed(() => {
  if (!props.topLevel)
    return true

  return props.block.rows.length > 1
})

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

function setItemPopover(itemId: string, open: boolean) {
  itemPopoverId.value = open ? itemId : null
}

function addFromCellPopover(rowId: string, cellId: string, type: AtomType | 'row') {
  if (type === 'row')
    insertRowToCell(props.block.id, rowId, cellId)
  else insertAtomToCell(props.block.id, rowId, cellId, type)

  itemPopoverId.value = null
}
</script>

<template>
  <div :class="topLevel ? 'pl-1' : 'pl-2'">
    <div
      :data-tree-id="`row:${row.id}`"
      class="flex items-center justify-between gap-2 px-2 py-1 text-xs text-muted-foreground"
      :class="{
        'text-foreground!': selectedRowId === row.id && selectedBlockId === block.id,
      }"
      @click="selectRow(block.id, row.id, { syncTree: false })"
    >
      <div class="flex min-w-0 flex-1 items-center gap-1">
        <ChevronDown
          class="size-3.5 transition-transform"
          :class="{ '-rotate-90': !isOpen }"
          @click.stop="isOpen = !isOpen"
        />
        <Grid2x2 class="size-3.5 shrink-0" />
        <span class="truncate cursor-pointer hover:text-foreground">Row {{ index + 1 }}</span>
      </div>

      <ButtonGroup>
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Add Cell"
          @click.stop="insertCellToRow(block.id, row.id)"
        >
          <Plus class="size-3" />
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

    <div v-if="isOpen">
      <div
        v-for="(cell, cellIndex) in row.cells"
        :key="cell.id"
        class="pl-6"
      >
        <div
          :data-tree-id="`cell:${cell.id}`"
          class="flex items-center justify-between gap-2 px-2 py-1 text-xs text-muted-foreground"
          :class="{
            'text-foreground!': selectedCellId === cell.id && selectedRowId === row.id,
          }"
          @click="selectCell(block.id, row.id, cell.id, { syncTree: false })"
        >
          <div class="flex min-w-0 flex-1 items-center gap-1.5">
            <LayoutGrid class="size-3.5 shrink-0" />
            <span class="truncate cursor-pointer hover:text-foreground">Cell {{ cellIndex + 1 }}</span>
          </div>

          <ButtonGroup>
            <Popover
              :open="itemPopoverId === cell.id"
              @update:open="(open: boolean) => setItemPopover(cell.id, open)"
            >
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  size="icon-xs"
                  aria-label="Add"
                  @click.stop
                >
                  <Plus class="size-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                class="w-40 p-1"
              >
                <div class="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    class="justify-start"
                    @click="addFromCellPopover(row.id, cell.id, 'text')"
                  >
                    Text
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="justify-start"
                    @click="addFromCellPopover(row.id, cell.id, 'button')"
                  >
                    Button
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="justify-start"
                    @click="addFromCellPopover(row.id, cell.id, 'divider')"
                  >
                    Divider
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="justify-start"
                    @click="addFromCellPopover(row.id, cell.id, 'image')"
                  >
                    Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="justify-start"
                    @click="addFromCellPopover(row.id, cell.id, 'menu')"
                  >
                    Menu
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="justify-start"
                    @click="addFromCellPopover(row.id, cell.id, 'row')"
                  >
                    Row
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
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

        <div
          v-for="atom in cell.atoms"
          :key="atom.id"
          class="pl-2"
        >
          <div
            :data-tree-id="`atom:${atom.id}`"
            class="flex items-center justify-between gap-2 px-2 py-1 text-xs text-muted-foreground"
            :class="{ 'text-foreground!': selectedAtomId === atom.id }"
            @click="selectAtom(block.id, row.id, cell.id, atom.id, { syncTree: false })"
          >
            <div class="flex min-w-0 flex-1 items-center gap-1.5">
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
              <span class="truncate cursor-pointer hover:text-foreground">{{
                atomLabel(atom.type)
              }}</span>
            </div>
            <Button
              variant="outline"
              size="icon-xs"
              aria-label="Remove Atom"
              @click.stop="removeAtom(block.id, row.id, cell.id, atom.id)"
            >
              <Trash2 class="size-3 text-destructive" />
            </Button>
          </div>
        </div>

        <TreeBlockRowNode
          v-for="(nestedRow, nestedRowIndex) in cell.rows"
          :key="nestedRow.id"
          :block="block"
          :row="nestedRow"
          :index="nestedRowIndex"
        />
      </div>
    </div>
  </div>
</template>
