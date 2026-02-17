import type {
  BlockSelectionLevel,
  CanvasBlockInstance,
  EditorSelectionSnapshot,
  SidebarTab,
} from './types'
import type { Atom, BlockNode, CellNode, RowNode } from '@/entities/block'
import { computed, ref } from 'vue'
import { editableId, installed } from './state'

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
  items: CanvasBlockInstance[],
  blockId: string,
): CanvasBlockInstance | undefined {
  return items.find(i => i.version === 2 && i.block.id === blockId)
}

function hasCanvasInstanceById(items: CanvasBlockInstance[], id: string) {
  return items.some(item => item.id === id)
}

let _instance: ReturnType<typeof _createSelection> | null = null

function _createSelection() {
  const selectedBlockId = ref<string>()
  const selectedRowId = ref<string>()
  const selectedCellId = ref<string>()
  const selectedAtomId = ref<string>()
  const selectionLevel = ref<BlockSelectionLevel>()
  const sidebarActiveTab = ref<SidebarTab>('library')
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
    editableId.value = undefined
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
    const block = findCanvasBlockInstance(installed.value, blockId)
    if (!block)
      return

    editableId.value = block.id

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

  function captureSelectionSnapshot(): EditorSelectionSnapshot {
    return {
      editableId: editableId.value,
      selectedBlockId: selectedBlockId.value,
      selectedRowId: selectedRowId.value,
      selectedCellId: selectedCellId.value,
      selectedAtomId: selectedAtomId.value,
      selectionLevel: selectionLevel.value,
      sidebarActiveTab: sidebarActiveTab.value,
    }
  }

  function applySelectionSnapshot(
    snapshot?: EditorSelectionSnapshot,
    applyOptions?: { restoreSidebarTab?: boolean, openTreeWhenSelection?: boolean },
  ) {
    if (
      applyOptions?.restoreSidebarTab !== false
      && (snapshot?.sidebarActiveTab === 'library' || snapshot?.sidebarActiveTab === 'tree')
    ) {
      sidebarActiveTab.value = snapshot.sidebarActiveTab
    }

    const blockId = snapshot?.selectedBlockId
    if (!blockId) {
      resetSelection()
      return
    }

    const block = findCanvasBlockInstance(installed.value, blockId)
    if (!block) {
      resetSelection()
      return
    }

    editableId.value
      = snapshot?.editableId && hasCanvasInstanceById(installed.value, snapshot.editableId)
        ? snapshot.editableId
        : block.id
    selectedBlockId.value = blockId
    selectedRowId.value = undefined
    selectedCellId.value = undefined
    selectedAtomId.value = undefined
    selectionLevel.value = 'block'

    if (
      (snapshot?.selectionLevel === 'row'
        || snapshot?.selectionLevel === 'cell'
        || snapshot?.selectionLevel === 'atom')
      && snapshot.selectedRowId
    ) {
      const row = findRowInRows(block.block.rows, snapshot.selectedRowId)
      if (!row)
        return

      selectedRowId.value = row.id
      selectionLevel.value = 'row'
    }

    if (
      (snapshot?.selectionLevel === 'cell' || snapshot?.selectionLevel === 'atom')
      && selectedRowId.value
      && snapshot.selectedCellId
    ) {
      const row = findRowInRows(block.block.rows, selectedRowId.value)
      const cell = row?.cells.find(i => i.id === snapshot.selectedCellId)
      if (!cell)
        return

      selectedCellId.value = cell.id
      selectionLevel.value = 'cell'
    }

    if (
      snapshot?.selectionLevel === 'atom'
      && selectedRowId.value
      && selectedCellId.value
      && snapshot.selectedAtomId
    ) {
      const row = findRowInRows(block.block.rows, selectedRowId.value)
      const cell = row?.cells.find(i => i.id === selectedCellId.value)
      const atom = cell?.atoms.find(item => item.id === snapshot.selectedAtomId)
      if (!atom)
        return

      selectedAtomId.value = atom.id
      selectionLevel.value = 'atom'
    }

    if (applyOptions?.openTreeWhenSelection && selectedBlockId.value)
      sidebarActiveTab.value = 'tree'
  }

  const selectedBlock = computed((): BlockNode | undefined => {
    if (!selectedBlockId.value)
      return undefined

    return findCanvasBlockInstance(installed.value, selectedBlockId.value)?.block
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
    captureSelectionSnapshot,
    applySelectionSnapshot,
    selectedBlock,
    selectedRow,
    selectedCell,
    selectedAtom,
  }
}

export function useSelection() {
  if (!_instance)
    _instance = _createSelection()

  return _instance
}
