import type { EmailBlockSchema } from '@/components/email-components/schema/types'

export type ToolGroupRole
  = | 'layout'
    | 'text'
    | 'logo'
    | 'menu'
    | 'button'
    | 'image'
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
    | 'image'
    | 'input'
    | 'inputNumber'
    | 'multi'
    | 'padding'
    | 'spacing'
    | 'textEditor'
    | 'toggle'

export enum ToolT {
  Padding = 'padding',
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

export interface PaddingTool extends BaseTool {
  type: 'padding'
  value: [number, number, number, number]
}

export interface SpacingTool extends BaseTool {
  type: 'spacing'
  value: {
    margin?: [number, number, number, number]
    padding?: [number, number, number, number]
  }
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
  value: {
    url: string
    repeat: 'repeat' | 'no-repeat'
    size: 'unset' | 'cover' | 'contain'
    position: 'top' | 'center' | 'bottom' | 'left' | 'right'
  }
}

export interface InputTool extends BaseTool {
  type: 'input'
  value: string
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

export type SingleTool
  = | AlignTool
    | BackgroundImageTool
    | ColorPickerTool
    | ImageTool
    | InputNumberTool
    | InputTool
    | PaddingTool
    | SpacingTool
    | TextEditorTool
    | ToggleTool

export interface MultiTool extends BaseTool {
  type: 'multi'
  value: {
    id: string
    // groupName: string
    // Первым должен быть InputTool для возможности
    // редактирования название группы
    tools: SingleTool[]
  }[]
}

export type Tool = SingleTool | MultiTool

export type ComponentTheme = 'light' | 'dark'

export type ComponentType
  = | 'content'
    | 'cta'
    | 'ecommerce'
    | 'feature'
    | 'footer'
    | 'header'
    | 'menu'

export interface Component {
  id: string
  name: string
  label: string
  type: ComponentType
  preview: string
  tools: Tool[]
  schema: EmailBlockSchema
}

export type ComponentBuilder = (theme: ComponentTheme, label: string) => Component

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
