import type {
  AtomPropertyMap,
  BlockPropertyMap,
  CellPropertyMap,
  RowPropertyMap,
} from './inspector-types'
import type { Atom, AtomType, BlockNode, CellNode, RowNode } from '@/entities/block'
import type {
  BackgroundImageValue,
  BorderRadiusValue,
  BorderValue,
  Insets,
  SpacingValue,
} from '@/entities/style'
import {
  createBorderRadiusValue,
  normalizeBorderRadiusValue,
  normalizeBorderValue,
  normalizeEmailColor,
  normalizeOpacity,
  resolveOpacity,
} from '@/entities/style'
import { sanitizeTextEditorHtml } from '@/entities/template'

interface Normalized<T> {
  ok: true
  value: T
}

interface Invalid {
  ok: false
}

export type NormalizeResult<T> = Normalized<T> | Invalid

export interface PropertyDescriptor<N, T> {
  read: (node: N) => T
  normalize: (value: unknown, current: T) => NormalizeResult<T>
  equal: (current: T, next: T) => boolean
  apply: (node: N, value: T) => void
}

type PropertyRegistry<N, M> = {
  [K in keyof M]: PropertyDescriptor<N, M[K]>
}

const validBackgroundRepeat = new Set(['repeat', 'no-repeat'])
const validBackgroundSize = new Set(['unset', 'cover', 'contain'])
const validBackgroundPosition = new Set(['top', 'center', 'bottom', 'left', 'right'])

function hasOnlyKeys(value: object, keys: readonly string[]) {
  const allowed = new Set(keys)
  return Object.keys(value).every(key => allowed.has(key))
}

function normalized<T>(value: T): Normalized<T> {
  return { ok: true, value }
}

function invalid(): Invalid {
  return { ok: false }
}

function normalizeColor(value: unknown, allowTransparent = false): NormalizeResult<string> {
  const color = normalizeEmailColor(value, { allowTransparent })
  return color ? normalized(color) : invalid()
}

function isInsets(value: unknown): value is Insets {
  return (
    Array.isArray(value)
    && value.length === 4
    && value.every(item => typeof item === 'number' && Number.isFinite(item))
  )
}

function normalizeSpacing(value: unknown, current: SpacingValue): NormalizeResult<SpacingValue> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return invalid()

  const patch = value as Partial<SpacingValue>
  if (!hasOnlyKeys(patch, ['padding', 'margin']))
    return invalid()
  const next: SpacingValue = { ...current }

  if ('padding' in patch) {
    if (patch.padding !== undefined && !isInsets(patch.padding))
      return invalid()
    next.padding = patch.padding ? [...patch.padding] : undefined
  }

  if ('margin' in patch) {
    if (patch.margin !== undefined && !isInsets(patch.margin))
      return invalid()
    next.margin = patch.margin ? [...patch.margin] : undefined
  }

  return normalized(next)
}

function normalizeBackgroundImage(value: unknown): NormalizeResult<BackgroundImageValue> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return invalid()

  const image = value as Partial<BackgroundImageValue>
  if (
    !hasOnlyKeys(image, ['url', 'repeat', 'size', 'position'])
    || typeof image.url !== 'string'
    || !image.repeat
    || !validBackgroundRepeat.has(image.repeat)
    || !image.size
    || !validBackgroundSize.has(image.size)
    || !image.position
    || !validBackgroundPosition.has(image.position)
  ) {
    return invalid()
  }

  return normalized({
    url: image.url,
    repeat: image.repeat,
    size: image.size,
    position: image.position,
  })
}

function normalizeString(value: unknown): NormalizeResult<string> {
  return typeof value === 'string' ? normalized(value) : invalid()
}

function normalizeTrimmedString(value: unknown): NormalizeResult<string> {
  return typeof value === 'string' ? normalized(value.trim()) : invalid()
}

function normalizeBoolean(value: unknown): NormalizeResult<boolean> {
  return typeof value === 'boolean' ? normalized(value) : invalid()
}

function normalizeFinite(value: unknown): NormalizeResult<number> {
  return typeof value === 'number' && Number.isFinite(value) ? normalized(value) : invalid()
}

function normalizeNonNegative(value: unknown): NormalizeResult<number> {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? normalized(value)
    : invalid()
}

function normalizeBorderRadius(value: unknown): NormalizeResult<BorderRadiusValue> {
  const radius = normalizeBorderRadiusValue(value)
  return radius === undefined ? invalid() : normalized(radius)
}

