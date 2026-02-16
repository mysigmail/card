import type { BlockPreset, CanvasBlockInstance, GeneralTool, Tool } from './types'
import type { Atom, AtomType, BlockNode, CellNode, RowNode } from '@/entities/block'
import { nanoid } from 'nanoid'
import { computed } from 'vue'
import { createAtom, createBlockNode, createCellNode, createRowNode } from '@/entities/block'
import { clone } from '@/shared/lib/clone'
import {
  editableId,
  general,
  installed,
  isDragging,
  list,
  previewMode,
  templateImportIssues,
} from './state'
import {
  DEFAULT_MENU_ATOM_GAP,
  DEFAULT_MENU_IMAGE_ITEM,
  DEFAULT_MENU_TEXT_ITEM,
  getMenuAtomItemType,
  parseMenuListField,
  toBackgroundImageValue,
  toImageValue,
  toMenuImageItem,
  toMenuTextItem,
  toNonNegativeFiniteNumber,
  toOptionalPositiveNumber,
  toSpacingValue,
} from './tools'

import { useSelection } from './use-selection'

export function isCanvasBlockInstance(
  canvasBlock: CanvasBlockInstance,
): canvasBlock is CanvasBlockInstance {
  return canvasBlock.version === 2
}

export function findRowInRows(rows: RowNode[], rowId: string): RowNode | undefined {
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

function findRowContainerInRows(
  rows: RowNode[],
  rowId: string,
  isTopLevel = false,
): { container: RowNode[], index: number, isTopLevel: boolean } | undefined {
  for (const [index, row] of rows.entries()) {
    if (row.id === rowId) {
      return {
        container: rows,
        index,
        isTopLevel,
      }
    }

    for (const cell of row.cells) {
      const nested = findRowContainerInRows(cell.rows, rowId, false)
      if (nested)
        return nested
    }
  }

  return undefined
}

function findCellInRows(rows: RowNode[], cellId: string): CellNode | undefined {
  for (const row of rows) {
    const found = row.cells.find(i => i.id === cellId)
    if (found)
      return found

    for (const cell of row.cells) {
      const nested = findCellInRows(cell.rows, cellId)
      if (nested)
        return nested
    }
  }

  return undefined
}

function regenerateCellNodeIds(cell: CellNode) {
  cell.id = nanoid(8)
  cell.atoms.forEach((atom) => {
    regenerateAtomId(atom)
  })
  cell.rows.forEach((row) => {
    regenerateRowNodeIds(row)
  })
}

function regenerateAtomId(atom: Atom) {
  atom.id = nanoid(8)
}

function regenerateRowNodeIds(row: RowNode) {
  row.id = nanoid(8)
  row.cells.forEach((cell) => {
    regenerateCellNodeIds(cell)
  })
}

function regenerateBlockNodeIds(block: BlockNode) {
  block.id = nanoid(8)
  block.rows.forEach((row) => {
    regenerateRowNodeIds(row)
  })
}

let _instance: ReturnType<typeof _createCanvas> | null = null

function _createCanvas() {
  const selection = useSelection()

  const editableIndex = computed(() => {
    if (!installed.value.length)
      return -1

    return installed.value.findIndex(i => i.id === editableId.value)
  })

  function findCanvasBlockInstance(blockId: string): CanvasBlockInstance | undefined {
    return installed.value.find(
      (item): item is CanvasBlockInstance =>
        isCanvasBlockInstance(item) && item.block.id === blockId,
    )
  }

  function findRowById(rowId: string): RowNode | undefined {
    for (const canvasBlock of installed.value) {
      if (!isCanvasBlockInstance(canvasBlock))
        continue

      const row = findRowInRows(canvasBlock.block.rows, rowId)
      if (row)
        return row
    }

    return undefined
  }

  function findCellById(cellId: string): CellNode | undefined {
    for (const canvasBlock of installed.value) {
      if (!isCanvasBlockInstance(canvasBlock))
        continue

      const found = findCellInRows(canvasBlock.block.rows, cellId)
      if (found)
        return found
    }

    return undefined
  }

  function addComponent(component: BlockPreset, index?: number) {
    const clonedBlock = clone(component.block)
    regenerateBlockNodeIds(clonedBlock)

    const cloned: CanvasBlockInstance = {
      id: nanoid(8),
      version: 2,
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
      version: 2,
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
      cell.rows.splice(insertIndex, 0, nestedRow)
    else cell.rows.push(nestedRow)

    return nestedRow
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
      cell.atoms.splice(insertIndex, 0, atom)
    else cell.atoms.push(atom)

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

    const atomIndex = cell.atoms.findIndex(atom => atom.id === atomId)
    if (atomIndex !== -1) {
      cell.atoms.splice(atomIndex, 1)
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

    const atomIndex = cell.atoms.findIndex(atom => atom.id === atomId)
    if (atomIndex === -1)
      return

    const sourceAtom = cell.atoms[atomIndex]
    if (!sourceAtom)
      return

    const clonedAtom = clone<Atom>(sourceAtom)
    regenerateAtomId(clonedAtom)
    cell.atoms.splice(atomIndex + 1, 0, clonedAtom)

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

    const { atoms } = cell
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
      version: 2,
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

  function updateV2SettingsToolById(id: string, key: 'value' | 'label', value: unknown) {
    if (key !== 'value')
      return false

    const [scope, level, targetId, field] = id.split('::')
    if (scope !== 'v2-settings' || !level || !targetId || !field)
      return false

    if (level === 'block') {
      const block = findCanvasBlockInstance(targetId)?.block
      if (!block)
        return false

      if (field === 'spacing') {
        block.settings.spacing = toSpacingValue(value)
        return true
      }

      if (field === 'backgroundColor') {
        block.settings.backgroundColor = String(value ?? '')
        return true
      }

      if (field === 'backgroundImage') {
        block.settings.backgroundImage = toBackgroundImageValue(value)
        return true
      }

      return false
    }

    if (level === 'row') {
      const row = findRowById(targetId)
      if (!row)
        return false

      if (field === 'spacing') {
        row.settings.spacing = toSpacingValue(value)
        return true
      }

      if (field === 'backgroundColor') {
        row.settings.backgroundColor = String(value ?? '')
        return true
      }

      if (field === 'backgroundImage') {
        row.settings.backgroundImage = toBackgroundImageValue(value)
        return true
      }

      if (field === 'gap') {
        row.settings.gap = Number(value) || 0
        return true
      }

      if (field === 'hiddenOnMobile') {
        row.settings.hiddenOnMobile = Boolean(value)
        return true
      }

      if (field === 'collapseOnMobile') {
        row.settings.collapseOnMobile = Boolean(value)
        return true
      }

      if (field === 'height') {
        row.settings.height = toOptionalPositiveNumber(value)
        return true
      }

      return false
    }

    if (level === 'cell') {
      const cell = findCellById(targetId)
      if (!cell)
        return false

      if (field === 'spacing') {
        cell.settings.spacing = toSpacingValue(value)
        return true
      }

      if (field === 'backgroundColor') {
        cell.settings.backgroundColor = String(value ?? '')
        return true
      }

      if (field === 'backgroundImage') {
        cell.settings.backgroundImage = toBackgroundImageValue(value)
        return true
      }

      if (field === 'link') {
        const nextLink = String(value ?? '').trim()
        cell.settings.link = nextLink || undefined
        return true
      }

      if (field === 'hiddenOnMobile') {
        cell.settings.hiddenOnMobile = Boolean(value)
        return true
      }

      if (field === 'borderRadius') {
        cell.settings.borderRadius = toNonNegativeFiniteNumber(value)
        return true
      }

      return false
    }

    return false
  }

  function updateV2AtomToolById(id: string, key: 'value' | 'label', value: unknown) {
    if (key !== 'value')
      return false

    const atom = selection.selectedAtom.value
    if (!atom)
      return false

    const [scope, atomId, ...fieldParts] = id.split('::')
    const field = fieldParts.join('::')

    if (scope !== 'v2-atom' || atomId !== atom.id || !field)
      return false

    if (field === 'hiddenOnMobile') {
      atom.hiddenOnMobile = Boolean(value)
      return true
    }

    if (atom.type === 'text') {
      if (field === 'content') {
        atom.value = String(value ?? '')
        return true
      }

      if (field === 'color') {
        atom.color = String(value ?? '')
        return true
      }

      if (field === 'spacing') {
        atom.spacing = toSpacingValue(value)
        return true
      }

      return false
    }

    if (atom.type === 'button') {
      if (field === 'text') {
        atom.text = String(value ?? '')
        return true
      }

      if (field === 'link') {
        atom.link = String(value ?? '')
        return true
      }

      if (field === 'backgroundColor') {
        atom.backgroundColor = String(value ?? '')
        return true
      }

      if (field === 'color') {
        atom.color = String(value ?? '')
        return true
      }

      if (field === 'fontSize') {
        atom.fontSize = Number(value) || 14
        return true
      }

      if (field === 'borderRadius') {
        atom.borderRadius = Number(value) || 0
        return true
      }

      if (field === 'spacing' || field === 'padding') {
        const spacingValue = toSpacingValue(value)
        atom.spacing = spacingValue

        if (spacingValue.padding && spacingValue.padding.length === 4) {
          atom.padding = spacingValue.padding.map(i => Number(i) || 0) as [
            number,
            number,
            number,
            number,
          ]
        }
        return true
      }

      return false
    }

    if (atom.type === 'divider') {
      if (field === 'color') {
        atom.color = String(value ?? '')
        return true
      }

      if (field === 'height') {
        atom.height = Number(value) || 1
        return true
      }

      if (field === 'spacing') {
        atom.spacing = toSpacingValue(value)
        return true
      }

      return false
    }

    if (atom.type === 'image') {
      if (field === 'image') {
        const next = toImageValue(value)
        atom.src = next.src
        atom.alt = next.alt || ''
        atom.link = next.link || ''
        atom.width = next.width
        atom.height = next.height
        return true
      }

      if (field === 'borderRadius') {
        atom.borderRadius = toNonNegativeFiniteNumber(value)
        return true
      }

      if (field === 'spacing') {
        atom.spacing = toSpacingValue(value)
        return true
      }

      return false
    }

    if (atom.type === 'menu') {
      if (field === 'menuItemType') {
        const nextType = value === 'image' ? 'image' : 'text'
        atom.itemType = nextType

        atom.items = atom.items.map((item) => {
          return nextType === 'image' ? toMenuImageItem(item) : toMenuTextItem(item)
        })

        if (!atom.items.length) {
          atom.items.push(
            nextType === 'image' ? { ...DEFAULT_MENU_IMAGE_ITEM } : { ...DEFAULT_MENU_TEXT_ITEM },
          )
        }

        return true
      }

      if (field === 'gap') {
        atom.gap = toNonNegativeFiniteNumber(value) ?? DEFAULT_MENU_ATOM_GAP
        return true
      }

      if (field === 'spacing') {
        atom.spacing = toSpacingValue(value)
        return true
      }

      const parsed = parseMenuListField(field)
      if (!parsed)
        return false

      const item = atom.items[parsed.index]
      if (!item)
        return false

      const itemType = getMenuAtomItemType(atom)
      if (itemType === 'image') {
        const imageItem = item.type === 'image' ? item : toMenuImageItem(item)

        if (item.type !== 'image')
          atom.items[parsed.index] = imageItem

        if (parsed.itemField === 'name') {
          imageItem.name = String(value ?? '')
          return true
        }

        if (parsed.itemField === 'link') {
          imageItem.link = String(value ?? '')
          return true
        }

        if (parsed.itemField === 'url') {
          imageItem.url = String(value ?? '')
          return true
        }

        if (parsed.itemField === 'width') {
          imageItem.width = toOptionalPositiveNumber(value)
          return true
        }

        if (parsed.itemField === 'height') {
          imageItem.height = toOptionalPositiveNumber(value)
          return true
        }

        if (parsed.itemField === 'alt') {
          imageItem.alt = String(value ?? '')
          return true
        }

        return false
      }

      const textItem = item.type === 'text' ? item : toMenuTextItem(item)
      if (item.type !== 'text')
        atom.items[parsed.index] = textItem

      if (parsed.itemField === 'text') {
        textItem.text = String(value ?? '')
        return true
      }

      if (parsed.itemField === 'link') {
        textItem.link = String(value ?? '')
        return true
      }

      if (parsed.itemField === 'color') {
        textItem.color = String(value ?? '')
        return true
      }

      if (parsed.itemField === 'fontSize') {
        textItem.fontSize = Number(value) || 16
        return true
      }

      return true
    }

    return false
  }

  function updateToolById<T extends Tool>(id: string, key: 'value' | 'label', value: T['value']) {
    if (id === 'layoutPadding' && key === 'value') {
      general.padding = (value as { padding: GeneralTool['padding'] }).padding
      return
    }

    updateV2SettingsToolById(id, key, value)
    updateV2AtomToolById(id, key, value)
  }

  function addNewToolToMultiTool(id: string) {
    const [scope, atomId, field] = id.split('::')
    if (scope === 'v2-atom' && field === 'menuList') {
      const atom = selection.selectedAtom.value
      if (!atom || atom.id !== atomId || atom.type !== 'menu')
        return

      const itemType = getMenuAtomItemType(atom)
      const lastItem = atom.items[atom.items.length - 1]
      if (itemType === 'image') {
        atom.items.push(
          lastItem?.type === 'image' ? { ...lastItem } : { ...DEFAULT_MENU_IMAGE_ITEM },
        )
      }
      else {
        atom.items.push(lastItem?.type === 'text' ? { ...lastItem } : { ...DEFAULT_MENU_TEXT_ITEM })
      }
    }
  }

  function deleteMultiToolItem(id: string, index: number) {
    const [scope, atomId, field] = id.split('::')
    if (scope === 'v2-atom' && field === 'menuList') {
      const atom = selection.selectedAtom.value
      if (!atom || atom.id !== atomId || atom.type !== 'menu')
        return

      if (atom.items.length <= 1)
        return

      atom.items.splice(index, 1)
    }
  }

  return {
    list,
    installed,
    editableId,
    isDragging,
    previewMode,
    general,
    templateImportIssues,
    editableIndex,
    isCanvasBlockInstance,
    addComponent,
    addNewToolToMultiTool,
    deleteMultiToolItem,
    duplicateComponentById,
    insertBlockToCanvas,
    renameBlock,
    insertRowToBlock,
    insertRowToCell,
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
    moveRow,
    moveComponent,
    clearCanvas,
    removeComponentById,
    updateToolById,
  }
}

export function useCanvas() {
  if (!_instance)
    _instance = _createCanvas()

  return _instance
}
