import type { Atom, ButtonAtom, ImageAtom, MenuAtom, MenuAtomItem, TextAtom } from '@/types/block'
import type { BackgroundImageTool, SpacingTool } from '@/types/editor'
import {
  createButtonAtom,
  createCellNode,
  createImageAtom,
  createMenuAtom,
  createTextAtom,
} from '@/components/email-components/block-factory'

type Insets = [number, number, number, number]
type HorizontalAlign = 'left' | 'center' | 'right'
type VerticalAlign = 'top' | 'middle' | 'bottom'
interface RowSettingsLike {
  spacing: SpacingTool['value']
  backgroundColor: string
  backgroundImage?: BackgroundImageTool['value']
  gap: number
  height?: number
}

interface CellOptions {
  atoms?: Atom[]
  horizontalAlign?: HorizontalAlign
  verticalAlign?: VerticalAlign
  backgroundColor?: string
  backgroundImage?: BackgroundImageTool['value']
  spacing?: SpacingTool['value']
  width?: number
  height?: number
  borderRadius?: number
  link?: string
}

interface ImageAtomOptions {
  src: string
  link?: string
  alt?: string
  width?: number
  height?: number
  borderRadius?: number
  spacing?: SpacingTool['value']
}

interface TextAtomOptions {
  value: string
  color: string
  spacing?: SpacingTool['value']
}

interface ButtonAtomOptions {
  text: string
  link: string
  backgroundColor: string
  color: string
  fontSize: number
  borderRadius: number
  padding: Insets
  spacing?: SpacingTool['value']
}

const ZERO_INSETS: Insets = [0, 0, 0, 0]

function zeroSpacing(): SpacingTool['value'] {
  return {
    margin: [...ZERO_INSETS] as Insets,
    padding: [...ZERO_INSETS] as Insets,
  }
}

interface RowNodeLike {
  settings: RowSettingsLike
}

export function resetRow(row: RowNodeLike) {
  row.settings.spacing = {}
  row.settings.backgroundColor = 'transparent'
  row.settings.backgroundImage = undefined
  row.settings.gap = 0
  row.settings.height = undefined
}

export function createCell(options: CellOptions = {}) {
  const cell = createCellNode([])
  cell.settings.horizontalAlign = options.horizontalAlign ?? 'left'
  cell.settings.verticalAlign = options.verticalAlign ?? 'top'
  cell.settings.backgroundColor = options.backgroundColor ?? 'transparent'
  cell.settings.backgroundImage = options.backgroundImage
  cell.settings.spacing = options.spacing ?? {}
  cell.settings.width = options.width
  cell.settings.height = options.height
  cell.settings.borderRadius = options.borderRadius
  cell.settings.link = options.link
  cell.atoms = options.atoms ?? []
  cell.rows = []

  return cell
}

export function buildImageAtom(options: ImageAtomOptions): ImageAtom {
  const atom = createImageAtom()
  atom.src = options.src
  atom.link = options.link ?? 'https://example.com'
  atom.alt = options.alt ?? 'Some alt'
  atom.width = options.width
  atom.height = options.height
  atom.borderRadius = options.borderRadius
  atom.spacing = options.spacing ?? zeroSpacing()

  return atom
}

export function buildTextAtom(options: TextAtomOptions): TextAtom {
  const atom = createTextAtom(options.value)
  atom.color = options.color
  atom.spacing = options.spacing ?? zeroSpacing()

  return atom
}

export function buildButtonAtom(options: ButtonAtomOptions): ButtonAtom {
  const atom = createButtonAtom()
  atom.text = options.text
  atom.link = options.link
  atom.backgroundColor = options.backgroundColor
  atom.color = options.color
  atom.fontSize = options.fontSize
  atom.borderRadius = options.borderRadius
  atom.padding = options.padding
  atom.spacing = options.spacing ?? {
    margin: [...ZERO_INSETS] as Insets,
    padding: [...options.padding] as Insets,
  }

  return atom
}

export function createMenuTextAtom(
  color: string,
  options: {
    gap?: number
    spacing?: SpacingTool['value']
    items?: MenuAtomItem[]
  } = {},
): MenuAtom {
  const atom = createMenuAtom()
  atom.gap = options.gap ?? atom.gap
  atom.spacing = options.spacing ?? zeroSpacing()
  atom.items = options.items
    ? options.items
    : atom.items.map((item) => {
        return item.type === 'text' ? { ...item, color } : item
      })

  return atom
}

export function createImageBackgroundCell(
  url: string,
  options: {
    height?: number
    borderRadius?: number
    link?: string
    horizontalAlign?: 'left' | 'center' | 'right'
    verticalAlign?: 'top' | 'middle' | 'bottom'
  } = {},
) {
  return createCell({
    atoms: [],
    horizontalAlign: options.horizontalAlign ?? 'left',
    verticalAlign: options.verticalAlign ?? 'top',
    borderRadius: options.borderRadius ?? 5,
    height: options.height ?? 200,
    link: options.link ?? 'https://example.com',
    backgroundColor: 'transparent',
    backgroundImage: {
      url,
      position: 'center',
      repeat: 'no-repeat',
      size: 'cover',
    },
    spacing: {},
  })
}
