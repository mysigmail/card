import type { Component, Ref } from 'vue'
import type { AtomType, RowNode } from '@/entities/block'
import type { ComponentType } from '@/entities/template'
import type { SidebarTab } from '@/features/editor/model'
import {
  Grid2x2,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Minus,
  MousePointerClick,
  Text,
} from 'lucide-vue-next'
import { nextTick, watch } from 'vue'

export type TreeInsertType = AtomType | 'row' | 'cell' | 'block'

export interface InsertionPath {
  blockId?: string
  rowId?: string
  cellId?: string
  index: number
  type: 'block' | 'row' | 'cell' | 'atom'
}

export interface InsertionPoint {
  top: number
  left: number
  path: InsertionPath
}

export const TREE_INSERTION_POINT_PRIORITY: Record<InsertionPath['type'], number> = {
  atom: 4,
  cell: 3,
  row: 2,
  block: 1,
}

export const TREE_INSERTION_RADIUS_PX = 6
export const TREE_INSERTION_Y_TIE_THRESHOLD_PX = 2
export const TREE_EMPTY_CELL_ATOM_X_OFFSET_PX = 16
export const TREE_ATOM_SIBLING_CELL_X_OFFSET_PX = 12

export const TREE_INSERTION_ACTIVATION_X = {
  block: 14,
  row: 40,
  cell: 72,
} as const

export const TREE_NODE_INDENT_PX = {
  topLevelRow: 4,
  nestedRow: 8,
  cell: 24,
  atom: 8,
} as const

export const TREE_BLOCK_TYPES: Array<{ label: string, value: ComponentType }> = [
  { label: 'Menu', value: 'menu' },
  { label: 'Header', value: 'header' },
  { label: 'Content', value: 'content' },
  { label: 'Feature', value: 'feature' },
  { label: 'Call to Action', value: 'cta' },
  { label: 'E-Commerce', value: 'ecommerce' },
  { label: 'Footer', value: 'footer' },
]

interface TreeInsertTypeMeta {
  label: string
  icon: Component
}

const treeInsertTypeMetaByType: Record<TreeInsertType, TreeInsertTypeMeta> = {
  block: { label: 'Block', icon: LayoutGrid },
  row: { label: 'Row', icon: Grid2x2 },
  cell: { label: 'Cell', icon: LayoutGrid },
  text: { label: 'Text', icon: Text },
  button: { label: 'Button', icon: MousePointerClick },
  image: { label: 'Image', icon: ImageIcon },
  menu: { label: 'Menu', icon: List },
  divider: { label: 'Divider', icon: Minus },
}

export function getTreeInsertTypeMeta(type: TreeInsertType): TreeInsertTypeMeta {
  return treeInsertTypeMetaByType[type]
}

export function getTreeAtomMeta(type: AtomType): TreeInsertTypeMeta {
  return treeInsertTypeMetaByType[type]
}

export function hasRowInTree(row: RowNode, rowId: string): boolean {
  if (row.id === rowId)
    return true

  return row.cells.some(cell => cell.rows.some(nested => hasRowInTree(nested, rowId)))
}

export function hasCellInTree(row: RowNode, cellId: string): boolean {
  return row.cells.some((cell) => {
    if (cell.id === cellId)
      return true

    return cell.rows.some(nested => hasCellInTree(nested, cellId))
  })
}

export function hasAtomInTree(row: RowNode, atomId: string): boolean {
  return row.cells.some((cell) => {
    if (cell.atoms.some(atom => atom.id === atomId))
      return true

    return cell.rows.some(nested => hasAtomInTree(nested, atomId))
  })
}

interface UseTreeScrollSyncOptions {
  rootRef: Ref<HTMLElement | undefined>
  sidebarActiveTab: Ref<SidebarTab>
  treeScrollTarget: Ref<string | undefined>
  treeScrollRequestId: Ref<number>
}

export function useTreeScrollSync(options: UseTreeScrollSyncOptions) {
  function scrollToSelectedNode() {
    if (!options.rootRef.value || !options.treeScrollTarget.value)
      return

    const target = options.rootRef.value.querySelector<HTMLElement>(
      `[data-tree-id="${options.treeScrollTarget.value}"]`,
    )

    if (!target)
      return

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  }

  watch(
    [options.treeScrollRequestId, () => options.sidebarActiveTab.value],
    async () => {
      if (options.sidebarActiveTab.value !== 'tree')
        return

      await nextTick()
      await nextTick()
      scrollToSelectedNode()
    },
    { flush: 'post', immediate: true },
  )
}
