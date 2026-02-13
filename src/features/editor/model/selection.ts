import type { Ref } from 'vue'
import type { BlockSelectionLevel, CanvasBlockInstance, SidebarTab } from './types'
import type { Atom, BlockNode, CellNode, RowNode } from '@/entities/block'
import { computed, ref } from 'vue'

interface CreateSelectionModuleOptions {
  editableId: Ref<string | undefined>
  installed: Ref<CanvasBlockInstance[]>
}

function findRowInRows(rows: RowNode[], rowId: string): RowNode | undefined {
  for (const row of rows) {
    if (row.id === rowId)
      return row

    for (const cell of row.cells) {
      const nested = findRowInRows(cell.rows, rowId)
      if (nested)
        return nested
    }
  }

  return undefined
}

function findCanvasBlockInstance(
  installed: CanvasBlockInstance[],
  blockId: string,
): CanvasBlockInstance | undefined {
  return installed.find(i => i.version === 2 && i.block.id === blockId)
}

export function createSelectionModule(options: CreateSelectionModuleOptions) {
  const selectedBlockId = ref<string>()
  const selectedRowId = ref<string>()
  const selectedCellId = ref<string>()
  const selectedAtomId = ref<string>()
  const selectionLevel = ref<BlockSelectionLevel>()
  const sidebarActiveTab = ref<SidebarTab>('components')
  const treeScrollTarget = ref<string>()
  const treeScrollRequestId = ref(0)

  function resetBlockSelection() {
    selectedBlockId.value = undefined
    selectedRowId.value = undefined
    selectedCellId.value = undefined
    selectedAtomId.value = undefined
    selectionLevel.value = undefined
  }

  function resetSelection() {
    options.editableId.value = undefined
    resetBlockSelection()
  }

  function requestTreeScroll(target: string) {
    treeScrollTarget.value = target
    treeScrollRequestId.value += 1
  }

  function openTreeAndScroll(target: string) {
    sidebarActiveTab.value = 'tree'
    requestTreeScroll(target)
  }

  function selectBlock(blockId: string, selectOptions?: { syncTree?: boolean }) {
    const block = findCanvasBlockInstance(options.installed.value, blockId)
    if (!block)
      return

    options.editableId.value = block.id

    selectedBlockId.value = blockId
    selectedRowId.value = undefined
    selectedCellId.value = undefined
    selectedAtomId.value = undefined
    selectionLevel.value = 'block'

    if (selectOptions?.syncTree !== false)
      openTreeAndScroll(`block:${blockId}`)
  }

  function selectRow(blockId: string, rowId: string, selectOptions?: { syncTree?: boolean }) {
    selectBlock(blockId, { syncTree: false })
    selectedRowId.value = rowId
    selectedCellId.value = undefined
    selectedAtomId.value = undefined
    selectionLevel.value = 'row'

    if (selectOptions?.syncTree !== false)
      openTreeAndScroll(`row:${rowId}`)
  }

  function selectCell(
    blockId: string,
    rowId: string,
    cellId: string,
    selectOptions?: { syncTree?: boolean },
  ) {
    selectRow(blockId, rowId, { syncTree: false })
    selectedCellId.value = cellId
    selectedAtomId.value = undefined
    selectionLevel.value = 'cell'

    if (selectOptions?.syncTree !== false)
      openTreeAndScroll(`cell:${cellId}`)
  }

  function selectAtom(
    blockId: string,
    rowId: string,
    cellId: string,
    atomId: string,
    selectOptions?: { syncTree?: boolean },
  ) {
    selectCell(blockId, rowId, cellId, { syncTree: false })
    selectedAtomId.value = atomId
    selectionLevel.value = 'atom'

    if (selectOptions?.syncTree !== false)
      openTreeAndScroll(`atom:${atomId}`)
  }

  const selectedBlock = computed((): BlockNode | undefined => {
    if (!selectedBlockId.value)
      return undefined

    return findCanvasBlockInstance(options.installed.value, selectedBlockId.value)?.block
  })

  const selectedRow = computed((): RowNode | undefined => {
    if (!selectedBlock.value || !selectedRowId.value)
      return undefined

    return findRowInRows(selectedBlock.value.rows, selectedRowId.value)
  })

  const selectedCell = computed((): CellNode | undefined => {
    if (!selectedRow.value || !selectedCellId.value)
      return undefined

    return selectedRow.value.cells.find(i => i.id === selectedCellId.value)
  })

  const selectedAtom = computed((): Atom | undefined => {
    if (!selectedCell.value || !selectedAtomId.value)
      return undefined

    return selectedCell.value.atoms.find(atom => atom.id === selectedAtomId.value)
  })

  return {
    selectedBlockId,
    selectedRowId,
    selectedCellId,
    selectedAtomId,
    selectionLevel,
    sidebarActiveTab,
    treeScrollTarget,
    treeScrollRequestId,
    resetSelection,
    requestTreeScroll,
    selectBlock,
    selectRow,
    selectCell,
    selectAtom,
    selectedBlock,
    selectedRow,
    selectedCell,
    selectedAtom,
  }
}
