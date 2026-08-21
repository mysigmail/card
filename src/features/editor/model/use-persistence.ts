import type { TemplateValidationIssue } from '@/entities/template'
import { watch } from 'vue'
import { parseTemplateExportJson, TEMPLATE_LOCAL_STORAGE_KEY } from '@/entities/template'
import { general, installed, templateImportIssues } from './state'
import { useHistory } from './use-history'
import { useTemplateIO } from './use-template-io'

let _instance: ReturnType<typeof _createPersistence> | null = null

function _createPersistence() {
  let templatePersistenceInitialized = false

  function persistTemplateToLocalStorage() {
    const templateIO = useTemplateIO()

    if (typeof window === 'undefined' || templateIO.isPersistIgnored())
      return

    try {
      window.localStorage.setItem(TEMPLATE_LOCAL_STORAGE_KEY, templateIO.exportTemplateJson())
    }
    catch {
      // Ignore storage write errors (private mode / quota exceeded)
    }
  }

  function hydrateTemplateFromLocalStorage() {
    const templateIO = useTemplateIO()
    const history = useHistory()

    if (typeof window === 'undefined') {
      return {
        ok: false as const,
        issues: [] as TemplateValidationIssue[],
      }
    }

    const raw = window.localStorage.getItem(TEMPLATE_LOCAL_STORAGE_KEY)

    if (!raw) {
      history.resetHistory()
      return {
        ok: true as const,
        issues: [] as TemplateValidationIssue[],
      }
    }

    const result = parseTemplateExportJson(raw)
    templateImportIssues.value = result.issues

    if (!result.payload) {
      history.resetHistory()
      return {
        ok: false as const,
        issues: result.issues,
      }
    }
    const payload = result.payload

    templateIO.withPersistLock(() => {
      templateIO.applyImportedTemplate(payload, 'replace')
    })
    history.resetHistory()

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
      installed,
      () => {
        persistTemplateToLocalStorage()
      },
      { deep: true },
    )

    watch(
      general,
      () => {
        persistTemplateToLocalStorage()
      },
      { deep: true },
    )
  }

  // Auto-init persistence on singleton creation
  initTemplatePersistence()

  return {
    persistTemplateToLocalStorage,
    hydrateTemplateFromLocalStorage,
    initTemplatePersistence,
  }
}

export function usePersistence() {
  if (!_instance)
    _instance = _createPersistence()

  return _instance
}
