import type { CanvasBlockInstance } from '../types'
import type { CellNode, RowNode } from '@/entities/block'
import { installed } from '../state'
import { findCellInRows, findRowInRows, isCanvasBlockInstance } from './canvas-tree-utils'

export function findCanvasBlockInstance(blockId: string): CanvasBlockInstance | undefined {
  return installed.value.find(
    (item): item is CanvasBlockInstance => isCanvasBlockInstance(item) && item.block.id === blockId,
  )
}

export function findRowById(rowId: string): RowNode | undefined {
  for (const canvasBlock of installed.value) {
    if (!isCanvasBlockInstance(canvasBlock))
      continue

    const row = findRowInRows(canvasBlock.block.rows, rowId)
    if (row)
      return row
  }

  return undefined
}

export function findCellById(cellId: string): CellNode | undefined {
  for (const canvasBlock of installed.value) {
    if (!isCanvasBlockInstance(canvasBlock))
      continue

    const found = findCellInRows(canvasBlock.block.rows, cellId)
    if (found)
      return found
  }

  return undefined
}
