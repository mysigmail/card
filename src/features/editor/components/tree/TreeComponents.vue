<script setup lang="ts">
import type { AtomType } from '@/entities/block'
import { Plus } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import TreeBlockNode from '@/features/editor/components/tree/TreeBlockNode.vue'
import TreeInsertLine from '@/features/editor/components/tree/TreeInsertLine.vue'
import { useCanvas, useSelection } from '@/features/editor/model'

const {
  installed,
  isCanvasBlockInstance,
  insertBlockToCanvas,
  insertRowToBlock,
  insertCellToRow,
  insertAtomToCell,
  insertRowToCell,
} = useCanvas()

const {
  sidebarActiveTab,
  treeScrollTarget,
  treeScrollRequestId,
  selectBlock,
  selectRow,
  selectCell,
  selectAtom,
} = useSelection()

const rootRef = ref<HTMLElement>()
const insertionLineVisible = ref(false)
const insertionLineTop = ref(0)
const isHoveringTree = ref(false)

interface InsertionPath {
  blockId?: string
  rowId?: string
  cellId?: string
  index: number
  type: 'block' | 'row' | 'cell' | 'atom'
}

interface InsertionPoint {
  top: number
  left: number
  path: InsertionPath
}

const activeInsertionPoint = ref<InsertionPoint | null>(null)
const isMenuOpen = ref(false)
const insertionPointPriority = { atom: 4, cell: 3, row: 2, block: 1 } as const
const insertionPointRadius = 10
const yDistanceTieThreshold = 2
const emptyCellAtomXOffset = 16
const atomSiblingCellXOffset = 12
const blockInsertionActivationX = 14
const rowInsertionActivationX = 40
const cellInsertionActivationX = 72

const allowedTypes = computed<Array<AtomType | 'row' | 'cell' | 'block'>>(() => {
  if (!activeInsertionPoint.value)
    return []

  const { type } = activeInsertionPoint.value.path
  if (type === 'block')
    return ['block']
  if (type === 'row')
    return ['row']
  if (type === 'cell')
    return ['cell', 'row']
  if (type === 'atom')
    return ['text', 'button', 'divider', 'image', 'menu', 'row']

  return []
})

function handleSelect(type: AtomType | 'row' | 'cell' | 'block') {
  if (!activeInsertionPoint.value)
    return

  const { blockId, rowId, cellId, index, type: targetType } = activeInsertionPoint.value.path

  if (type === 'block') {
    const block = insertBlockToCanvas('Block', index)
    selectBlock(block.block.id)
  }
  else if (type === 'row') {
    if (targetType === 'row' && blockId) {
      if (cellId && rowId) {
        const row = insertRowToCell(blockId, rowId, cellId, index)
        if (row)
          selectRow(blockId, row.id)
      }
      else {
        const row = insertRowToBlock(blockId, index)
        if (row)
          selectRow(blockId, row.id)
      }
    }
    else if ((targetType === 'cell' || targetType === 'atom') && blockId && rowId && cellId) {
      const row = insertRowToCell(blockId, rowId, cellId, index)
      if (row)
        selectRow(blockId, row.id)
    }
  }
  else if (type === 'cell') {
    if (targetType === 'cell' && blockId && rowId) {
      const cell = insertCellToRow(blockId, rowId, index)
      if (cell)
        selectCell(blockId, rowId, cell.id)
    }
  }
  else if (blockId && rowId && cellId) {
    const atom = insertAtomToCell(blockId, rowId, cellId, type as AtomType, index)
    if (atom)
      selectAtom(blockId, rowId, cellId, atom.id)
  }

  insertionLineVisible.value = false
  isMenuOpen.value = false
}

function handleOpenChange(open: boolean) {
  isMenuOpen.value = open

  if (!open && !isHoveringTree.value) {
    insertionLineVisible.value = false
  }
}

