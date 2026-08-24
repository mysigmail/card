import { readonly, ref } from 'vue'

const EXPORT_SUPPORT_DIALOG_STORAGE_KEY = 'card.export-support-dialog.v1'
const EXPORT_SUPPORT_DIALOG_FIRST_PROMPT_AT = 1
const EXPORT_SUPPORT_DIALOG_REPEAT_INTERVAL = 5

const visible = ref(false)

interface ExportSupportDialogState {
  exportCount: number
  nextPromptAt: number
}

const defaultState: ExportSupportDialogState = {
  exportCount: 0,
  nextPromptAt: EXPORT_SUPPORT_DIALOG_FIRST_PROMPT_AT,
}

function readState(): ExportSupportDialogState {
  try {
    const raw = window.localStorage.getItem(EXPORT_SUPPORT_DIALOG_STORAGE_KEY)
    if (!raw)
      return { ...defaultState }

    const state = JSON.parse(raw) as Partial<ExportSupportDialogState>
    if (
      Number.isInteger(state.exportCount)
      && Number.isInteger(state.nextPromptAt)
      && state.exportCount! >= 0
      && state.nextPromptAt! > 0
    ) {
      return {
        exportCount: state.exportCount!,
        nextPromptAt: state.nextPromptAt!,
      }
    }

    return { ...defaultState }
  }
  catch {
    return { ...defaultState }
  }
}

function writeState(state: ExportSupportDialogState) {
  try {
    window.localStorage.setItem(EXPORT_SUPPORT_DIALOG_STORAGE_KEY, JSON.stringify(state))
  }
  catch {
    // The choice still applies for the current session when storage is unavailable.
  }
}

function resolveFollowingPromptAt(currentPromptAt: number) {
  if (currentPromptAt === EXPORT_SUPPORT_DIALOG_FIRST_PROMPT_AT)
    return EXPORT_SUPPORT_DIALOG_REPEAT_INTERVAL

  return currentPromptAt + EXPORT_SUPPORT_DIALOG_REPEAT_INTERVAL
}

function recordExportAndMaybeShowDialog() {
  const state = readState()
  const exportCount = state.exportCount + 1
  const shouldShow = exportCount >= state.nextPromptAt

  writeState({
    exportCount,
    nextPromptAt: shouldShow ? resolveFollowingPromptAt(state.nextPromptAt) : state.nextPromptAt,
  })

  if (shouldShow)
    visible.value = true
}

function closeExportSupportDialog() {
  visible.value = false
}

export function useExportSupportDialog() {
  return {
    exportSupportDialogVisible: readonly(visible),
    recordExportAndMaybeShowDialog,
    closeExportSupportDialog,
  }
}
