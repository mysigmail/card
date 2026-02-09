import type {
  AlignTool,
  BackgroundImageTool,
  ColorPickerTool,
  GridTool,
  ImageTool,
  InputNumberTool,
  InputTool,
  MultiTool,
  PaddingTool,
  SpacingTool,
  TextEditorTool,
  ToggleTool,
  Tool,
  ToolGroupRole,
} from '@/types/editor'
import type { GridItem, Menu, Social } from '@/types/email-components/components'
import { normalizePath } from '@/store/components/utils'

export type SchemaGroupModel = Record<string, unknown>

export interface SchemaGroupReadContext {
  groupId: string
  groupRole: ToolGroupRole
  tools: Tool[]
}

export type SchemaGroupAdapter = (context: SchemaGroupReadContext) => SchemaGroupModel

interface GroupValues {
  align?: AlignTool['value']
  show?: ToggleTool['value']
  image?: ImageTool['value']
  link?: InputTool['value']
  list?: MultiTool['value']
  grid?: GridTool['value']
  gap?: InputNumberTool['value']
  text?: TextEditorTool['value']
  spacing?: SpacingTool['value']
  padding?: PaddingTool['value']
  columnWidth?: InputNumberTool['value']
  backgroundColor?: ColorPickerTool['value']
  mainColor?: ColorPickerTool['value']
  color?: ColorPickerTool['value']
  backgroundImage?: BackgroundImageTool['value']
}

function findToolByKey<T extends Tool>(tools: Tool[], key: string, type?: T['type']) {
  return tools.find((tool) => {
    if (type && tool.type !== type)
      return false

    return tool.key === key
  }) as T | undefined
}

function toInsets(values?: [number, number, number, number]) {
  return values?.map(i => `${i}px`).join(' ')
}

function toColumnWidth(value?: InputNumberTool['value']) {
  if (value === undefined || value === null)
    return undefined

  const normalized = Number(value)

  if (!Number.isFinite(normalized))
    return undefined

  const clamped = Math.min(100, Math.max(0, normalized))

  return `${clamped}%`
}

function toGap(value?: InputNumberTool['value']) {
  if (value === undefined || value === null)
    return undefined

  const normalized = Number(value)

  if (!Number.isFinite(normalized))
    return undefined

  return `${Math.max(0, normalized)}px`
}

function readBackgroundImage(tool?: BackgroundImageTool['value']) {
  if (!tool)
    return undefined

  const normalized = normalizePath(tool.url)

  return {
    url: normalized ? `url(${normalized})` : '',
    size: tool.size,
    repeat: tool.repeat,
    position: tool.position,
  }
}

function readImageAttrs(image?: ImageTool['value']) {
  if (!image)
    return undefined

  return {
    src: image.src,
    alt: image.alt,
    style: {
      width: image.width ? `${image.width}px` : undefined,
      height: image.height ? `${image.height}px` : undefined,
    },
  } as HTMLImageElement
}

function buildImageBlockValue(value: string | undefined, height?: number) {
  if (value)
    return value

  if (height !== undefined) {
    const normalizedHeight = Math.max(0, Number(height))
    const minHeight = `${normalizedHeight}px`

    return `<span style="display:block;min-height:${minHeight};line-height:${minHeight};font-size:0;">&nbsp;</span>`
  }

  return '&nbsp;'
}

function readMenuItems(items?: MultiTool['value']) {
  if (!items?.length)
    return undefined

  return items.map((item) => {
    return {
      text: findToolByKey<InputTool>(item.tools, 'name', 'input')?.value || '',
      link: findToolByKey<InputTool>(item.tools, 'link', 'input')?.value || '',
      color: findToolByKey<ColorPickerTool>(item.tools, 'color', 'colorPicker')?.value || '',
      fontSize: findToolByKey<InputNumberTool>(item.tools, 'fontSize', 'inputNumber')?.value || 16,
    } satisfies Menu
  })
}

function readSocialItems(items?: MultiTool['value']) {
  if (!items?.length)
    return undefined

  return items
    .map((item) => {
      const image = findToolByKey<ImageTool>(item.tools, 'image', 'image')?.value
      const link = findToolByKey<InputTool>(item.tools, 'link', 'input')?.value || ''

      if (!image)
        return undefined

      return {
        image,
        link,
      } satisfies Social
    })
    .filter(Boolean) as Social[]
}