function normalizePositiveOptional(value: unknown): NormalizeResult<number | undefined> {
  if (value === undefined)
    return normalized(undefined)
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? normalized(value)
    : invalid()
}

function jsonEqual<T>(current: T, next: T) {
  return JSON.stringify(current) === JSON.stringify(next)
}

function borderDescriptor<N extends BlockNode | RowNode | CellNode>() {
  return defineDescriptor<N, BorderValue | undefined>({
    read: node => node.settings.border,
    normalize: (value) => {
      if (value === undefined)
        return normalized(undefined)
      const border = normalizeBorderValue(value)
      return border ? normalized(border) : invalid()
    },
    equal: jsonEqual,
    apply: (node, value) => {
      node.settings.border = value
    },
  })
}

function atomBorderDescriptor<N extends TextAtom | ButtonAtom | ImageAtom>() {
  return defineDescriptor<N, BorderValue | undefined>({
    read: node => node.border,
    normalize: (value) => {
      if (value === undefined)
        return normalized(undefined)
      const border = normalizeBorderValue(value)
      return border ? normalized(border) : invalid()
    },
    equal: jsonEqual,
    apply: (node, value) => {
      node.border = value
    },
  })
}

function strictEqual<T>(current: T, next: T) {
  return current === next
}

function defineDescriptor<N, T>(descriptor: PropertyDescriptor<N, T>) {
  return descriptor
}

const blockSpacing = defineDescriptor<BlockNode, SpacingValue>({
  read: node => node.settings.spacing,
  normalize: normalizeSpacing,
  equal: jsonEqual,
  apply: (node, value) => {
    node.settings.spacing = value
  },
})

const rowSpacing = defineDescriptor<RowNode, SpacingValue>({
  read: node => node.settings.spacing,
  normalize: normalizeSpacing,
  equal: jsonEqual,
  apply: (node, value) => {
    node.settings.spacing = value
  },
})

const cellSpacing = defineDescriptor<CellNode, SpacingValue>({
  read: node => node.settings.spacing,
  normalize: normalizeSpacing,
  equal: jsonEqual,
  apply: (node, value) => {
    node.settings.spacing = value
  },
})

function atomSpacing<T extends Atom>() {
  return defineDescriptor<T, SpacingValue>({
    read: node => node.spacing ?? {},
    normalize: normalizeSpacing,
    equal: jsonEqual,
    apply: (node, value) => {
      node.spacing = value
    },
  })
}

function atomVisibility<T extends Atom>() {
  return defineDescriptor<T, boolean>({
    read: node => node.hiddenOnMobile ?? false,
    normalize: normalizeBoolean,
    equal: strictEqual,
    apply: (node, value) => {
      node.hiddenOnMobile = value
    },
  })
}

function opacityDescriptor<N extends BlockNode | RowNode | CellNode | Atom>(
  readValue: (node: N) => number | undefined,
  applyValue: (node: N, value: number | undefined) => void,
) {
  return defineDescriptor<N, number>({
    read: node => resolveOpacity(readValue(node)),
    normalize: (value) => {
      const opacity = normalizeOpacity(value)
      return opacity === undefined ? invalid() : normalized(opacity)
    },
    equal: strictEqual,
    apply: (node, value) => {
      applyValue(node, value === 100 ? undefined : value)
    },
  })
}

export const blockPropertyRegistry = {
  spacing: blockSpacing,
  opacity: opacityDescriptor<BlockNode>(
    node => node.settings.opacity,
    (node, value) => {
      if (value === undefined)
        delete node.settings.opacity
      else node.settings.opacity = value
    },
  ),
  backgroundColor: defineDescriptor<BlockNode, string>({
    read: node => node.settings.backgroundColor,
    normalize: value => normalizeColor(value, true),
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.backgroundColor = value
    },
  }),
  backgroundImage: defineDescriptor<BlockNode, BackgroundImageValue>({
    read: node =>
      node.settings.backgroundImage ?? {
        url: '',
        repeat: 'no-repeat',
        size: 'cover',
        position: 'center',
      },
    normalize: normalizeBackgroundImage,
    equal: jsonEqual,
    apply: (node, value) => {
      node.settings.backgroundImage = value
    },
  }),
  borderRadius: defineDescriptor<BlockNode, BorderRadiusValue>({
    read: node => node.settings.borderRadius ?? createBorderRadiusValue(0),
    normalize: normalizeBorderRadius,
    equal: jsonEqual,
    apply: (node, value) => {
      node.settings.borderRadius = value
    },
  }),
  border: borderDescriptor<BlockNode>(),
} satisfies PropertyRegistry<BlockNode, BlockPropertyMap>

