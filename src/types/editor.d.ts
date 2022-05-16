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
  tools: any // TODO: добавить тип в будущем
}

export type ComponentTheme = 'light' | 'dark'
export type ComponentCreator = (
  theme: ComponentTheme,
  label: string
) => Component

export interface EditorTool {}