function readTextAttrs(tools: Tool[], values: GroupValues) {
  const bgImage = readBackgroundImage(values.backgroundImage)
  const borderRadius = findToolByKey<InputNumberTool>(tools, 'borderRadius', 'inputNumber')?.value

  return {
    style: {
      borderRadius:
        borderRadius !== undefined ? `${Math.max(0, Number(borderRadius))}px` : undefined,
      overflow: borderRadius !== undefined ? 'hidden' : undefined,
      color: values.mainColor,
      padding: toInsets(values.spacing?.padding || values.padding),
      backgroundImage: bgImage?.url,
      backgroundSize: bgImage?.size,
      backgroundRepeat: bgImage?.repeat,
      backgroundPosition: bgImage?.position,
    },
  } satisfies Record<string, unknown>
}

function readButtonAttrs(tools: Tool[], values: GroupValues) {
  const link = findToolByKey<InputTool>(tools, 'link', 'input')?.value
  const borderRadius = findToolByKey<InputNumberTool>(tools, 'borderRadius', 'inputNumber')?.value
  const fontSize = findToolByKey<InputNumberTool>(tools, 'fontSize', 'inputNumber')?.value

  return {
    href: link,
    style: {
      backgroundColor: values.backgroundColor,
      borderRadius: borderRadius !== undefined ? `${borderRadius}px` : undefined,
      color: values.color,
      fontSize: fontSize !== undefined ? `${fontSize}px` : undefined,
      fontWeight: 700,
      margin: toInsets(values.spacing?.margin),
      padding: toInsets(values.spacing?.padding || values.padding),
      textDecoration: 'none',
    },
  } satisfies Record<string, unknown>
}

function readGridItems(items?: GridTool['value']) {
  if (!items?.length)
    return undefined

  return items
    .map((item) => {
      const values = readGroupValues(item.tools)
      const contents = item.tools
        .map((tool) => {
          if (tool.type === 'image' && tool.key === 'image') {
            const attrs = readImageAttrs(tool.value)

            if (!attrs)
              return undefined

            return {
              type: 'image',
              attrs,
              link: tool.value.link,
            } as const
          }

          if (tool.type === 'textEditor' && tool.key === 'content') {
            return {
              type: 'text',
              attrs: readTextAttrs(item.tools, values),
              value: tool.value,
            } as const
          }

          if (tool.type === 'input' && tool.key === 'text') {
            return {
              type: 'button',
              attrs: readButtonAttrs(item.tools, values),
              text: tool.value,
            } as const
          }

          if (tool.type === 'multi' && tool.key === 'list') {
            const isSocial = tool.value.some(entry =>
              entry.tools.some(itemTool => itemTool.type === 'image' && itemTool.key === 'image'),
            )

            if (isSocial) {
              const socials = readSocialItems(tool.value)
              if (!socials?.length)
                return undefined

              return {
                type: 'social',
                items: socials,
              } as const
            }

            const menu = readMenuItems(tool.value)
            if (!menu?.length)
              return undefined

            return {
              type: 'menu',
              items: menu,
            } as const
          }

          return undefined
        })
        .filter(Boolean) as GridItem['contents']

      if (!contents.length)
        return undefined

      return {
        align: values.align,
        contents,
        show: values.show,
      } satisfies GridItem
    })
    .filter(Boolean) as GridItem[]
}

function readGroupValues(tools: Tool[]): GroupValues {
  return {
    align: findToolByKey<AlignTool>(tools, 'align', 'align')?.value,
    show: findToolByKey<ToggleTool>(tools, 'showHide', 'toggle')?.value,
    image: findToolByKey<ImageTool>(tools, 'image', 'image')?.value,
    link: findToolByKey<InputTool>(tools, 'link', 'input')?.value,
    list: findToolByKey<MultiTool>(tools, 'list', 'multi')?.value,
    grid: findToolByKey<GridTool>(tools, 'grid', 'grid')?.value,
    gap: findToolByKey<InputNumberTool>(tools, 'gap', 'inputNumber')?.value,
    text: findToolByKey<TextEditorTool>(tools, 'content', 'textEditor')?.value,
    spacing: findToolByKey<SpacingTool>(tools, 'spacings', 'spacing')?.value,
    padding: findToolByKey<PaddingTool>(tools, 'padding', 'padding')?.value,
    columnWidth: findToolByKey<InputNumberTool>(tools, 'columnWidth', 'inputNumber')?.value,
    backgroundColor: findToolByKey<ColorPickerTool>(tools, 'backgroundColor', 'colorPicker')?.value,
    mainColor: findToolByKey<ColorPickerTool>(tools, 'mainColor', 'colorPicker')?.value,
    color: findToolByKey<ColorPickerTool>(tools, 'color', 'colorPicker')?.value,
    backgroundImage: findToolByKey<BackgroundImageTool>(tools, 'backgroundImage', 'bgImage')?.value,
  }
}

