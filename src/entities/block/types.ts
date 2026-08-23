import type { BackgroundImageValue, BorderValue, SpacingValue } from '@/entities/style'

export interface BaseAtom {
  id: string
  type: AtomType
  spacing?: SpacingValue
  hiddenOnMobile?: boolean
}

export interface TextAtom extends BaseAtom {
  type: 'text'
  value: string
  widthMode?: 'fill' | 'hug'
  paragraphSpacing?: number
  border?: BorderValue
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
  border?: BorderValue
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
  border?: BorderValue
}

export type AtomType = 'text' | 'button' | 'divider' | 'image'

export type Atom = TextAtom | ButtonAtom | DividerAtom | ImageAtom
export type CellChild = Atom | RowNode

export interface BlockSettings {
  spacing: SpacingValue
  backgroundColor: string
  backgroundImage?: BackgroundImageValue
  border?: BorderValue
}

export interface RowSettings {
  spacing: SpacingValue
  backgroundColor: string
  backgroundImage?: BackgroundImageValue
  border?: BorderValue
  hiddenOnMobile?: boolean
  collapseOnMobile?: boolean
  height?: number
  gap: number
  widthMode: 'fill' | 'hug'
}

export interface CellSettings {
  spacing: SpacingValue
  backgroundColor: string
  backgroundImage?: BackgroundImageValue
  border?: BorderValue
  link?: string
  hiddenOnMobile?: boolean
  verticalAlign: 'top' | 'middle' | 'bottom'
  horizontalAlign?: 'left' | 'center' | 'right'
  borderRadius?: number
  width?: number // процент (0-100)
  height?: number
}

export interface RowNode {
  type: 'row'
  id: string
  settings: RowSettings
  cells: CellNode[]
}

export interface CellNode {
  id: string
  settings: CellSettings
  children: CellChild[]
}

export interface BlockNode {
  id: string
  label: string
  settings: BlockSettings
  rows: RowNode[]
}
