import type {
  TemplateExportV2,
  TemplateImportMode,
  TemplateValidationIssue,
} from '@/entities/template'
import {
  createRuntimeComponents,
  createTemplateExportPayload,
  parseTemplateExportJson,
  parseTemplateExportPayload,
} from '@/entities/template'
import { clone } from '@/shared/lib/clone'
import { general, installed, templateImportIssues } from './state'
import { usePersistence } from './use-persistence'
import { useSelection } from './use-selection'

let _instance: ReturnType<typeof _createTemplateIO> | null = null

function _createTemplateIO() {
  let ignoreTemplatePersist = false

  function withPersistLock<T>(task: () => T): T {
    ignoreTemplatePersist = true
    try {
      return task()
    }
    finally {
      ignoreTemplatePersist = false
    }
  }

  function applyImportedTemplate(
    payload: TemplateExportV2,
    mode: TemplateImportMode,
    applyOptions?: {
      applyGeneralInAppend?: boolean
    },
  ) {
    const components = createRuntimeComponents(payload.canvas.components)

    if (mode === 'replace') {
      installed.value = components
    }
    else {
      installed.value.push(...components)
    }

    if (mode === 'replace' || applyOptions?.applyGeneralInAppend) {
      Object.assign(general, clone(payload.editor.general))
    }

    useSelection().resetSelection()
  }

  function exportTemplate(title?: string) {
    return createTemplateExportPayload({
      general,
      installed: installed.value,
      title,
    })
  }

  function exportTemplateJson(title?: string) {
    return JSON.stringify(exportTemplate(title), null, 2)
  }

  function triggerPersist() {
    usePersistence().persistTemplateToLocalStorage()
  }

  function importTemplate(
    rawPayload: unknown,
    mode: TemplateImportMode = 'replace',
    applyOptions?: {
      applyGeneralInAppend?: boolean
    },
  ) {
    const result = parseTemplateExportPayload(rawPayload)
    templateImportIssues.value = result.issues

    if (!result.payload) {
      return {
        ok: false as const,
        issues: result.issues,
      }
    }
    const parsedPayload = result.payload

    withPersistLock(() => {
      applyImportedTemplate(parsedPayload, mode, applyOptions)
    })

    triggerPersist()

    return {
      ok: true as const,
      issues: [] as TemplateValidationIssue[],
    }
  }

  function importTemplateFromJson(
    raw: string,
    mode: TemplateImportMode = 'replace',
    applyOptions?: {
      applyGeneralInAppend?: boolean
    },
  ) {
    const result = parseTemplateExportJson(raw)
    templateImportIssues.value = result.issues

    if (!result.payload) {
      return {
        ok: false as const,
        issues: result.issues,
      }
    }
    const parsedPayload = result.payload

    withPersistLock(() => {
      applyImportedTemplate(parsedPayload, mode, applyOptions)
    })

    triggerPersist()

    return {
      ok: true as const,
      issues: [] as TemplateValidationIssue[],
    }
  }

  return {
    applyImportedTemplate,
    exportTemplate,
    exportTemplateJson,
    importTemplate,
    importTemplateFromJson,
    withPersistLock,
    isPersistIgnored: () => ignoreTemplatePersist,
  }
}

export function useTemplateIO() {
  if (!_instance)
    _instance = _createTemplateIO()

  return _instance
}
