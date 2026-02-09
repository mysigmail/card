import { normalizePath } from '@/store/components/utils'
import type {
  AlignTool,
  BackgroundImageTool,
  ColorPickerTool,
  ImageTool,
  InputNumberTool,
  InputTool,
  MultiTool,
  PaddingTool,
  SpacingTool,
  TextEditorTool,
  ToggleTool,
  Tool,
} from '@/types/editor'
import type { Menu, Social } from '@/types/email-components/components'

export type SchemaGroupModel = Record<string, unknown>

export interface SchemaGroupReadContext {
  group: string
  tools: Tool[]
}

export type SchemaGroupAdapter = (context: SchemaGroupReadContext) => SchemaGroupModel

interface GroupValues {
  align?: AlignTool['value']
  show?: ToggleTool['value']
  image?: ImageTool['value']
  list?: MultiTool['value']
  text?: TextEditorTool['value']
  spacing?: SpacingTool['value']
  padding?: PaddingTool['value']
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

function readGroupValues(tools: Tool[]): GroupValues {
  return {
    align: findToolByKey<AlignTool>(tools, 'align', 'align')?.value,
    show: findToolByKey<ToggleTool>(tools, 'showHide', 'toggle')?.value,
    image: findToolByKey<ImageTool>(tools, 'image', 'image')?.value,
    list: findToolByKey<MultiTool>(tools, 'list', 'multi')?.value,
    text: findToolByKey<TextEditorTool>(tools, 'content', 'textEditor')?.value,
    spacing: findToolByKey<SpacingTool>(tools, 'spacings', 'spacing')?.value,
    padding: findToolByKey<PaddingTool>(tools, 'padding', 'padding')?.value,
    backgroundColor: findToolByKey<ColorPickerTool>(tools, 'backgroundColor', 'colorPicker')?.value,
    mainColor: findToolByKey<ColorPickerTool>(tools, 'mainColor', 'colorPicker')?.value,
    color: findToolByKey<ColorPickerTool>(tools, 'color', 'colorPicker')?.value,
    backgroundImage: findToolByKey<BackgroundImageTool>(tools, 'backgroundImage', 'bgImage')?.value,
  }
}

function createBaseModel(values: GroupValues, items?: Menu[] | Social[]): SchemaGroupModel {
  const insets = toInsets(values.spacing?.padding || values.padding)
  const margin = toInsets(values.spacing?.margin)

  return {
    align: values.align,
    attrs: undefined,
    color: values.color,
    image: values.image,
    items: items || readMenuItems(values.list),
    link: values.image?.link,
    margin,
    padding: insets,
    show: values.show,
    value: values.text,
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

function logoGroupAdapter({ tools }: SchemaGroupReadContext): SchemaGroupModel {
  const values = readGroupValues(tools)

  return {
    ...createBaseModel(values),
    attrs: readImageAttrs(values.image),
  }
}

function textGroupAdapter({ tools }: SchemaGroupReadContext): SchemaGroupModel {
  const values = readGroupValues(tools)
  const bgImage = readBackgroundImage(values.backgroundImage)

  return {
    ...createBaseModel(values),
    attrs: {
      style: {
        color: values.mainColor,
        padding: toInsets(values.spacing?.padding || values.padding),
        backgroundImage: bgImage?.url,
        backgroundSize: bgImage?.size,
        backgroundRepeat: bgImage?.repeat,
        backgroundPosition: bgImage?.position,
      },
    } as HTMLElement,
  }
}

function socialGroupAdapter({ tools }: SchemaGroupReadContext): SchemaGroupModel {
  const values = readGroupValues(tools)

  return createBaseModel(values, readSocialItems(values.list))
}

const builtInGroupAdapters: Record<string, SchemaGroupAdapter> = {
  Layout: layoutGroupAdapter,
  Logo: logoGroupAdapter,
  Social: socialGroupAdapter,
  Text: textGroupAdapter,
}

const customGroupAdapters = new Map<string, SchemaGroupAdapter>()

export function registerSchemaGroupAdapter(group: string, adapter: SchemaGroupAdapter) {
  customGroupAdapters.set(group, adapter)
}

export function unregisterSchemaGroupAdapter(group: string) {
  customGroupAdapters.delete(group)
}

export function resolveSchemaGroupAdapter(group: string): SchemaGroupAdapter {
  return customGroupAdapters.get(group) || builtInGroupAdapters[group] || defaultGroupAdapter
}