export const rowPropertyRegistry = {
  spacing: rowSpacing,
  opacity: opacityDescriptor<RowNode>(
    node => node.settings.opacity,
    (node, value) => {
      if (value === undefined)
        delete node.settings.opacity
      else node.settings.opacity = value
    },
  ),
  backgroundColor: defineDescriptor<RowNode, string>({
    read: node => node.settings.backgroundColor,
    normalize: value => normalizeColor(value, true),
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.backgroundColor = value
    },
  }),
  backgroundImage: defineDescriptor<RowNode, BackgroundImageValue>({
    read: node =>
      node.settings.backgroundImage ?? {
        url: '',
        repeat: 'no-repeat',
        size: 'cover',
        position: 'center',
      },
    normalize: normalizeBackgroundImage,
    equal: jsonEqual,
    apply: (node, value) => {
      node.settings.backgroundImage = value
    },
  }),
  borderRadius: defineDescriptor<RowNode, BorderRadiusValue>({
    read: node => node.settings.borderRadius ?? createBorderRadiusValue(0),
    normalize: normalizeBorderRadius,
    equal: jsonEqual,
    apply: (node, value) => {
      node.settings.borderRadius = value
    },
  }),
  border: borderDescriptor<RowNode>(),
  widthMode: defineDescriptor<RowNode, 'fill' | 'hug'>({
    read: node => node.settings.widthMode,
    normalize: value => (value === 'fill' || value === 'hug' ? normalized(value) : invalid()),
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.widthMode = value
    },
  }),
  gap: defineDescriptor<RowNode, number>({
    read: node => node.settings.gap,
    normalize: normalizeNonNegative,
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.gap = value
    },
  }),
  height: defineDescriptor<RowNode, number | undefined>({
    read: node => node.settings.height,
    normalize: normalizePositiveOptional,
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.height = value
    },
  }),
  hiddenOnMobile: defineDescriptor<RowNode, boolean>({
    read: node => node.settings.hiddenOnMobile ?? false,
    normalize: normalizeBoolean,
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.hiddenOnMobile = value
    },
  }),
  collapseOnMobile: defineDescriptor<RowNode, boolean>({
    read: node => node.settings.collapseOnMobile !== false,
    normalize: normalizeBoolean,
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.collapseOnMobile = value
    },
  }),
} satisfies PropertyRegistry<RowNode, RowPropertyMap>

export const cellPropertyRegistry = {
  spacing: cellSpacing,
  opacity: opacityDescriptor<CellNode>(
    node => node.settings.opacity,
    (node, value) => {
      if (value === undefined)
        delete node.settings.opacity
      else node.settings.opacity = value
    },
  ),
  backgroundColor: defineDescriptor<CellNode, string>({
    read: node => node.settings.backgroundColor,
    normalize: value => normalizeColor(value, true),
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.backgroundColor = value
    },
  }),
  backgroundImage: defineDescriptor<CellNode, BackgroundImageValue>({
    read: node =>
      node.settings.backgroundImage ?? {
        url: '',
        repeat: 'no-repeat',
        size: 'cover',
        position: 'center',
      },
    normalize: normalizeBackgroundImage,
    equal: jsonEqual,
    apply: (node, value) => {
      node.settings.backgroundImage = value
    },
  }),
  border: borderDescriptor<CellNode>(),
  link: defineDescriptor<CellNode, string>({
    read: node => node.settings.link ?? '',
    normalize: normalizeTrimmedString,
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.link = value.trim() || undefined
    },
  }),
  hiddenOnMobile: defineDescriptor<CellNode, boolean>({
    read: node => node.settings.hiddenOnMobile ?? false,
    normalize: normalizeBoolean,
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.hiddenOnMobile = value
    },
  }),
  verticalAlign: defineDescriptor<CellNode, 'top' | 'middle' | 'bottom'>({
    read: node => node.settings.verticalAlign,
    normalize: value =>
      value === 'top' || value === 'middle' || value === 'bottom' ? normalized(value) : invalid(),
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.verticalAlign = value
    },
  }),
  horizontalAlign: defineDescriptor<CellNode, 'left' | 'center' | 'right'>({
    read: node => node.settings.horizontalAlign ?? 'left',
    normalize: value =>
      value === 'left' || value === 'center' || value === 'right' ? normalized(value) : invalid(),
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.horizontalAlign = value
    },
  }),
  borderRadius: defineDescriptor<CellNode, BorderRadiusValue>({
    read: node => node.settings.borderRadius ?? createBorderRadiusValue(0),
    normalize: normalizeBorderRadius,
    equal: jsonEqual,
    apply: (node, value) => {
      node.settings.borderRadius = value
    },
  }),
  width: defineDescriptor<CellNode, number | undefined>({
    read: node => node.settings.width,
    normalize: normalizePositiveOptional,
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.width = value
    },
  }),
  height: defineDescriptor<CellNode, number | undefined>({
    read: node => node.settings.height,
    normalize: normalizePositiveOptional,
    equal: strictEqual,
    apply: (node, value) => {
      node.settings.height = value
    },
  }),
} satisfies PropertyRegistry<CellNode, CellPropertyMap>

