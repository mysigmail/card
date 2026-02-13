import type { BackgroundImageTool, SpacingTool } from '@/types/editor'

// --- Atom Types (атомарные единицы внутри Item) ---

export interface BaseAtom {
  id: string
  type: AtomType
  spacing?: SpacingTool['value']
}

export interface TextAtom extends BaseAtom {
  type: 'text'
  value: string
  color: string
}

export interface ButtonAtom extends BaseAtom {
  type: 'button'
  text: string
  link: string
  backgroundColor: string
  color: string
  fontSize: number
  borderRadius: number
  padding: [number, number, number, number]
}

export interface DividerAtom extends BaseAtom {
  type: 'divider'
  color: string
  height: number
}

export interface ImageAtom extends BaseAtom {
  type: 'image'
  src: string
  link: string
  alt: string
  width?: number
  height?: number
  borderRadius?: number
}

export interface MenuAtomTextItem {
  type: 'text'
  text: string
  link: string
  color: string
  fontSize: number
}

export interface MenuAtomImageItem {
  type: 'image'
  name: string
  link: string
  url: string
  width?: number
  height?: number
  alt: string
}

export type MenuAtomItem = MenuAtomTextItem | MenuAtomImageItem

export interface MenuAtom extends BaseAtom {
  type: 'menu'
  itemType?: 'text' | 'image'
  gap?: number
  items: MenuAtomItem[]
}

export type AtomType = 'text' | 'button' | 'divider' | 'image' | 'menu'

export type Atom = TextAtom | ButtonAtom | DividerAtom | ImageAtom | MenuAtom

// --- Settings ---

export interface BlockSettings {
  spacing: SpacingTool['value']
  backgroundColor: string
  backgroundImage?: BackgroundImageTool['value']
}

export interface GridSettings {
  spacing: SpacingTool['value']
  backgroundColor: string
  backgroundImage?: BackgroundImageTool['value']
  height?: number
  gap: number
}

export interface ItemSettings {
  spacing: SpacingTool['value']
  backgroundColor: string
  backgroundImage?: BackgroundImageTool['value']
  link?: string
  verticalAlign: 'top' | 'middle' | 'bottom'
  horizontalAlign?: 'left' | 'center' | 'right'
  borderRadius?: number
  width?: number // процент (0-100)
  height?: number
}

// --- Structural Types ---

export interface BlockItem {
  id: string
  settings: ItemSettings
  atoms: Atom[]
  grids: BlockGrid[]
}

export interface BlockGrid {
  id: string
  settings: GridSettings
  items: BlockItem[]
}

export interface Block {
  id: string
  label: string
  settings: BlockSettings
  grids: BlockGrid[]
}
