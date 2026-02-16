import type { BlockNode } from '@/entities/block'
import type { BackgroundImageValue, SpacingValue } from '@/entities/style'

export type ToolGroupRole
  = | 'layout'
    | 'text'
    | 'menu'
    | 'button'
    | 'image'
    | 'imageBlock'
    | 'row'
    | 'social'
    | 'divider'
    | 'custom'
    | (string & {})

export interface ToolGroupRef {
  id: string
  role: ToolGroupRole
  label: string
}

export type ToolType
  = | 'align'
    | 'bgImage'
    | 'colorPicker'
    | 'columns'
    | 'image'
    | 'input'
    | 'select'
    | 'inputNumber'
    | 'multi'
    | 'spacing'
    | 'textEditor'
    | 'toggle'

export enum ToolT {
  Spacing = 'spacing',
}

export interface BaseTool {
  id: string
  key: string
  groupId?: string
  groupRole?: ToolGroupRole
  groupLabel?: string
  name?: string
  label: string
  type: ToolType
  value: any
}

export interface SpacingTool extends BaseTool {
  type: 'spacing'
  value: SpacingValue
}

export interface ImageTool extends BaseTool {
  type: 'image'
  value: {
    src: string
    link?: string
    alt?: string
    width?: number
    height?: number
  }
}

export interface ColorPickerTool extends BaseTool {
  type: 'colorPicker'
  value: string
}

export interface BackgroundImageTool extends BaseTool {
  type: 'bgImage'
  value: BackgroundImageValue
}

export interface InputTool extends BaseTool {
  type: 'input'
  value: string
}

export interface SelectTool extends BaseTool {
  type: 'select'
  value: string
  options: Array<{
    label: string
    value: string
  }>
}

export interface InputNumberTool extends BaseTool {
  type: 'inputNumber'
  value: number
}

export interface ToggleTool extends BaseTool {
  type: 'toggle'
  value: boolean
}

export interface AlignTool extends BaseTool {
  type: 'align'
  value: 'left' | 'center' | 'right'
}

export interface TextEditorTool extends BaseTool {
  type: 'textEditor'
  value: string
}

export interface ToolCollectionItem {
  id: string
  tools: Tool[]
}

export type SingleTool
  = | AlignTool
    | BackgroundImageTool
    | ColorPickerTool
    | ImageTool
    | InputNumberTool
    | InputTool
    | SelectTool
    | SpacingTool
    | TextEditorTool
    | ToggleTool

export interface MultiTool extends BaseTool {
  type: 'multi'
  value: ToolCollectionItem[]
}

export interface ColumnCollectionTool extends BaseTool {
  type: 'columns'
  value: ToolCollectionItem[]
}

export type Tool = SingleTool | MultiTool | ColumnCollectionTool

export type ComponentTheme = 'light' | 'dark'

export type ComponentType
  = | 'content'
    | 'cta'
    | 'ecommerce'
    | 'feature'
    | 'footer'
    | 'header'
    | 'menu'

export interface CanvasBlockInstance {
  id: string
  version: 2
  block: BlockNode
}

export type CanvasNode = CanvasBlockInstance

export interface BlockPreset extends CanvasBlockInstance {
  name: string
  label: string
  type: ComponentType
  preview: string
}

export interface BlockLibraryCategory {
  name: string
  components: BlockPreset[]
}

export interface GeneralTool {
  padding: [number, number, number, number]
  background: {
    color: string
    image?: string
    repeat: 'repeat' | 'no-repeat'
    size: 'unset' | 'cover' | 'contain'
    position: 'top' | 'center' | 'bottom' | 'left' | 'right'
  }
  font: string
  previewText: string
}

export const TEMPLATE_EXPORT_VERSION = 2 as const
export const TEMPLATE_LOCAL_STORAGE_KEY = 'card.template.v2'
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
  components: CanvasBlockInstance[]
}

export interface TemplateExportV2 {
  version: typeof TEMPLATE_EXPORT_VERSION
  meta: TemplateExportMeta
  editor: TemplateExportEditor
  canvas: TemplateExportCanvas
}

export type TemplateExportPayload = TemplateExportV2

export interface TemplateValidationIssue {
  path: string
  message: string
}
