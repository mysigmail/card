import type { Ref } from 'vue'
import type { InsertionPath, InsertionPoint, TreeInsertType } from './use-tree-helpers'
import type { SidebarTab } from '@/features/editor/model'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import {
  TREE_INSERTION_ACTIVATION_X,
  TREE_INSERTION_LINE_MIN_LEFT_PX,
  TREE_INSERTION_POINT_PRIORITY,
  TREE_INSERTION_RADIUS_PX,
  TREE_INSERTION_Y_TIE_THRESHOLD_PX,
  TREE_NODE_INDENT_PX,
} from './use-tree-helpers'

interface UseTreeInsertionOptions {
  rootRef: Ref<HTMLElement | undefined>
  sidebarActiveTab: Ref<SidebarTab>
}

export function useTreeInsertion(options: UseTreeInsertionOptions) {
  const insertionLineVisible = ref(false)
  const insertionLineTop = ref(0)
  const insertionLineLeft = ref(0)
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
      return ['cell']

    return ['text', 'button', 'divider', 'image', 'menu', 'social', 'row']
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
    const atomElements = Array.from(
      options.rootRef.value.querySelectorAll('[data-tree-id][data-type="atom"]'),
    )
    const blockScopeElements = Array.from(
      options.rootRef.value.querySelectorAll('[data-block-scope-id]'),
    )
    const blockScopeEndElements = Array.from(
      options.rootRef.value.querySelectorAll('[data-block-scope-end-index]'),
    )
    const rowScopeElements = Array.from(
      options.rootRef.value.querySelectorAll('[data-row-scope-id]'),
    )
    const cellScopeElements = Array.from(
      options.rootRef.value.querySelectorAll('[data-cell-scope-id]'),
    )

    atomElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.height === 0)
        return

      const left = rect.left - rootRect.left
      const blockId = el.getAttribute('data-block-id') || undefined
      const rowId = el.getAttribute('data-row-id') || undefined
      const cellId = el.getAttribute('data-cell-id') || undefined
      const index = Number.parseInt(el.getAttribute('data-index') || '0')

      points.push({
        top: rect.top - rootRect.top,
        left,
        path: {
          blockId,
          rowId,
          cellId,
          index,
          type: 'atom',
        },
      })

      points.push({
        top: rect.bottom - rootRect.top,
        left,
        path: {
          blockId,
          rowId,
          cellId,
          index: index + 1,
          type: 'atom',
        },
      })
    })

    blockScopeElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.height === 0)
        return

      const index = Number.parseInt(el.getAttribute('data-block-scope-index') || '0')

      points.push({
        top: rect.top - rootRect.top,
        left: 0,
        path: { index, type: 'block' },
      })
    })

    blockScopeEndElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      const index = Number.parseInt(el.getAttribute('data-block-scope-end-index') || '0')

      points.push({
        top: rect.top - rootRect.top,
        left: 0,
        path: { index: index + 1, type: 'block' },
      })
    })

    cellScopeElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.height === 0)
        return

      const left = rect.left - rootRect.left
      const blockId = el.getAttribute('data-cell-scope-block-id') || undefined
      const rowId = el.getAttribute('data-cell-scope-row-id') || undefined
      const index = Number.parseInt(el.getAttribute('data-cell-scope-index') || '0')
      const childCount = Number.parseInt(el.getAttribute('data-cell-scope-child-count') || '0')

      points.push(
        {
          top: rect.top - rootRect.top,
          left,
          path: { blockId, rowId, index, type: 'cell' },
        },
        {
          top: rect.bottom - rootRect.top,
          left,
          path: { blockId, rowId, index: index + 1, type: 'cell' },
        },
      )

      if (childCount === 0) {
        const cellId = el.getAttribute('data-cell-scope-id')?.replace('cell-scope:', '')
        points.push({
          top: rect.bottom - rootRect.top,
          left: left + TREE_NODE_INDENT_PX.level,
          path: {
            blockId,
            rowId,
            cellId,
            index: 0,
            type: 'atom',
          },
        })
      }
    })

    rowScopeElements.forEach((el) => {
      const rect = el.getBoundingClientRect()
      if (rect.height === 0)
        return

      const left = rect.left - rootRect.left
      const blockId = el.getAttribute('data-row-scope-block-id') || undefined
      const rowId = el.getAttribute('data-row-scope-row-id') || undefined
      const cellId = el.getAttribute('data-row-scope-cell-id') || undefined
      const index = Number.parseInt(el.getAttribute('data-row-scope-index') || '0')

      points.push(
        {
          top: rect.top - rootRect.top,
          left,
          path: {
            blockId,
            rowId,
            cellId,
            index,
            type: 'row',
          },
        },
        {
          top: rect.bottom - rootRect.top,
          left,
          path: {
            blockId,
            rowId,
            cellId,
            index: index + 1,
            type: 'row',
          },
        },
      )
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

    const uniqueCandidates = new Map<string, (typeof yConstrainedCandidates)[number]>()

    yConstrainedCandidates.forEach((candidate) => {
      const { blockId, rowId, cellId, index, type } = candidate.point.path
      uniqueCandidates.set(`${type}:${blockId}:${rowId}:${cellId}:${index}`, candidate)
    })

    const deduplicatedCandidates = Array.from(uniqueCandidates.values())
    const hasCandidateOnLeft = deduplicatedCandidates.some(item => !item.isRightOfCursor)
    const candidatePool = hasCandidateOnLeft
      ? deduplicatedCandidates.filter(item => !item.isRightOfCursor)
      : deduplicatedCandidates

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
    insertionLineLeft.value = Math.max(
      nearest.left,
      TREE_INSERTION_LINE_MIN_LEFT_PX[nearest.path.type],
    )
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
    insertionLineLeft,
    insertionLineVisible,
    isHoveringTree,
    resetInsertionState,
    setTreeHovering,
  }
}
