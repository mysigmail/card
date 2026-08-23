import type { NodePropertyCommand, NodeRef, PropertyMapForRef } from './inspector-types'
import type { BlockPreset, CanvasBlockInstance } from './types'
import type { Atom, AtomType, CellNode, RowNode } from '@/entities/block'
import { nanoid } from 'nanoid'
import { computed } from 'vue'
import {
  createAtom,
  createBlockNode,
  createCellNode,
  createRowNode,
  createSocialRow,
  createTextMenuRow,
} from '@/entities/block'
import { clone } from '@/shared/lib/clone'
import { findCanvasBlockInstance, findCellById, findRowById } from './lib/canvas-state-utils'
import {
  findRowContainerInRows,
  findRowInRows,
  isCanvasBlockInstance,
  regenerateAtomId,
  regenerateBlockNodeIds,
  regenerateCellNodeIds,
  regenerateRowNodeIds,
} from './lib/canvas-tree-utils'

import {
  getNodePropertyState as getPropertyState,
  updateNodeProperties as updateProperties,
  updateNodeProperty as updateProperty,
} from './node-property-command'
import {
  editableId,
  general,
  installed,
  isDragging,
  library,
  previewMode,
  templateImportIssues,
} from './state'
import { useSelection } from './use-selection'

let _instance: ReturnType<typeof _createCanvas> | null = null

