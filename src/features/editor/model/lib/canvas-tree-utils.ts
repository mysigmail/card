import type { CanvasBlockInstance } from '../types'
import type { Atom, BlockNode, CellNode, RowNode } from '@/entities/block'
import { nanoid } from 'nanoid'

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

export function findRowContainerInRows(
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

export function findCellInRows(rows: RowNode[], cellId: string): CellNode | undefined {
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

export function regenerateCellNodeIds(cell: CellNode) {
  cell.id = nanoid(8)
  cell.atoms.forEach((atom) => {
    regenerateAtomId(atom)
  })
  cell.rows.forEach((row) => {
    regenerateRowNodeIds(row)
  })
}

export function regenerateAtomId(atom: Atom) {
  atom.id = nanoid(8)
}

export function regenerateRowNodeIds(row: RowNode) {
  row.id = nanoid(8)
  row.cells.forEach((cell) => {
    regenerateCellNodeIds(cell)
  })
}

export function regenerateBlockNodeIds(block: BlockNode) {
  block.id = nanoid(8)
  block.rows.forEach((row) => {
    regenerateRowNodeIds(row)
  })
}
