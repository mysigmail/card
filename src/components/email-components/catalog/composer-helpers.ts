import type { Atom, ButtonAtom, ImageAtom, MenuAtom, MenuAtomItem, TextAtom } from '@/types/block'
import type { BackgroundImageTool, SpacingTool } from '@/types/editor'
import {
  createButtonAtom,
  createImageAtom,
  createItem,
  createMenuAtom,
  createTextAtom,
} from '@/components/email-components/block-factory'

type Insets = [number, number, number, number]
type HorizontalAlign = 'left' | 'center' | 'right'
type VerticalAlign = 'top' | 'middle' | 'bottom'
interface GridSettings {
  spacing: SpacingTool['value']
  backgroundColor: string
  backgroundImage?: BackgroundImageTool['value']
  gap: number
  height?: number
}

interface ItemNodeOptions {
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

interface ImageAtomNodeOptions {
  src: string
  link?: string
  alt?: string
  width?: number
  height?: number
  borderRadius?: number
  spacing?: SpacingTool['value']
}

interface TextAtomNodeOptions {
  value: string
  color: string
  spacing?: SpacingTool['value']
}

interface ButtonAtomNodeOptions {
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

interface GridNodeLike {
  settings: GridSettings
}

export function resetGrid(grid: GridNodeLike) {
  grid.settings.spacing = {}
  grid.settings.backgroundColor = 'transparent'
  grid.settings.backgroundImage = undefined
  grid.settings.gap = 0
  grid.settings.height = undefined
}

export function createItemNode(options: ItemNodeOptions = {}) {
  const item = createItem([])
  item.settings.horizontalAlign = options.horizontalAlign ?? 'left'
  item.settings.verticalAlign = options.verticalAlign ?? 'top'
  item.settings.backgroundColor = options.backgroundColor ?? 'transparent'
  item.settings.backgroundImage = options.backgroundImage
  item.settings.spacing = options.spacing ?? {}
  item.settings.width = options.width
  item.settings.height = options.height
  item.settings.borderRadius = options.borderRadius
  item.settings.link = options.link
  item.atoms = options.atoms ?? []
  item.grids = []

  return item
}

export function createImageAtomNode(options: ImageAtomNodeOptions): ImageAtom {
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

export function createTextAtomNode(options: TextAtomNodeOptions): TextAtom {
  const atom = createTextAtom(options.value)
  atom.color = options.color
  atom.spacing = options.spacing ?? zeroSpacing()

  return atom
}

export function createButtonAtomNode(options: ButtonAtomNodeOptions): ButtonAtom {
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

export function createImageBlockItem(
  url: string,
  options: {
    height?: number
    borderRadius?: number
    link?: string
    horizontalAlign?: 'left' | 'center' | 'right'
    verticalAlign?: 'top' | 'middle' | 'bottom'
  } = {},
) {
  return createItemNode({
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
