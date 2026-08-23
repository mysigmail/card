import type {
  Atom,
  AtomType,
  BlockNode,
  BlockSettings,
  ButtonAtom,
  CellNode,
  CellSettings,
  DividerAtom,
  ImageAtom,
  RowNode,
  RowSettings,
  TextAtom,
} from './types'
import { nanoid } from 'nanoid'

export function createDefaultBlockSettings(): BlockSettings {
  return {
    spacing: { padding: [30, 35, 30, 35] },
    backgroundColor: '#FFFFFF',
  }
}

export function createDefaultRowSettings(): RowSettings {
  return {
    spacing: {},
    backgroundColor: 'transparent',
    hiddenOnMobile: false,
    collapseOnMobile: true,
    gap: 0,
    widthMode: 'fill',
  }
}

export function createDefaultCellSettings(): CellSettings {
  return {
    spacing: {},
    backgroundColor: 'transparent',
    link: undefined,
    hiddenOnMobile: false,
    verticalAlign: 'top',
    horizontalAlign: 'left',
    borderRadius: undefined,
  }
}

function createAtomSpacing(padding: [number, number, number, number] = [0, 0, 0, 0]) {
  return {
    margin: [0, 0, 0, 0] as [number, number, number, number],
    padding: [...padding] as [number, number, number, number],
  }
}

export function createTextAtom(value = '<p>Text</p>'): TextAtom {
  return {
    id: nanoid(8),
    type: 'text',
    value: `<div style="color:#111827">${value}</div>`,
    widthMode: 'hug',
    paragraphSpacing: 0,
    spacing: createAtomSpacing(),
  }
}

export function createButtonAtom(): ButtonAtom {
  const padding: [number, number, number, number] = [12, 24, 12, 24]

  return {
    id: nanoid(8),
    type: 'button',
    text: 'Button',
    link: 'https://example.com',
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    fontSize: 16,
    borderRadius: 4,
    padding,
    spacing: createAtomSpacing(padding),
  }
}

export function createDividerAtom(): DividerAtom {
  return {
    id: nanoid(8),
    type: 'divider',
    color: '#E5E7EB',
    height: 1,
    spacing: createAtomSpacing(),
  }
}

export function createImageAtom(): ImageAtom {
  return {
    id: nanoid(8),
    type: 'image',
    src: '/img/system/logos/logo-black.png',
    link: 'https://example.com',
    alt: 'Image',
    width: 120,
    borderRadius: 0,
    spacing: createAtomSpacing(),
  }
}

export function createAtom(type: AtomType): Atom {
  switch (type) {
    case 'text':
      return createTextAtom()
    case 'button':
      return createButtonAtom()
    case 'divider':
      return createDividerAtom()
    case 'image':
      return createImageAtom()
  }
}

export function createCellNode(children?: CellNode['children']): CellNode {
  return {
    id: nanoid(8),
    settings: createDefaultCellSettings(),
    children: children ?? [createTextAtom()],
  }
}

export function createRowNode(cells?: CellNode[]): RowNode {
  return {
    id: nanoid(8),
    type: 'row',
    settings: createDefaultRowSettings(),
    cells: cells ?? [createCellNode()],
  }
}

export interface TextMenuRecipeItem {
  text: string
  link: string
  color?: string
  fontSize?: number
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function createTextMenuRow(
  items: Array<string | TextMenuRecipeItem> = [
    { text: 'Specs', link: 'https://example.com' },
    { text: 'Feature', link: 'https://example.com' },
    { text: 'Price', link: 'https://example.com' },
  ],
): RowNode {
  const cells = items.map((item) => {
    const normalized = typeof item === 'string' ? { text: item, link: 'https://example.com' } : item
    const color = normalized.color || '#000000'
    const fontSize = normalized.fontSize || 16
    const value = `<p><a href="${escapeHtml(normalized.link)}"><span style="color:${escapeHtml(color)};font-size:${fontSize}px">${escapeHtml(normalized.text)}</span></a></p>`
    return createCellNode([createTextAtom(value)])
  })
  const row = createRowNode(cells)
  row.settings.widthMode = 'hug'
  row.settings.collapseOnMobile = false
  row.settings.gap = 10
  return row
}

export interface SocialRecipeItem {
  src: string
  link: string
  alt: string
  width?: number
  height?: number
}

export function createSocialRow(
  items: SocialRecipeItem[] = [
    {
      src: '/img/system/social/menu/facebook-black.png',
      link: 'https://example.com',
      alt: 'Facebook',
    },
    {
      src: '/img/system/social/menu/twitter-x-black.png',
      link: 'https://example.com',
      alt: 'X',
    },
    {
      src: '/img/system/social/menu/instagram-black.png',
      link: 'https://example.com',
      alt: 'Instagram',
    },
  ],
  gap = 10,
): RowNode {
  const cells = items.map((item) => {
    const image = createImageAtom()
    image.src = item.src
    image.link = item.link
    image.alt = item.alt
    image.width = item.width ?? 16
    image.height = item.height ?? 16
    return createCellNode([image])
  })
  const row = createRowNode(cells)
  row.settings.widthMode = 'hug'
  row.settings.collapseOnMobile = false
  row.settings.gap = gap
  return row
}

export function createBlockNode(label = 'Block', rows?: RowNode[]): BlockNode {
  return {
    id: nanoid(8),
    label,
    settings: createDefaultBlockSettings(),
    rows: rows ?? [createRowNode()],
  }
}
