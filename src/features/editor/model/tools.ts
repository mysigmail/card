import type { BackgroundImageTool, ImageTool, SpacingTool } from './types'
import type { Atom } from '@/entities/block'

export const DEFAULT_BACKGROUND_IMAGE: BackgroundImageTool['value'] = {
  url: '',
  repeat: 'no-repeat',
  size: 'cover',
  position: 'center',
}

export const DEFAULT_MENU_TEXT_ITEM = {
  type: 'text' as const,
  text: 'Item',
  link: 'https://example',
  color: '#000000',
  fontSize: 16,
} as const

export const DEFAULT_MENU_IMAGE_ITEM = {
  type: 'image' as const,
  name: 'Icon',
  link: 'https://example',
  url: '/img/facebook-black.png',
  width: 16,
  height: 16,
  alt: 'Icon',
} as const

export const DEFAULT_MENU_ATOM_GAP = 10

export type MenuListItemField
  = | 'text'
    | 'link'
    | 'color'
    | 'fontSize'
    | 'name'
    | 'url'
    | 'width'
    | 'height'
    | 'alt'

export function toSpacingValue(value: unknown): SpacingTool['value'] {
  const raw = (value || {}) as SpacingTool['value']
  const next: SpacingTool['value'] = {}

  if (Array.isArray(raw.padding) && raw.padding.length === 4) {
    next.padding = raw.padding.map(i => Number(i) || 0) as [number, number, number, number]
  }

  if (Array.isArray(raw.margin) && raw.margin.length === 4) {
    next.margin = raw.margin.map(i => Number(i) || 0) as [number, number, number, number]
  }

  return next
}

export function toBackgroundImageValue(value: unknown): BackgroundImageTool['value'] {
  const raw = (value || {}) as Partial<BackgroundImageTool['value']>
  return {
    ...DEFAULT_BACKGROUND_IMAGE,
    ...raw,
    url: typeof raw.url === 'string' ? raw.url : '',
  }
}

export function toOptionalPositiveNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function toImageValue(value: unknown): ImageTool['value'] {
  const raw = (value || {}) as Partial<ImageTool['value']>

  return {
    src: typeof raw.src === 'string' ? raw.src : '',
    alt: typeof raw.alt === 'string' ? raw.alt : '',
    link: typeof raw.link === 'string' ? raw.link : '',
    width: toOptionalPositiveNumber(raw.width),
    height: toOptionalPositiveNumber(raw.height),
  }
}

export function toNonNegativeFiniteNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

export function getMenuAtomItemType(atom: Extract<Atom, { type: 'menu' }>): 'text' | 'image' {
  if (atom.itemType === 'image')
    return 'image'

  if (atom.itemType === 'text')
    return 'text'

  const first = atom.items[0]
  return first?.type === 'image' ? 'image' : 'text'
}

export function toMenuTextItem(item: Extract<Atom, { type: 'menu' }>['items'][number] | undefined) {
  if (item?.type === 'text')
    return { ...item }

  return {
    ...DEFAULT_MENU_TEXT_ITEM,
    text: item?.type === 'image' ? item.name : DEFAULT_MENU_TEXT_ITEM.text,
    link: item?.link || DEFAULT_MENU_TEXT_ITEM.link,
  }
}

export function toMenuImageItem(
  item: Extract<Atom, { type: 'menu' }>['items'][number] | undefined,
) {
  if (item?.type === 'image')
    return { ...item }

  return {
    ...DEFAULT_MENU_IMAGE_ITEM,
    name: item?.type === 'text' ? item.text : DEFAULT_MENU_IMAGE_ITEM.name,
    link: item?.link || DEFAULT_MENU_IMAGE_ITEM.link,
  }
}

export function parseMenuListField(field: string) {
  const [key, indexRaw, itemField] = field.split('::')

  if (key !== 'menuList' || !indexRaw || !itemField)
    return undefined

  const index = Number(indexRaw)
  if (!Number.isInteger(index) || index < 0)
    return undefined

  if (
    !['text', 'link', 'color', 'fontSize', 'name', 'url', 'width', 'height', 'alt'].includes(
      itemField,
    )
  ) {
    return undefined
  }

  return {
    index,
    itemField: itemField as MenuListItemField,
  }
}
