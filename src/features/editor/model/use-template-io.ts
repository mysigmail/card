import type {
  TemplateExportV2,
  TemplateImportMode,
  TemplateValidationIssue,
} from '@/entities/template'
import { render as renderEmailHtml } from '@mysigmail/vue-email-components'
import { defineComponent, h } from 'vue'
import {
  createRuntimeComponents,
  createTemplateExportPayload,
  parseTemplateExportJson,
  parseTemplateExportPayload,
} from '@/entities/template'
import EmailExportDocument from '@/features/email-preview/ui/EmailExportDocument.vue'
import { clone } from '@/shared/lib/clone'
import { general, installed, templateImportIssues } from './state'
import { usePersistence } from './use-persistence'
import { useSelection } from './use-selection'

let _instance: ReturnType<typeof _createTemplateIO> | null = null

function _createTemplateIO() {
  let ignoreTemplatePersist = false

  function isConditionalEmailComment(content: string) {
    const normalized = content.trim().toLowerCase()
    return (
      normalized.startsWith('[if')
      || normalized.startsWith('[endif]')
      || normalized.startsWith('<![endif]')
    )
  }

  function sanitizeExportedHtml(html: string) {
    const withoutTechnicalAttrs = html
      .replace(/\sdata-node-id="[^"]*"/g, '')
      .replace(/\sdata-v-[\w-]+="[^"]*"/g, '')

    const withoutTechnicalComments = withoutTechnicalAttrs.replace(
      /<!--([\s\S]*?)-->/g,
      (full, content: string) => (isConditionalEmailComment(content) ? full : ''),
    )

    return withoutTechnicalComments.replace(/\n{3,}/g, '\n\n').trim()
  }

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

  function exportTemplateHtml() {
    const componentsSnapshot = clone(installed.value)
    const generalSnapshot = clone(general)

    const ExportRoot = defineComponent({
      name: 'TemplateExportRoot',
      setup() {
        return () =>
          h(EmailExportDocument, {
            components: componentsSnapshot,
            general: generalSnapshot,
          })
      },
    })

    const html = renderEmailHtml(ExportRoot)
    return sanitizeExportedHtml(html)
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
    exportTemplateHtml,
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