function getInsertionPoints(): InsertionPoint[] {
  if (!rootRef.value)
    return []

  const points: InsertionPoint[] = []
  const rootRect = rootRef.value.getBoundingClientRect()
  const treeElements = Array.from(rootRef.value.querySelectorAll('[data-tree-id]'))
  const rowScopeElements = Array.from(rootRef.value.querySelectorAll('[data-row-scope-id]'))
  const blockIndexById = new Map<string, number>()

  installed.value.forEach((item, index) => {
    if (isCanvasBlockInstance(item))
      blockIndexById.set(item.block.id, index)
  })

  if (treeElements.length === 0)
    return points

  treeElements.forEach((el) => {
    const rect = el.getBoundingClientRect()
    const left = rect.left - rootRect.left
    const type = el.getAttribute('data-type') as 'block' | 'row' | 'cell' | 'atom'
    const blockId = el.getAttribute('data-block-id') || undefined
    const rowId = el.getAttribute('data-row-id') || undefined
    const cellId = el.getAttribute('data-cell-id') || undefined
    const index = Number.parseInt(el.getAttribute('data-index') || '0')
    const atomCount = Number.parseInt(el.getAttribute('data-atom-count') || '0')
    const parentCellIndex = Number.parseInt(el.getAttribute('data-parent-cell-index') || '-1')

    // Before each element
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

    // After each element
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

    // Allow adding a sibling block from deep/nested positions by moving to the far left.
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

    // Empty cells do not have atom nodes, so add an explicit atom insertion point.
    if (type === 'cell' && blockId && rowId && cellId && atomCount === 0) {
      points.push({
        top: rect.bottom - rootRect.top,
        left: left + emptyCellAtomXOffset,
        path: {
          blockId,
          rowId,
          cellId,
          index: 0,
          type: 'atom',
        },
      })
    }

    // Allow adding a sibling cell when cursor is under an atom node.
    if (type === 'atom' && blockId && rowId && parentCellIndex >= 0) {
      points.push({
        top: rect.bottom - rootRect.top,
        left: Math.max(0, left - atomSiblingCellXOffset),
        path: {
          blockId,
          rowId,
          index: parentCellIndex + 1,
          type: 'cell',
        },
      })
    }
  })

  // Add an explicit "after row subtree" insertion point so row insertion works
  // at the visual bottom of expanded rows (below last cell/item).
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
    .filter(item => item.yDistance <= insertionPointRadius)

  if (candidates.length === 0)
    return null

  const minYDistance = Math.min(...candidates.map(item => item.yDistance))

  const yConstrainedCandidates = candidates.filter(
    item => item.yDistance <= minYDistance + yDistanceTieThreshold,
  )
  const hasCandidateOnLeft = yConstrainedCandidates.some(item => !item.isRightOfCursor)
  const candidatePool = hasCandidateOnLeft
    ? yConstrainedCandidates.filter(item => !item.isRightOfCursor)
    : yConstrainedCandidates

  const preferredTypeOrder: Array<InsertionPath['type']>
    = mouseX <= blockInsertionActivationX
      ? ['block', 'row', 'cell', 'atom']
      : mouseX <= rowInsertionActivationX
        ? ['row', 'cell', 'atom', 'block']
        : mouseX <= cellInsertionActivationX
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

      return insertionPointPriority[b.point.path.type] - insertionPointPriority[a.point.path.type]
    })

    return typedCandidates[0].point
  }

  return null
}

function handleMouseMove(e: MouseEvent) {
  if (isMenuOpen.value)
    return

  if (sidebarActiveTab.value !== 'tree' || !rootRef.value || !isHoveringTree.value) {
    insertionLineVisible.value = false
    return
  }

  const rootRect = rootRef.value.getBoundingClientRect()
  const mouseY = e.clientY - rootRect.top
  const mouseX = e.clientX - rootRect.left

  // Only show if mouse is within the tree area horizontally
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

  if (nearest) {
    activeInsertionPoint.value = nearest
    insertionLineTop.value = nearest.top
    insertionLineVisible.value = true
  }
  else {
    insertionLineVisible.value = false
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
})

function scrollToSelectedNode() {
  if (!rootRef.value || !treeScrollTarget.value)
    return

  const target = rootRef.value.querySelector<HTMLElement>(
    `[data-tree-id="${treeScrollTarget.value}"]`,
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
  [treeScrollRequestId, () => sidebarActiveTab.value],
  async () => {
    if (sidebarActiveTab.value !== 'tree')
      return

    await nextTick()
    await nextTick()
    scrollToSelectedNode()
  },
  { flush: 'post', immediate: true },
)
</script>

<template>
  <div
    ref="rootRef"
    class="relative"
    @mouseenter="isHoveringTree = true"
    @mouseleave="isHoveringTree = false"
  >
    <div
      class="flex cursor-pointer items-center gap-2 border-b border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted"
      @click="insertBlockToCanvas('Block')"
    >
      <Plus class="size-4" />
      Add Block
    </div>

    <TreeInsertLine
      :visible="insertionLineVisible"
      :allowed-types="allowedTypes"
      :style="{ top: `${insertionLineTop}px` }"
      @select="handleSelect"
      @open-change="handleOpenChange"
    />

    <template
      v-for="(item, index) in installed"
      :key="item.id"
    >
      <TreeBlockNode
        v-if="isCanvasBlockInstance(item)"
        :id="item.id"
        :index="index"
        :block="item.block"
      />
    </template>
    <div
      v-if="!installed.length"
      class="p-6 text-center text-muted-foreground"
    >
      <p class="mt-1 text-xs">
        Add a new empty block or drag & drop from the catalog.
      </p>
    </div>
  </div>
</template>
