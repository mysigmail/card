import type { TemplateImportMode } from '@/entities/template'
import { useEventListener } from '@vueuse/core'
import { computed, ref, watch } from 'vue'
import { useCanvas, useHistory, useTemplateIO } from '@/features/editor/model'

function isTextInputElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement))
    return false

  if (target.isContentEditable)
    return true

  return ['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())
}

export function useHeaderActions() {
  const { exportTemplateHtml, exportTemplateJson, importTemplateFromJson } = useTemplateIO()
  const { templateImportIssues, clearCanvas, previewMode } = useCanvas()
  const { canUndo, canRedo, undo, redo, resetHistory } = useHistory()

  const importDialogVisible = ref(false)
  const clearDialogVisible = ref(false)
  const importMode = ref<TemplateImportMode>('replace')
  const applyGeneralInAppend = ref(false)
  const importStatus = ref<'idle' | 'error'>('idle')
  const importMessage = ref('')
  const pendingImportRaw = ref('')
  const pendingImportFileName = ref('')
  const fileInputRef = ref<HTMLInputElement>()

  const importModeValue = computed<string>({
    get: () => importMode.value,
    set: (next) => {
      if (next === 'replace' || next === 'append')
        importMode.value = next
    },
  })

  const previewModeValue = computed<string>({
    get: () => previewMode.value,
    set: (next) => {
      if (next === 'desktop' || next === 'mobile')
        previewMode.value = next
    },
  })

  const visibleImportIssues = computed(() => {
    if (importStatus.value !== 'error')
      return []

    return templateImportIssues.value.slice(0, 10)
  })

  const canImport = computed(() => Boolean(pendingImportRaw.value))

  function exportTemplateToFile() {
    const now = new Date().toISOString().replace(/[:.]/g, '-')
    const payload = exportTemplateJson()
    const file = new Blob([payload], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(file)

    const link = document.createElement('a')
    link.href = url
    link.download = `email-template-${now}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    importStatus.value = 'idle'
    importMessage.value = ''
  }

  function exportTemplateHtmlToFile() {
    const now = new Date().toISOString().replace(/[:.]/g, '-')
    const payload = exportTemplateHtml()
    const file = new Blob([payload], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(file)

    const link = document.createElement('a')
    link.href = url
    link.download = `email-template-${now}.html`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    importStatus.value = 'idle'
    importMessage.value = ''
  }

  function resetImportDialog() {
    importStatus.value = 'idle'
    importMessage.value = ''
    pendingImportRaw.value = ''
    pendingImportFileName.value = ''
    importMode.value = 'replace'
    applyGeneralInAppend.value = false

    if (fileInputRef.value)
      fileInputRef.value.value = ''
  }

  function openImportDialog() {
    resetImportDialog()
    importDialogVisible.value = true
  }

  function closeImportDialog() {
    importDialogVisible.value = false
  }

  function clearCanvasWithConfirm() {
    clearDialogVisible.value = true
  }

  function onConfirmClearCanvas() {
    clearCanvas()
    resetHistory()
    clearDialogVisible.value = false
  }

  async function onImportFileChange(event: Event) {
    const target = event.target as HTMLInputElement | null
    const file = target?.files?.[0]

    if (!file) {
      pendingImportRaw.value = ''
      pendingImportFileName.value = ''
      return
    }

    try {
      pendingImportRaw.value = await file.text()
      pendingImportFileName.value = file.name
      importStatus.value = 'idle'
      importMessage.value = ''
    }
    catch {
      importStatus.value = 'error'
      importMessage.value = 'Failed to read selected file.'
    }
  }

  function confirmImport() {
    const result = importTemplateFromJson(pendingImportRaw.value, importMode.value, {
      applyGeneralInAppend: importMode.value === 'append' && applyGeneralInAppend.value,
    })

    if (result.ok) {
      closeImportDialog()
      return
    }

    importStatus.value = 'error'
    importMessage.value = 'Import failed. Check validation errors below.'
  }

  function onUndo() {
    undo()
  }

  function onRedo() {
    redo()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (!(event.metaKey || event.ctrlKey) || event.altKey)
      return

    if (isTextInputElement(event.target))
      return

    if (event.key.toLowerCase() !== 'z')
      return

    if (event.shiftKey) {
      if (!canRedo.value)
        return

      event.preventDefault()
      redo()
      return
    }

    if (!canUndo.value)
      return

    event.preventDefault()
    undo()
  }

  useEventListener('keydown', onKeyDown, { passive: false })

  watch(importDialogVisible, (open) => {
    if (!open)
      resetImportDialog()
  })

  return {
    importDialogVisible,
    clearDialogVisible,
    importMode,
    applyGeneralInAppend,
    importStatus,
    importMessage,
    pendingImportRaw,
    pendingImportFileName,
    fileInputRef,
    importModeValue,
    previewModeValue,
    visibleImportIssues,
    canImport,
    canUndo,
    canRedo,
    exportTemplateToFile,
    exportTemplateHtmlToFile,
    openImportDialog,
    closeImportDialog,
    clearCanvasWithConfirm,
    onConfirmClearCanvas,
    onUndo,
    onRedo,
    onImportFileChange,
    confirmImport,
  }
}
