import type { Ref } from 'vue'
import type { CanvasBlockInstance, GeneralTool } from './types'
import type {
  TemplateExportV2,
  TemplateImportMode,
  TemplateValidationIssue,
} from '@/entities/template'
import { watch } from 'vue'
import { parseTemplateExportJson, TEMPLATE_LOCAL_STORAGE_KEY } from '@/entities/template'

interface CreatePersistenceModuleOptions {
  installed: Ref<CanvasBlockInstance[]>
  general: GeneralTool
  templateImportIssues: Ref<TemplateValidationIssue[]>
  exportTemplateJson: (title?: string) => string
  applyImportedTemplate: (
    payload: TemplateExportV2,
    mode: TemplateImportMode,
    options?: { applyGeneralInAppend?: boolean },
  ) => void
  withPersistLock: <T>(task: () => T) => T
  isPersistIgnored: () => boolean
}

export function createPersistenceModule(options: CreatePersistenceModuleOptions) {
  let templatePersistenceInitialized = false

  function persistTemplateToLocalStorage() {
    if (typeof window === 'undefined' || options.isPersistIgnored())
      return

    try {
      window.localStorage.setItem(TEMPLATE_LOCAL_STORAGE_KEY, options.exportTemplateJson())
    }
    catch {
      // Ignore storage write errors (private mode / quota exceeded)
    }
  }

  function hydrateTemplateFromLocalStorage() {
    if (typeof window === 'undefined') {
      return {
        ok: false as const,
        issues: [] as TemplateValidationIssue[],
      }
    }

    const raw = window.localStorage.getItem(TEMPLATE_LOCAL_STORAGE_KEY)

    if (!raw) {
      return {
        ok: true as const,
        issues: [] as TemplateValidationIssue[],
      }
    }

    const result = parseTemplateExportJson(raw)
    options.templateImportIssues.value = result.issues

    if (!result.payload) {
      return {
        ok: false as const,
        issues: result.issues,
      }
    }
    const payload = result.payload

    options.withPersistLock(() => {
      options.applyImportedTemplate(payload, 'replace')
    })

    return {
      ok: true as const,
      issues: [] as TemplateValidationIssue[],
    }
  }

  function initTemplatePersistence() {
    if (templatePersistenceInitialized || typeof window === 'undefined')
      return

    templatePersistenceInitialized = true

    watch(
      options.installed,
      () => {
        persistTemplateToLocalStorage()
      },
      { deep: true },
    )

    watch(
      options.general,
      () => {
        persistTemplateToLocalStorage()
      },
      { deep: true },
    )
  }

  return {
    persistTemplateToLocalStorage,
    hydrateTemplateFromLocalStorage,
    initTemplatePersistence,
  }
}
