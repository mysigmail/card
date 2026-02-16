import type { Ref } from 'vue'
import type { InsertionPath, InsertionPoint, TreeInsertType } from './use-tree-helpers'
import type { CanvasBlockInstance, SidebarTab } from '@/features/editor/model'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  TREE_ATOM_SIBLING_CELL_X_OFFSET_PX,
  TREE_EMPTY_CELL_ATOM_X_OFFSET_PX,
  TREE_INSERTION_ACTIVATION_X,
  TREE_INSERTION_POINT_PRIORITY,
  TREE_INSERTION_RADIUS_PX,
  TREE_INSERTION_Y_TIE_THRESHOLD_PX,
} from './use-tree-helpers'

interface UseTreeInsertionOptions {
  rootRef: Ref<HTMLElement | undefined>
  installed: Ref<CanvasBlockInstance[]>
  sidebarActiveTab: Ref<SidebarTab>
}

export function useTreeInsertion(options: UseTreeInsertionOptions) {
  const insertionLineVisible = ref(false)
  const insertionLineTop = ref(0)
  const isHoveringTree = ref(false)
  const activeInsertionPoint = ref<InsertionPoint | null>(null)
  const isMenuOpen = ref(false)

  const allowedTypes = computed<Array<TreeInsertType>>(() => {
    if (!activeInsertionPoint.value)
      return []

    const { type } = activeInsertionPoint.value.path

    if (type === 'block')
      return ['block']

    if (type === 'row')
      return ['row']

    if (type === 'cell')
      return ['cell', 'row']

    return ['text', 'button', 'divider', 'image', 'menu', 'row']
  })

  function setTreeHovering(value: boolean) {
    isHoveringTree.value = value

    if (!value && !isMenuOpen.value)
      insertionLineVisible.value = false
  }

  function handleOpenChange(open: boolean) {
    isMenuOpen.value = open

    if (!open && !isHoveringTree.value)
      insertionLineVisible.value = false
  }

  function resetInsertionState() {
    insertionLineVisible.value = false
    isMenuOpen.value = false
  }

  function getInsertionPoints(): InsertionPoint[] {
    if (!options.rootRef.value)
      return []

    const points: InsertionPoint[] = []
    const rootRect = options.rootRef.value.getBoundingClientRect()
    const treeElements = Array.from(options.rootRef.value.querySelectorAll('[data-tree-id]'))
    const rowScopeElements = Array.from(
      options.rootRef.value.querySelectorAll('[data-row-scope-id]'),
    )
    const blockIndexById = new Map<string, number>()

    options.installed.value.forEach((item, index) => {
      blockIndexById.set(item.block.id, index)
    })

    if (treeElements.length === 0)
      return points

    treeElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const left = rect.left - rootRect.left
      const type = el.getAttribute('data-type') as InsertionPath['type']
      const blockId = el.getAttribute('data-block-id') || undefined
      const rowId = el.getAttribute('data-row-id') || undefined
      const cellId = el.getAttribute('data-cell-id') || undefined
      const index = Number.parseInt(el.getAttribute('data-index') || '0')
      const atomCount = Number.parseInt(el.getAttribute('data-atom-count') || '0')
      const parentCellIndex = Number.parseInt(el.getAttribute('data-parent-cell-index') || '-1')

      points.push({
        top: rect.top - rootRect.top,
        left,
        path: {
          blockId: type === 'block' ? undefined : blockId,
          rowId,
          cellId: type === 'cell' ? undefined : cellId,
          index,
          type,
        },
      })

      points.push({
        top: rect.bottom - rootRect.top,
        left,
        path: {
          blockId: type === 'block' ? undefined : blockId,
          rowId,
          cellId: type === 'cell' ? undefined : cellId,
          index: index + 1,
          type,
        },
      })

      if (type !== 'block' && blockId) {
        const blockIndex = blockIndexById.get(blockId)
        if (blockIndex !== undefined) {
          points.push({
            top: rect.bottom - rootRect.top,
            left: 0,
            path: {
              index: blockIndex + 1,
              type: 'block',
            },
          })
        }
      }

      if (type === 'cell' && blockId && rowId && cellId && atomCount === 0) {
        points.push({
          top: rect.bottom - rootRect.top,
          left: left + TREE_EMPTY_CELL_ATOM_X_OFFSET_PX,
          path: {
            blockId,
            rowId,
            cellId,
            index: 0,
            type: 'atom',
          },
        })
      }

      if (type === 'atom' && blockId && rowId && parentCellIndex >= 0) {
        points.push({
          top: rect.bottom - rootRect.top,
          left: Math.max(0, left - TREE_ATOM_SIBLING_CELL_X_OFFSET_PX),
          path: {
            blockId,
            rowId,
            index: parentCellIndex + 1,
            type: 'cell',
          },
        })
      }
    })

    rowScopeElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const left = rect.left - rootRect.left
      const blockId = el.getAttribute('data-row-scope-block-id') || undefined
      const rowId = el.getAttribute('data-row-scope-row-id') || undefined
      const cellId = el.getAttribute('data-row-scope-cell-id') || undefined
      const index = Number.parseInt(el.getAttribute('data-row-scope-index') || '0')

      points.push({
        top: rect.bottom - rootRect.top,
        left,
        path: {
          blockId,
          rowId,
          cellId,
          index: index + 1,
          type: 'row',
        },
      })
    })

    return points
  }

  function getNearestInsertionPoint(
    points: InsertionPoint[],
    mouseX: number,
    mouseY: number,
  ): InsertionPoint | null {
    const candidates = points
      .map(point => ({
        point,
        yDistance: Math.abs(point.top - mouseY),
        xDistance: Math.abs(point.left - mouseX),
        isRightOfCursor: point.left > mouseX,
      }))
      .filter(item => item.yDistance <= TREE_INSERTION_RADIUS_PX)

    if (candidates.length === 0)
      return null

    const minYDistance = Math.min(...candidates.map(item => item.yDistance))

    const yConstrainedCandidates = candidates.filter(
      item => item.yDistance <= minYDistance + TREE_INSERTION_Y_TIE_THRESHOLD_PX,
    )

    const hasCandidateOnLeft = yConstrainedCandidates.some(item => !item.isRightOfCursor)
    const candidatePool = hasCandidateOnLeft
      ? yConstrainedCandidates.filter(item => !item.isRightOfCursor)
      : yConstrainedCandidates

    const preferredTypeOrder: Array<InsertionPath['type']>
      = mouseX <= TREE_INSERTION_ACTIVATION_X.block
        ? ['block', 'row', 'cell', 'atom']
        : mouseX <= TREE_INSERTION_ACTIVATION_X.row
          ? ['row', 'cell', 'atom', 'block']
          : mouseX <= TREE_INSERTION_ACTIVATION_X.cell
            ? ['cell', 'atom', 'row', 'block']
            : ['atom', 'cell', 'row', 'block']

    for (const type of preferredTypeOrder) {
      const typedCandidates = candidatePool.filter(item => item.point.path.type === type)
      if (typedCandidates.length === 0)
        continue

      typedCandidates.sort((a, b) => {
        if (a.xDistance !== b.xDistance)
          return a.xDistance - b.xDistance

        if (a.yDistance !== b.yDistance)
          return a.yDistance - b.yDistance

        return (
          TREE_INSERTION_POINT_PRIORITY[b.point.path.type]
          - TREE_INSERTION_POINT_PRIORITY[a.point.path.type]
        )
      })

      return typedCandidates[0].point
    }

    return null
  }

  function handleMouseMove(e: MouseEvent) {
    if (isMenuOpen.value)
      return

    if (
      options.sidebarActiveTab.value !== 'tree'
      || !options.rootRef.value
      || !isHoveringTree.value
    ) {
      insertionLineVisible.value = false
      return
    }

    const rootRect = options.rootRef.value.getBoundingClientRect()
    const mouseY = e.clientY - rootRect.top
    const mouseX = e.clientX - rootRect.left

    if (mouseX < 0 || mouseX > rootRect.width) {
      insertionLineVisible.value = false
      return
    }

    const points = getInsertionPoints()
    if (points.length === 0) {
      insertionLineVisible.value = false
      return
    }

    const nearest = getNearestInsertionPoint(points, mouseX, mouseY)

    if (!nearest) {
      insertionLineVisible.value = false
      return
    }

    activeInsertionPoint.value = nearest
    insertionLineTop.value = nearest.top
    insertionLineVisible.value = true
  }

  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
  })

  return {
    activeInsertionPoint,
    allowedTypes,
    handleOpenChange,
    insertionLineTop,
    insertionLineVisible,
    isHoveringTree,
    resetInsertionState,
    setTreeHovering,
  }
}