function _createCanvas() {
  const selection = useSelection()
  function updateNodeProperty(command: NodePropertyCommand) {
    return updateProperty(installed.value, command)
  }

  function updateNodeProperties(commands: readonly NodePropertyCommand[]) {
    return updateProperties(installed.value, commands)
  }

  function getNodePropertyState<R extends NodeRef, K extends keyof PropertyMapForRef<R>>(
    ref: R,
    property: K,
  ) {
    return getPropertyState(installed.value, ref, property)
  }

  function addNewToolToMultiTool(id: string) {
    void id
  }

  function deleteMultiToolItem(id: string, index: number) {
    void id
    void index
  }

  const editableIndex = computed(() => {
    if (!installed.value.length)
      return -1

    return installed.value.findIndex(i => i.id === editableId.value)
  })

  function addComponent(component: BlockPreset, index?: number) {
    const clonedBlock = clone(component.block)
    regenerateBlockNodeIds(clonedBlock)

    const cloned: CanvasBlockInstance = {
      id: nanoid(8),
      version: 1,
      block: clonedBlock,
    }

    if (index !== undefined)
      installed.value.splice(index, 0, cloned)
    else installed.value.push(cloned)
  }

  function insertBlockToCanvas(label?: string, index?: number) {
    const block = createBlockNode(label)
    const blockComponent: CanvasBlockInstance = {
      id: nanoid(8),
      version: 1,
      block,
    }

    if (index !== undefined)
      installed.value.splice(index, 0, blockComponent)
    else installed.value.push(blockComponent)

    return blockComponent
  }

  function renameBlock(blockId: string, label: string) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const nextLabel = label.trim()
    if (!nextLabel)
      return

    blockComponent.block.label = nextLabel

    return blockComponent.block
  }

  function insertRowToBlock(blockId: string, insertIndex?: number) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const row = createRowNode()
    if (insertIndex !== undefined)
      blockComponent.block.rows.splice(insertIndex, 0, row)
    else blockComponent.block.rows.push(row)

    return row
  }

  function removeRow(blockId: string, rowId: string) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const target = findRowContainerInRows(blockComponent.block.rows, rowId, true)
    if (!target)
      return

    if (target.isTopLevel && target.container.length <= 1)
      return

    target.container.splice(target.index, 1)
    if (selection.selectedRowId.value === rowId)
      selection.selectBlock(blockId)
  }

  function duplicateRow(blockId: string, rowId: string) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const target = findRowContainerInRows(blockComponent.block.rows, rowId, true)
    if (!target)
      return

    const sourceRow = target.container[target.index]
    if (!sourceRow)
      return

    const clonedRow = clone<RowNode>(sourceRow)
    regenerateRowNodeIds(clonedRow)
    target.container.splice(target.index + 1, 0, clonedRow)

    return clonedRow
  }

  function insertRowToCell(blockId: string, rowId: string, cellId: string, insertIndex?: number) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const parentRow = findRowInRows(blockComponent.block.rows, rowId)
    if (!parentRow)
      return

    const cell = parentRow.cells.find(i => i.id === cellId)
    if (!cell)
      return

    const nestedRow = createRowNode()
    if (insertIndex !== undefined)
      cell.children.splice(insertIndex, 0, nestedRow)
    else cell.children.push(nestedRow)

    return nestedRow
  }

  function insertRecipeToCell(
    blockId: string,
    rowId: string,
    cellId: string,
    recipe: RowNode,
    insertIndex?: number,
  ) {
    const blockComponent = findCanvasBlockInstance(blockId)
    const parentRow = blockComponent && findRowInRows(blockComponent.block.rows, rowId)
    const cell = parentRow?.cells.find(item => item.id === cellId)
    if (!cell)
      return

    if (insertIndex !== undefined)
      cell.children.splice(insertIndex, 0, recipe)
    else cell.children.push(recipe)
    return recipe
  }

  function insertMenuToCell(blockId: string, rowId: string, cellId: string, insertIndex?: number) {
    return insertRecipeToCell(blockId, rowId, cellId, createTextMenuRow(), insertIndex)
  }

  function insertSocialToCell(
    blockId: string,
    rowId: string,
    cellId: string,
    insertIndex?: number,
  ) {
    return insertRecipeToCell(blockId, rowId, cellId, createSocialRow(), insertIndex)
  }

  function insertCellToRow(blockId: string, rowId: string, insertIndex?: number) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const row = findRowInRows(blockComponent.block.rows, rowId)
    if (!row)
      return

    const cell = createCellNode()
    if (insertIndex !== undefined)
      row.cells.splice(insertIndex, 0, cell)
    else row.cells.push(cell)

    return cell
  }

  function removeCell(blockId: string, rowId: string, cellId: string) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const row = findRowInRows(blockComponent.block.rows, rowId)
    if (!row || row.cells.length <= 1)
      return

    const cellIndex = row.cells.findIndex(i => i.id === cellId)
    if (cellIndex !== -1) {
      row.cells.splice(cellIndex, 1)
      if (selection.selectedCellId.value === cellId)
        selection.selectRow(blockId, rowId)
    }
  }

  function duplicateCell(blockId: string, rowId: string, cellId: string) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const row = findRowInRows(blockComponent.block.rows, rowId)
    if (!row)
      return

    const cellIndex = row.cells.findIndex(i => i.id === cellId)
    if (cellIndex === -1)
      return

    const sourceCell = row.cells[cellIndex]
    if (!sourceCell)
      return

    const clonedCell = clone<CellNode>(sourceCell)
    regenerateCellNodeIds(clonedCell)
    row.cells.splice(cellIndex + 1, 0, clonedCell)

    return clonedCell
  }

  function insertAtomToCell(
    blockId: string,
    rowId: string,
    cellId: string,
    atomType: AtomType,
    insertIndex?: number,
  ) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const row = findRowInRows(blockComponent.block.rows, rowId)
    if (!row)
      return

    const cell = row.cells.find(i => i.id === cellId)
    if (!cell)
      return

    const atom = createAtom(atomType)
    if (insertIndex !== undefined)
      cell.children.splice(insertIndex, 0, atom)
    else cell.children.push(atom)

    return atom
  }

  function removeAtom(blockId: string, rowId: string, cellId: string, atomId: string) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const row = findRowInRows(blockComponent.block.rows, rowId)
    if (!row)
      return

    const cell = row.cells.find(i => i.id === cellId)
    if (!cell)
      return

    const atomIndex = cell.children.findIndex(
      child => child.type !== 'row' && child.id === atomId,
    )
    if (atomIndex !== -1) {
      cell.children.splice(atomIndex, 1)
      if (selection.selectedAtomId.value === atomId)
        selection.selectCell(blockId, rowId, cellId)
    }
  }

  function duplicateAtom(blockId: string, rowId: string, cellId: string, atomId: string) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const row = findRowInRows(blockComponent.block.rows, rowId)
    if (!row)
      return

    const cell = row.cells.find(i => i.id === cellId)
    if (!cell)
      return

    const atomIndex = cell.children.findIndex(
      child => child.type !== 'row' && child.id === atomId,
    )
    if (atomIndex === -1)
      return

    const sourceAtom = cell.children[atomIndex]
    if (!sourceAtom || sourceAtom.type === 'row')
      return

    const clonedAtom = clone<Atom>(sourceAtom)
    regenerateAtomId(clonedAtom)
    cell.children.splice(atomIndex + 1, 0, clonedAtom)

    return clonedAtom
  }

  function moveCell(blockId: string, rowId: string, oldIndex: number, newIndex: number) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const row = findRowInRows(blockComponent.block.rows, rowId)
    if (!row)
      return

    const { cells } = row
    if (
      oldIndex === newIndex
      || oldIndex < 0
      || newIndex < 0
      || oldIndex >= cells.length
      || newIndex >= cells.length
    ) {
      return
    }

    const [cell] = cells.splice(oldIndex, 1)
    if (!cell)
      return

    cells.splice(newIndex, 0, cell)
  }

  function moveAtom(
    blockId: string,
    rowId: string,
    cellId: string,
    oldIndex: number,
    newIndex: number,
  ) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const row = findRowInRows(blockComponent.block.rows, rowId)
    if (!row)
      return

    const cell = row.cells.find(i => i.id === cellId)
    if (!cell)
      return

    const atoms = cell.children
    if (
      oldIndex === newIndex
      || oldIndex < 0
      || newIndex < 0
      || oldIndex >= atoms.length
      || newIndex >= atoms.length
    ) {
      return
    }

    const [atom] = atoms.splice(oldIndex, 1)
    if (!atom)
      return

    atoms.splice(newIndex, 0, atom)
  }

  const moveCellChild = moveAtom

  function moveRow(blockId: string, oldIndex: number, newIndex: number) {
    const blockComponent = findCanvasBlockInstance(blockId)
    if (!blockComponent)
      return

    const { rows } = blockComponent.block
    if (
      oldIndex === newIndex
      || oldIndex < 0
      || newIndex < 0
      || oldIndex >= rows.length
      || newIndex >= rows.length
    ) {
      return
    }

    const [row] = rows.splice(oldIndex, 1)
    if (!row)
      return

    rows.splice(newIndex, 0, row)
  }

  function duplicateComponent(installedIndex: number) {
    const canvasBlock = installed.value[installedIndex]
    if (!canvasBlock || !isCanvasBlockInstance(canvasBlock))
      return

    const clonedBlock = clone(canvasBlock.block)
    regenerateBlockNodeIds(clonedBlock)

    const cloned: CanvasBlockInstance = {
      id: nanoid(8),
      version: 1,
      block: clonedBlock,
    }

    installed.value.splice(installedIndex + 1, 0, cloned)
  }

  function duplicateComponentById(componentId: string) {
    const index = installed.value.findIndex(canvasBlock => canvasBlock.id === componentId)
    if (index === -1)
      return

    duplicateComponent(index)
  }

  function moveComponent(oldIndex: number, newIndex: number) {
    const component = installed.value[oldIndex]

    if (!component)
      return

    installed.value.splice(oldIndex, 1)
    installed.value.splice(newIndex, 0, component)
  }

  function removeComponent(index: number) {
    const removed = installed.value[index]

    if (!removed)
      return

    installed.value.splice(index, 1)

    if (editableId.value === removed.id)
      selection.resetSelection()
  }

  function removeComponentById(componentId: string) {
    const index = installed.value.findIndex(canvasBlock => canvasBlock.id === componentId)
    if (index === -1)
      return

    removeComponent(index)
  }

  function clearCanvas() {
    installed.value = []
    templateImportIssues.value = []
    selection.resetSelection()
  }

  return {
    library,
    installed,
    editableId,
    isDragging,
    previewMode,
    general,
    templateImportIssues,
    editableIndex,
    isCanvasBlockInstance,
    findCanvasBlockInstance,
    findRowById,
    findCellById,
    addComponent,
    addNewToolToMultiTool,
    deleteMultiToolItem,
    duplicateComponentById,
    insertBlockToCanvas,
    renameBlock,
    insertRowToBlock,
    insertRowToCell,
    insertMenuToCell,
    insertSocialToCell,
    removeRow,
    duplicateRow,
    insertCellToRow,
    removeCell,
    duplicateCell,
    insertAtomToCell,
    removeAtom,
    duplicateAtom,
    moveCell,
    moveAtom,
    moveCellChild,
    moveRow,
    moveComponent,
    clearCanvas,
    removeComponentById,
    updateNodeProperty,
    updateNodeProperties,
    getNodePropertyState,
  }
}

export function useCanvas() {
  if (!_instance)
    _instance = _createCanvas()

  return _instance
}
