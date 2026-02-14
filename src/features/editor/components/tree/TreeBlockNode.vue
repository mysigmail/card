<script setup lang="ts">
import type { BlockNode } from '@/entities/block'
import type { ComponentType } from '@/entities/template'
import { ChevronDown, Copy, HardDriveDownload, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import TreeBlockRowNode from '@/features/editor/components/tree/TreeBlockRowNode.vue'
import { useCanvas, useSelection } from '@/features/editor/model'
import { saveBlockAsJson } from '@/features/email-preview/catalog/save-block'
import { Button } from '@/shared/ui/button'
import { ButtonGroup } from '@/shared/ui/button-group'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

interface Props {
  id: string
  block: BlockNode
  index: number
}

const props = defineProps<Props>()

const isDev = import.meta.env.DEV

const { removeComponentById, duplicateComponentById, insertRowToBlock, renameBlock } = useCanvas()

const { selectBlock, selectedBlockId, selectedRowId, selectedCellId, selectedAtomId }
  = useSelection()

const isOpen = ref(true)
const renamePopoverOpen = ref(false)
const renameValue = ref(props.block.label)

const saveBlockPopoverOpen = ref(false)
const blockTypes: Array<{ label: string, value: ComponentType }> = [
  { label: 'Menu', value: 'menu' },
  { label: 'Header', value: 'header' },
  { label: 'Content', value: 'content' },
  { label: 'Feature', value: 'feature' },
  { label: 'Call to Action', value: 'cta' },
  { label: 'E-Commerce', value: 'ecommerce' },
  { label: 'Footer', value: 'footer' },
]

const shouldExpand = computed(() => {
  if (selectedBlockId.value !== props.block.id)
    return false

  return Boolean(selectedRowId.value || selectedCellId.value || selectedAtomId.value)
})

watch(
  shouldExpand,
  (value) => {
    if (value)
      isOpen.value = true
  },
  { immediate: true },
)

watch(renamePopoverOpen, (open) => {
  if (open)
    renameValue.value = props.block.label
})

function onHeaderClick() {
  selectBlock(props.block.id, { syncTree: false })
}

function onClick(type: 'copy' | 'remove') {
  if (type === 'remove')
    removeComponentById(props.id)

  if (type === 'copy')
    duplicateComponentById(props.id)
}

function applyRename() {
  if (renameBlock(props.block.id, renameValue.value))
    renamePopoverOpen.value = false
}

function handleSaveBlock(type: ComponentType) {
  saveBlockAsJson(props.block, { type })
  saveBlockPopoverOpen.value = false
}
</script>

<template>
  <div
    class="relative select-none"
    :class="
      selectedBlockId === block.id
        ? `before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary before:content-['']`
        : ''
    "
  >
    <!-- Block header -->
    <div
      class="flex cursor-pointer items-center justify-between px-2 py-2.5"
      :data-tree-id="`block:${block.id}`"
      @click="onHeaderClick"
    >
      <div class="flex min-w-0 flex-1 items-center gap-1.5">
        <ChevronDown
          class="size-3.5 transition-transform"
          :class="{ '-rotate-90': !isOpen }"
          @click.stop="isOpen = !isOpen"
        />
        <span class="truncate text-sm font-medium">{{ block.label }}</span>
      </div>
      <div class="flex">
        <ButtonGroup>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Add Row"
            @click.stop="insertRowToBlock(block.id)"
          >
            <Plus class="size-3" />
          </Button>
          <Popover v-model:open="renamePopoverOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                size="icon-xs"
                aria-label="Rename"
                @click.stop
              >
                <Pencil class="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              class="w-56 p-2"
            >
              <div class="flex gap-2">
                <Input
                  v-model="renameValue"
                  size="sm"
                  placeholder="Block name"
                  @keydown.enter.prevent="applyRename"
                />
                <Button
                  size="sm"
                  :disabled="!renameValue.trim()"
                  @click="applyRename"
                >
                  Save
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Copy"
            @click.stop="onClick('copy')"
          >
            <Copy class="size-3" />
          </Button>
          <Popover
            v-if="isDev"
            v-model:open="saveBlockPopoverOpen"
          >
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                size="icon-xs"
                aria-label="Save as Block"
                @click.stop
              >
                <HardDriveDownload class="size-3" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              class="w-48 p-1"
            >
              <div class="flex flex-col">
                <Button
                  v-for="t in blockTypes"
                  :key="t.value"
                  variant="ghost"
                  size="sm"
                  class="justify-start px-2 font-normal"
                  @click="handleSaveBlock(t.value)"
                >
                  Save to {{ t.label }}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon-xs"
            aria-label="Remove"
            @click.stop="onClick('remove')"
          >
            <Trash2 class="size-3 text-destructive" />
          </Button>
        </ButtonGroup>
      </div>
    </div>

    <!-- Rows tree -->
    <div
      v-if="isOpen"
      class="pb-2"
    >
      <TreeBlockRowNode
        v-for="(row, rowIndex) in block.rows"
        :key="row.id"
        :block="block"
        :row="row"
        :index="rowIndex"
        top-level
      />
    </div>
  </div>
</template>
