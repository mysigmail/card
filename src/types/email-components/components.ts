import type { AlignTool, CatalogComponent, ImageTool } from '@/types/editor'

export interface ComponentList {
  name: string
  components: CatalogComponent[]
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

export interface GridImageContent {
  type: 'image'
  attrs: HTMLImageElement
  link?: string
}

export interface GridTextContent {
  type: 'text'
  attrs?: Record<string, unknown>
  link?: string
  value?: string
}

export interface GridButtonContent {
  type: 'button'
  attrs: Record<string, unknown>
  text?: string
}

export interface GridMenuContent {
  type: 'menu'
  items: Menu[]
}

export interface GridSocialContent {
  type: 'social'
  items: Social[]
}

export type GridItemContent
  = | GridImageContent
    | GridTextContent
    | GridButtonContent
    | GridMenuContent
    | GridSocialContent

export interface GridItem {
  align?: AlignTool['value']
  contents: GridItemContent[]
  show?: boolean
  verticalAlign?: 'top' | 'middle' | 'bottom'
}
