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

export type PaddingToolValue = [number, number, number, number]

export type ImageToolValue = {
  src: string
  link?: string
  alt?: string
  width?: number
  height?: number
}

export type AlignToolValue = 'left' | 'right' | 'center'

export type ToolValue =
  | number
  | string
  | boolean
  | null
  | PaddingToolValue
  | ImageToolValue
  | AlignToolValue

export type Tool = {
  id: string
  group?: string
  label: string
  updateParentLabel?: boolean
  type: ToolType
  value: ToolValue | Tool[]
}

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
  name: string
  label: string
  type: ComponentType
  preview: string
  tools: Tool[]
}

export type ComponentBuilder = (
  theme: ComponentTheme,
  label: string
) => Component
