import type { CanvasBlockInstance, EditorSelectionSnapshot, GeneralTool } from './types'
import { computed, ref, watch } from 'vue'
import { clone } from '@/shared/lib/clone'
import { editableId, general, installed } from './state'
import { useSelection } from './use-selection'

const HISTORY_MAX_ENTRIES = 100
const HISTORY_GROUP_DELAY_MS = 300

interface HistorySnapshot {
  installed: CanvasBlockInstance[]
  general: GeneralTool
  selection: EditorSelectionSnapshot
}

let _instance: ReturnType<typeof _createHistory> | null = null

function cloneSnapshot(snapshot: HistorySnapshot): HistorySnapshot {
  return clone(snapshot)
}

function isSnapshotEqual(left: HistorySnapshot, right: HistorySnapshot) {
  return (
    JSON.stringify(left.installed) === JSON.stringify(right.installed)
    && JSON.stringify(left.general) === JSON.stringify(right.general)
  )
}

function _createHistory() {
  const selection = useSelection()
  const undoStack = ref<HistorySnapshot[]>([])
  const redoStack = ref<HistorySnapshot[]>([])
  const isTrackingPaused = ref(false)
  const currentSnapshot = ref<HistorySnapshot>()
  const pendingBaseSnapshot = ref<HistorySnapshot>()
  let commitTimer: ReturnType<typeof setTimeout> | undefined

  function captureSnapshot(): HistorySnapshot {
    return {
      installed: clone(installed.value),
      general: clone(general),
      selection: clone(selection.captureSelectionSnapshot()),
    }
  }

  function syncCurrentSnapshot() {
    currentSnapshot.value = captureSnapshot()
  }

  function clearCommitTimer() {
    if (commitTimer === undefined)
      return

    clearTimeout(commitTimer)
    commitTimer = undefined
  }

  function pushUndo(snapshot: HistorySnapshot) {
    undoStack.value.push(cloneSnapshot(snapshot))

    if (undoStack.value.length > HISTORY_MAX_ENTRIES)
      undoStack.value.shift()
  }

  function pushRedo(snapshot: HistorySnapshot) {
    redoStack.value.push(cloneSnapshot(snapshot))

    if (redoStack.value.length > HISTORY_MAX_ENTRIES)
      redoStack.value.shift()
  }

  function commitPendingSnapshot() {
    if (!pendingBaseSnapshot.value) {
      syncCurrentSnapshot()
      return
    }

    const nextSnapshot = captureSnapshot()
    if (isSnapshotEqual(pendingBaseSnapshot.value, nextSnapshot)) {
      pendingBaseSnapshot.value = undefined
      currentSnapshot.value = nextSnapshot
      return
    }

    pushUndo(pendingBaseSnapshot.value)
    pendingBaseSnapshot.value = undefined
    currentSnapshot.value = nextSnapshot
  }

  function schedulePendingCommit() {
    clearCommitTimer()
    commitTimer = setTimeout(() => {
      commitTimer = undefined
      commitPendingSnapshot()
    }, HISTORY_GROUP_DELAY_MS)
  }

  function flushPendingSnapshot() {
    clearCommitTimer()
    commitPendingSnapshot()
  }

  function withTrackingPaused<T>(task: () => T): T {
    isTrackingPaused.value = true
    try {
      return task()
    }
    finally {
      isTrackingPaused.value = false
      syncCurrentSnapshot()
    }
  }

  function applySnapshot(snapshot: HistorySnapshot) {
    withTrackingPaused(() => {
      installed.value = clone(snapshot.installed)
      Object.assign(general, clone(snapshot.general))
      selection.applySelectionSnapshot(clone(snapshot.selection), {
        restoreSidebarTab: false,
        openTreeWhenSelection: true,
      })
    })
  }

  function undo() {
    flushPendingSnapshot()

    const targetSnapshot = undoStack.value.pop()
    if (!targetSnapshot)
      return false

    pushRedo(captureSnapshot())
    applySnapshot(targetSnapshot)

    return true
  }

  function redo() {
    flushPendingSnapshot()

    const targetSnapshot = redoStack.value.pop()
    if (!targetSnapshot)
      return false

    pushUndo(captureSnapshot())
    applySnapshot(targetSnapshot)

    return true
  }

  function resetHistory() {
    clearCommitTimer()
    pendingBaseSnapshot.value = undefined
    undoStack.value = []
    redoStack.value = []
    syncCurrentSnapshot()
  }

  function onTemplateMutation() {
    if (isTrackingPaused.value)
      return

    if (!currentSnapshot.value) {
      syncCurrentSnapshot()
      return
    }

    if (!pendingBaseSnapshot.value) {
      pendingBaseSnapshot.value = cloneSnapshot(currentSnapshot.value)
      redoStack.value = []
    }

    schedulePendingCommit()
  }

  watch(installed, onTemplateMutation, { deep: true, flush: 'sync' })
  watch(general, onTemplateMutation, { deep: true, flush: 'sync' })
  watch(
    [
      editableId,
      selection.selectedBlockId,
      selection.selectedRowId,
      selection.selectedCellId,
      selection.selectedAtomId,
      selection.selectionLevel,
      selection.sidebarActiveTab,
    ],
    () => {
      if (!currentSnapshot.value || pendingBaseSnapshot.value)
        return

      currentSnapshot.value.selection = clone(selection.captureSelectionSnapshot())
    },
    { flush: 'sync' },
  )

  resetHistory()

  const canUndo = computed(() => undoStack.value.length > 0 || Boolean(pendingBaseSnapshot.value))
  const canRedo = computed(() => redoStack.value.length > 0)

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    resetHistory,
    flushPendingSnapshot,
  }
}

export function useHistory() {
  if (!_instance)
    _instance = _createHistory()

  return _instance
}
