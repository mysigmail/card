import type {
  BackgroundImageValue,
  BorderRadiusValue,
  BorderValue,
  SpacingValue,
} from '@/entities/style'

export interface BaseAtom {
  id: string
  type: AtomType
  spacing?: SpacingValue
  hiddenOnMobile?: boolean
  opacity?: number
}

export interface TextAtom extends BaseAtom {
  type: 'text'
  value: string
  widthMode?: 'fill' | 'hug'
  paragraphSpacing?: number
  borderRadius?: BorderRadiusValue
  border?: BorderValue
}

export interface ButtonAtom extends BaseAtom {
  type: 'button'
  value: string
  link: string
  backgroundColor: string
  borderRadius: BorderRadiusValue
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
  borderRadius?: BorderRadiusValue
  border?: BorderValue
}

export type AtomType = 'text' | 'button' | 'divider' | 'image'

export type Atom = TextAtom | ButtonAtom | DividerAtom | ImageAtom
export type CellChild = Atom | RowNode

export interface BlockSettings {
  spacing: SpacingValue
  backgroundColor: string
  backgroundImage?: BackgroundImageValue
  borderRadius?: BorderRadiusValue
  border?: BorderValue
  opacity?: number
}

export interface RowSettings {
  spacing: SpacingValue
  backgroundColor: string
  backgroundImage?: BackgroundImageValue
  borderRadius?: BorderRadiusValue
  border?: BorderValue
  hiddenOnMobile?: boolean
  collapseOnMobile?: boolean
  height?: number
  gap: number
  widthMode: 'fill' | 'hug'
  opacity?: number
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
  borderRadius?: BorderRadiusValue
  width?: number // процент (0-100)
  height?: number
  opacity?: number
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
