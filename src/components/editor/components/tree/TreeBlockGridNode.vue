<script setup lang="ts">
import type { AtomType, Block, BlockGrid } from '@/types/block'
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
  block: Block
  grid: BlockGrid
  index: number
  topLevel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  topLevel: false,
})

const {
  selectGrid,
  selectItem,
  selectAtom,
  selectedBlockId,
  selectedGridId,
  selectedItemId,
  selectedAtomId,
  addItemToGrid,
  removeGridFromBlock,
  removeItemFromGrid,
  addAtomToItem,
  addGridToItem,
  removeAtomFromItem,
} = useComponentsStore()

const isOpen = ref(true)
const itemPopoverId = ref<string | null>(null)

const canRemoveGrid = computed(() => {
  if (!props.topLevel)
    return true

  return props.block.grids.length > 1
})

function hasGridInTree(grid: BlockGrid, gridId: string): boolean {
  if (grid.id === gridId)
    return true

  return grid.items.some(item => item.grids.some(nested => hasGridInTree(nested, gridId)))
}

function hasItemInTree(grid: BlockGrid, itemId: string): boolean {
  return grid.items.some((item) => {
    if (item.id === itemId)
      return true

    return item.grids.some(nested => hasItemInTree(nested, itemId))
  })
}

function hasAtomInTree(grid: BlockGrid, atomId: string): boolean {
  return grid.items.some((item) => {
    if (item.atoms.some(atom => atom.id === atomId))
      return true

    return item.grids.some(nested => hasAtomInTree(nested, atomId))
  })
}

const shouldExpand = computed(() => {
  if (selectedBlockId.value !== props.block.id)
    return false

  if (selectedGridId.value && hasGridInTree(props.grid, selectedGridId.value))
    return true

  if (selectedItemId.value && hasItemInTree(props.grid, selectedItemId.value))
    return true

  if (selectedAtomId.value && hasAtomInTree(props.grid, selectedAtomId.value))
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

function addFromItemPopover(gridId: string, itemId: string, type: AtomType | 'grid') {
  if (type === 'grid')
    addGridToItem(props.block.id, gridId, itemId)
  else addAtomToItem(props.block.id, gridId, itemId, type)

  itemPopoverId.value = null
}
</script>

<template>
  <div :class="topLevel ? 'pl-1' : 'pl-2'">
    <div
      :data-tree-id="`grid:${grid.id}`"
      class="flex items-center justify-between gap-2 px-2 py-1 text-xs text-muted-foreground"
      :class="{
        'text-foreground!': selectedGridId === grid.id && selectedBlockId === block.id,
      }"
      @click="selectGrid(block.id, grid.id, { syncTree: false })"
    >
      <div class="flex min-w-0 flex-1 items-center gap-1">
        <ChevronDown
          class="size-3.5 transition-transform"
          :class="{ '-rotate-90': !isOpen }"
          @click.stop="isOpen = !isOpen"
        />
        <Grid2x2 class="size-3.5 shrink-0" />
        <span class="truncate cursor-pointer hover:text-foreground">Grid {{ index + 1 }}</span>
      </div>

      <ButtonGroup>
        <Button
          variant="outline"
          size="icon-xs"
          aria-label="Add Item"
          @click.stop="addItemToGrid(block.id, grid.id)"
        >
          <Plus class="size-3" />
        </Button>
        <Button
          v-if="canRemoveGrid"
          variant="outline"
          size="icon-xs"
          aria-label="Remove Grid"
          @click.stop="removeGridFromBlock(block.id, grid.id)"
        >
          <Trash2 class="size-3 text-destructive" />
        </Button>
      </ButtonGroup>
    </div>

    <div v-if="isOpen">
      <div
        v-for="(item, itemIndex) in grid.items"
        :key="item.id"
        class="pl-6"
      >
        <div
          :data-tree-id="`item:${item.id}`"
          class="flex items-center justify-between gap-2 px-2 py-1 text-xs text-muted-foreground"
          :class="{
            'text-foreground!': selectedItemId === item.id && selectedGridId === grid.id,
          }"
          @click="selectItem(block.id, grid.id, item.id, { syncTree: false })"
        >
          <div class="flex min-w-0 flex-1 items-center gap-1.5">
            <LayoutGrid class="size-3.5 shrink-0" />
            <span class="truncate cursor-pointer hover:text-foreground">Item {{ itemIndex + 1 }}</span>
          </div>

          <ButtonGroup>
            <Popover
              :open="itemPopoverId === item.id"
              @update:open="(open: boolean) => setItemPopover(item.id, open)"
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
                    @click="addFromItemPopover(grid.id, item.id, 'text')"
                  >
                    Text
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="justify-start"
                    @click="addFromItemPopover(grid.id, item.id, 'button')"
                  >
                    Button
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="justify-start"
                    @click="addFromItemPopover(grid.id, item.id, 'divider')"
                  >
                    Divider
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="justify-start"
                    @click="addFromItemPopover(grid.id, item.id, 'image')"
                  >
                    Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="justify-start"
                    @click="addFromItemPopover(grid.id, item.id, 'menu')"
                  >
                    Menu
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    class="justify-start"
                    @click="addFromItemPopover(grid.id, item.id, 'grid')"
                  >
                    Grid
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              v-if="grid.items.length > 1"
              variant="outline"
              size="icon-xs"
              aria-label="Remove Item"
              @click.stop="removeItemFromGrid(block.id, grid.id, item.id)"
            >
              <Trash2 class="size-3 text-destructive" />
            </Button>
          </ButtonGroup>
        </div>

        <div
          v-for="atom in item.atoms"
          :key="atom.id"
          class="pl-2"
        >
          <div
            :data-tree-id="`atom:${atom.id}`"
            class="flex items-center justify-between gap-2 px-2 py-1 text-xs text-muted-foreground"
            :class="{ 'text-foreground!': selectedAtomId === atom.id }"
            @click="selectAtom(block.id, grid.id, item.id, atom.id, { syncTree: false })"
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
              @click.stop="removeAtomFromItem(block.id, grid.id, item.id, atom.id)"
            >
              <Trash2 class="size-3 text-destructive" />
            </Button>
          </div>
        </div>

        <TreeBlockGridNode
          v-for="(nestedGrid, nestedGridIndex) in item.grids"
          :key="nestedGrid.id"
          :block="block"
          :grid="nestedGrid"
          :index="nestedGridIndex"
        />
      </div>
    </div>
  </div>
</template>
