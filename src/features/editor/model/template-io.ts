import type { Ref } from 'vue'
import type { CanvasBlockInstance, GeneralTool } from './types'
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

interface CreateTemplateIOModuleOptions {
  installed: Ref<CanvasBlockInstance[]>
  general: GeneralTool
  templateImportIssues: Ref<TemplateValidationIssue[]>
  resetSelection: () => void
  persistTemplateToLocalStorage: () => void
}

export function createTemplateIOModule(options: CreateTemplateIOModuleOptions) {
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
      options.installed.value = components
    }
    else {
      options.installed.value.push(...components)
    }

    if (mode === 'replace' || applyOptions?.applyGeneralInAppend) {
      Object.assign(options.general, clone(payload.editor.general))
    }

    options.resetSelection()
  }

  function exportTemplate(title?: string) {
    return createTemplateExportPayload({
      general: options.general,
      installed: options.installed.value,
      title,
    })
  }

  function exportTemplateJson(title?: string) {
    return JSON.stringify(exportTemplate(title), null, 2)
  }

  function importTemplate(
    rawPayload: unknown,
    mode: TemplateImportMode = 'replace',
    applyOptions?: {
      applyGeneralInAppend?: boolean
    },
  ) {
    const result = parseTemplateExportPayload(rawPayload)
    options.templateImportIssues.value = result.issues

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

    options.persistTemplateToLocalStorage()

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
    options.templateImportIssues.value = result.issues

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

    options.persistTemplateToLocalStorage()

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
