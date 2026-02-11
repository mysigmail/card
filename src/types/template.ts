import type { Component, GeneralTool } from '@/types/editor'

export const TEMPLATE_EXPORT_VERSION = 1 as const
export const TEMPLATE_LOCAL_STORAGE_KEY = 'card.template.v1'
export const TEMPLATE_MAX_COMPONENTS = 200
export const TEMPLATE_MAX_JSON_BYTES = 2 * 1024 * 1024

export type TemplateImportMode = 'replace' | 'append'

export interface TemplateExportMeta {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  appVersion?: string
}

export interface TemplateExportEditor {
  general: GeneralTool
}

export interface TemplateExportCanvas {
  components: Component[]
}

export interface TemplateExportV1 {
  version: typeof TEMPLATE_EXPORT_VERSION
  meta: TemplateExportMeta
  editor: TemplateExportEditor
  canvas: TemplateExportCanvas
}

export type TemplateExportPayload = TemplateExportV1

export interface TemplateValidationIssue {
  path: string
  message: string
}