type TextAtom = Extract<Atom, { type: 'text' }>
type ButtonAtom = Extract<Atom, { type: 'button' }>
type DividerAtom = Extract<Atom, { type: 'divider' }>
type ImageAtom = Extract<Atom, { type: 'image' }>

export const atomPropertyRegistry = {
  text: {
    spacing: atomSpacing<TextAtom>(),
    hiddenOnMobile: atomVisibility<TextAtom>(),
    opacity: opacityDescriptor<TextAtom>(
      node => node.opacity,
      (node, value) => {
        if (value === undefined)
          delete node.opacity
        else node.opacity = value
      },
    ),
    borderRadius: defineDescriptor<TextAtom, BorderRadiusValue>({
      read: node => node.borderRadius ?? createBorderRadiusValue(0),
      normalize: normalizeBorderRadius,
      equal: jsonEqual,
      apply: (node, value) => {
        node.borderRadius = value
      },
    }),
    border: atomBorderDescriptor<TextAtom>(),
    widthMode: defineDescriptor<TextAtom, 'fill' | 'hug' | undefined>({
      read: node => node.widthMode,
      normalize: value =>
        value === undefined || value === 'fill' || value === 'hug' ? normalized(value) : invalid(),
      equal: strictEqual,
      apply: (node, value) => {
        node.widthMode = value
      },
    }),
    paragraphSpacing: defineDescriptor<TextAtom, number | undefined>({
      read: node => node.paragraphSpacing,
      normalize: (value) => {
        if (value === undefined)
          return normalized(undefined)
        return typeof value === 'number' && Number.isFinite(value) && value >= 0
          ? normalized(value)
          : invalid()
      },
      equal: strictEqual,
      apply: (node, value) => {
        node.paragraphSpacing = value
      },
    }),
    value: defineDescriptor<TextAtom, string>({
      read: node => node.value,
      normalize: value =>
        typeof value === 'string' ? normalized(sanitizeTextEditorHtml(value)) : invalid(),
      equal: strictEqual,
      apply: (node, value) => {
        node.value = value
      },
    }),
  },
  button: {
    spacing: defineDescriptor<ButtonAtom, SpacingValue>({
      read: node => node.spacing ?? { padding: [...node.padding] },
      normalize: normalizeSpacing,
      equal: jsonEqual,
      apply: (node, value) => {
        node.spacing = value
        if (value.padding)
          node.padding = [...value.padding]
      },
    }),
    hiddenOnMobile: atomVisibility<ButtonAtom>(),
    opacity: opacityDescriptor<ButtonAtom>(
      node => node.opacity,
      (node, value) => {
        if (value === undefined)
          delete node.opacity
        else node.opacity = value
      },
    ),
    border: atomBorderDescriptor<ButtonAtom>(),
    text: defineDescriptor<ButtonAtom, string>({
      read: node => node.text,
      normalize: normalizeString,
      equal: strictEqual,
      apply: (node, value) => {
        node.text = value
      },
    }),
    link: defineDescriptor<ButtonAtom, string>({
      read: node => node.link,
      normalize: normalizeString,
      equal: strictEqual,
      apply: (node, value) => {
        node.link = value
      },
    }),
    backgroundColor: defineDescriptor<ButtonAtom, string>({
      read: node => node.backgroundColor,
      normalize: value => normalizeColor(value),
      equal: strictEqual,
      apply: (node, value) => {
        node.backgroundColor = value
      },
    }),
    color: defineDescriptor<ButtonAtom, string>({
      read: node => node.color,
      normalize: value => normalizeColor(value),
      equal: strictEqual,
      apply: (node, value) => {
        node.color = value
      },
    }),
    fontSize: defineDescriptor<ButtonAtom, number>({
      read: node => node.fontSize,
      normalize: normalizeFinite,
      equal: strictEqual,
      apply: (node, value) => {
        node.fontSize = value
      },
    }),
    borderRadius: defineDescriptor<ButtonAtom, BorderRadiusValue>({
      read: node => node.borderRadius,
      normalize: normalizeBorderRadius,
      equal: jsonEqual,
      apply: (node, value) => {
        node.borderRadius = value
      },
    }),
  },
  divider: {
    spacing: atomSpacing<DividerAtom>(),
    hiddenOnMobile: atomVisibility<DividerAtom>(),
    opacity: opacityDescriptor<DividerAtom>(
      node => node.opacity,
      (node, value) => {
        if (value === undefined)
          delete node.opacity
        else node.opacity = value
      },
    ),
    color: defineDescriptor<DividerAtom, string>({
      read: node => node.color,
      normalize: value => normalizeColor(value),
      equal: strictEqual,
      apply: (node, value) => {
        node.color = value
      },
    }),
    height: defineDescriptor<DividerAtom, number>({
      read: node => node.height,
      normalize: normalizeFinite,
      equal: strictEqual,
      apply: (node, value) => {
        node.height = value
      },
    }),
  },
  image: {
    spacing: atomSpacing<ImageAtom>(),
    hiddenOnMobile: atomVisibility<ImageAtom>(),
    opacity: opacityDescriptor<ImageAtom>(
      node => node.opacity,
      (node, value) => {
        if (value === undefined)
          delete node.opacity
        else node.opacity = value
      },
    ),
    border: atomBorderDescriptor<ImageAtom>(),
    src: defineDescriptor<ImageAtom, string>({
      read: node => node.src,
      normalize: normalizeString,
      equal: strictEqual,
      apply: (node, value) => {
        node.src = value
      },
    }),
    alt: defineDescriptor<ImageAtom, string>({
      read: node => node.alt,
      normalize: normalizeString,
      equal: strictEqual,
      apply: (node, value) => {
        node.alt = value
      },
    }),
    link: defineDescriptor<ImageAtom, string>({
      read: node => node.link,
      normalize: normalizeString,
      equal: strictEqual,
      apply: (node, value) => {
        node.link = value
      },
    }),
    width: defineDescriptor<ImageAtom, number | undefined>({
      read: node => node.width,
      normalize: normalizePositiveOptional,
      equal: strictEqual,
      apply: (node, value) => {
        node.width = value
      },
    }),
    height: defineDescriptor<ImageAtom, number | undefined>({
      read: node => node.height,
      normalize: normalizePositiveOptional,
      equal: strictEqual,
      apply: (node, value) => {
        node.height = value
      },
    }),
    borderRadius: defineDescriptor<ImageAtom, BorderRadiusValue>({
      read: node => node.borderRadius ?? createBorderRadiusValue(0),
      normalize: normalizeBorderRadius,
      equal: jsonEqual,
      apply: (node, value) => {
        node.borderRadius = value
      },
    }),
  },
} satisfies {
  [T in AtomType]: PropertyRegistry<Extract<Atom, { type: T }>, AtomPropertyMap[T]>
}

export const inspectorCapabilities = {
  block: Object.keys(blockPropertyRegistry) as Array<keyof BlockPropertyMap>,
  row: Object.keys(rowPropertyRegistry) as Array<keyof RowPropertyMap>,
  cell: Object.keys(cellPropertyRegistry) as Array<keyof CellPropertyMap>,
  text: Object.keys(atomPropertyRegistry.text) as Array<keyof AtomPropertyMap['text']>,
  button: Object.keys(atomPropertyRegistry.button) as Array<keyof AtomPropertyMap['button']>,
  divider: Object.keys(atomPropertyRegistry.divider) as Array<keyof AtomPropertyMap['divider']>,
  image: Object.keys(atomPropertyRegistry.image) as Array<keyof AtomPropertyMap['image']>,
}
