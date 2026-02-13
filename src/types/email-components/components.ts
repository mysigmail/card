import type { AlignTool, BlockPreset, ImageTool } from '@/types/editor'

export interface ComponentList {
  name: string
  components: BlockPreset[]
}

export interface Menu {
  color: string
  fontSize: number | string
  text: string
  link: string
}

export interface Social {
  image: ImageTool['value']
  link: string
}

export interface CellImageContent {
  type: 'image'
  attrs: HTMLImageElement
  link?: string
}

export interface CellTextContent {
  type: 'text'
  attrs?: Record<string, unknown>
  link?: string
  value?: string
}

export interface CellButtonContent {
  type: 'button'
  attrs: Record<string, unknown>
  text?: string
}

export interface CellMenuContent {
  type: 'menu'
  items: Menu[]
}

export interface CellSocialContent {
  type: 'social'
  items: Social[]
}

export type CellContent
  = | CellImageContent
    | CellTextContent
    | CellButtonContent
    | CellMenuContent
    | CellSocialContent

export interface RowCell {
  align?: AlignTool['value']
  contents: CellContent[]
  show?: boolean
  verticalAlign?: 'top' | 'middle' | 'bottom'
}
