export type ToolType =
  | 'padding'
  | 'colorPicker'
  | 'inputNumber'
  | 'input'
  | 'toggle'
  | 'image'
  | 'align'
  | 'textEditor'
  | 'multi'

export enum ToolT {
  Padding = 'padding',
}

export interface BaseTool {
  id: string
  group?: string
  name: string
  label: string
  type: ToolType
  value: any
}

export interface PaddingTool extends BaseTool {
  type: 'padding'
  value: [number, number, number, number]
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

export type SingleTool =
  | PaddingTool
  | ImageTool
  | ColorPickerTool
  | InputTool
  | InputNumberTool
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

export type ComponentType =
  | 'content'
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
}

export type ComponentBuilder = (theme: ComponentTheme, label: string) => Component

export interface GeneralTool {
  background: {
    color?: string
    image?: string
    repeat: 'repeat' | 'no-repeat'
    size: 'unset' | 'cover' | 'contain'
    position: 'top' | 'center' | 'bottom' | 'left' | 'right'
  }
  font: string
  previewText: string
}