function createBaseModel(
  values: GroupValues,
  items?: Menu[] | Social[] | GridItem[],
): SchemaGroupModel {
  const insets = toInsets(values.spacing?.padding || values.padding)
  const margin = toInsets(values.spacing?.margin)

  return {
    align: values.align,
    attrs: undefined,
    color: values.color,
    image: values.image,
    items: items || readMenuItems(values.list),
    link: values.link || values.image?.link,
    margin,
    gap: toGap(values.gap),
    padding: insets,
    show: values.show,
    value: values.text,
    width: toColumnWidth(values.columnWidth),
  }
}

function defaultGroupAdapter({ tools }: SchemaGroupReadContext): SchemaGroupModel {
  const values = readGroupValues(tools)

  return createBaseModel(values)
}

function layoutGroupAdapter({ tools }: SchemaGroupReadContext): SchemaGroupModel {
  const values = readGroupValues(tools)
  const bgImage = readBackgroundImage(values.backgroundImage)

  return {
    ...createBaseModel(values),
    attrs: {
      style: {
        padding: toInsets(values.spacing?.padding || values.padding),
        backgroundColor: values.backgroundColor,
        backgroundImage: bgImage?.url,
        backgroundSize: bgImage?.size,
        backgroundRepeat: bgImage?.repeat,
        backgroundPosition: bgImage?.position,
      },
    } as HTMLElement,
  }
}

function textGroupAdapter({ tools }: SchemaGroupReadContext): SchemaGroupModel {
  const values = readGroupValues(tools)

  return {
    ...createBaseModel(values),
    attrs: readTextAttrs(tools, values) as HTMLElement,
  }
}

function imageGroupAdapter({ tools }: SchemaGroupReadContext): SchemaGroupModel {
  const values = readGroupValues(tools)

  return {
    ...createBaseModel(values),
    attrs: readImageAttrs(values.image),
  }
}

function imageBlockGroupAdapter({ tools }: SchemaGroupReadContext): SchemaGroupModel {
  const values = readGroupValues(tools)
  const borderRadius = findToolByKey<InputNumberTool>(tools, 'borderRadius', 'inputNumber')?.value
  const height = findToolByKey<InputNumberTool>(tools, 'height', 'inputNumber')?.value
  const bgImage = readBackgroundImage(values.backgroundImage)
  const normalizedHeight = height !== undefined ? Math.max(0, Number(height)) : undefined

  return {
    ...createBaseModel(values),
    attrs: {
      style: {
        backgroundImage: bgImage?.url,
        backgroundPosition: bgImage?.position,
        backgroundRepeat: bgImage?.repeat,
        backgroundSize: bgImage?.size,
        borderRadius:
          borderRadius !== undefined ? `${Math.max(0, Number(borderRadius))}px` : undefined,
        overflow: borderRadius !== undefined ? 'hidden' : undefined,
        height: normalizedHeight !== undefined ? `${normalizedHeight}px` : undefined,
        fontSize: '0',
        lineHeight: '0',
        width: '100%',
      },
    } as HTMLElement,
    value: buildImageBlockValue(values.text, normalizedHeight),
  }
}

function socialGroupAdapter({ tools }: SchemaGroupReadContext): SchemaGroupModel {
  const values = readGroupValues(tools)

  return createBaseModel(values, readSocialItems(values.list))
}

function gridGroupAdapter({ tools }: SchemaGroupReadContext): SchemaGroupModel {
  const values = readGroupValues(tools)

  return createBaseModel(values, readGridItems(values.grid))
}

function buttonGroupAdapter({ tools }: SchemaGroupReadContext): SchemaGroupModel {
  const values = readGroupValues(tools)
  const text = findToolByKey<InputTool>(tools, 'text', 'input')?.value

  return {
    ...createBaseModel(values),
    attrs: readButtonAttrs(tools, values),
    text,
  }
}

const builtInGroupAdapters: Record<string, SchemaGroupAdapter> = {
  button: buttonGroupAdapter,
  divider: defaultGroupAdapter,
  grid: gridGroupAdapter,
  image: imageGroupAdapter,
  imageBlock: imageBlockGroupAdapter,
  layout: layoutGroupAdapter,
  menu: defaultGroupAdapter,
  social: socialGroupAdapter,
  text: textGroupAdapter,
}

const customGroupAdapters = new Map<string, SchemaGroupAdapter>()

export function registerSchemaGroupAdapter(role: string, adapter: SchemaGroupAdapter) {
  customGroupAdapters.set(role, adapter)
}

export function unregisterSchemaGroupAdapter(role: string) {
  customGroupAdapters.delete(role)
}

export function resolveSchemaGroupAdapter(role: string): SchemaGroupAdapter {
  return customGroupAdapters.get(role) || builtInGroupAdapters[role] || defaultGroupAdapter
}
