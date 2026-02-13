import type { BackgroundImageValue, SpacingValue } from '@/entities/style'

export interface BaseAtom {
  id: string
  type: AtomType
  spacing?: SpacingValue
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

export interface BlockSettings {
  spacing: SpacingValue
  backgroundColor: string
  backgroundImage?: BackgroundImageValue
}

export interface RowSettings {
  spacing: SpacingValue
  backgroundColor: string
  backgroundImage?: BackgroundImageValue
  height?: number
  gap: number
}

export interface CellSettings {
  spacing: SpacingValue
  backgroundColor: string
  backgroundImage?: BackgroundImageValue
  link?: string
  verticalAlign: 'top' | 'middle' | 'bottom'
  horizontalAlign?: 'left' | 'center' | 'right'
  borderRadius?: number
  width?: number // процент (0-100)
  height?: number
}

export interface RowNode {
  id: string
  settings: RowSettings
  cells: CellNode[]
}

export interface CellNode {
  id: string
  settings: CellSettings
  atoms: Atom[]
  rows: RowNode[]
}

export interface BlockNode {
  id: string
  label: string
  settings: BlockSettings
  rows: RowNode[]
}
