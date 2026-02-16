import type { MenuAtom } from '@/entities/block'
import type {
  BackgroundImageTool,
  ImageTool,
  MultiTool,
  SpacingTool,
  Tool,
} from '@/features/editor/model'
import { computed, ref, watch } from 'vue'
import { useSelection } from '@/features/editor/model'

export type DimensionMode = 'auto' | 'manual'

export const DEFAULT_BACKGROUND_IMAGE: BackgroundImageTool['value'] = {
  url: '',
  repeat: 'no-repeat',
  size: 'cover',
  position: 'center',
}

export const DEFAULT_TEXT_MAIN_COLOR = '#111827'

export const DEFAULT_IMAGE_VALUE: ImageTool['value'] = {
  src: '',
  alt: '',
  link: '',
}

export function normalizeBackgroundImage(
  value?: BackgroundImageTool['value'],
): BackgroundImageTool['value'] {
  return {
    ...DEFAULT_BACKGROUND_IMAGE,
    ...(value || {}),
  }
}

export function normalizeImageValue(value?: Partial<ImageTool['value']>): ImageTool['value'] {
  return {
    ...DEFAULT_IMAGE_VALUE,
    ...(value || {}),
    src: typeof value?.src === 'string' ? value.src : '',
    alt: typeof value?.alt === 'string' ? value.alt : '',
    link: typeof value?.link === 'string' ? value.link : '',
    width: typeof value?.width === 'number' ? value.width : undefined,
    height: typeof value?.height === 'number' ? value.height : undefined,
  }
}

export function normalizeSpacingValue(
  value?: SpacingTool['value'],
  fallbackPadding: [number, number, number, number] = [0, 0, 0, 0],
  options: {
    includeMargin?: boolean
    includePadding?: boolean
  } = {},
): SpacingTool['value'] {
  const includeMargin = options.includeMargin !== false
  const includePadding = options.includePadding !== false

  const normalized: SpacingTool['value'] = {}

  if (includeMargin) {
    normalized.margin
      = Array.isArray(value?.margin) && value.margin.length === 4
        ? (value.margin.map(i => Number(i) || 0) as [number, number, number, number])
        : ([0, 0, 0, 0] as [number, number, number, number])
  }

  if (includePadding) {
    normalized.padding
      = Array.isArray(value?.padding) && value.padding.length === 4
        ? (value.padding.map(i => Number(i) || 0) as [number, number, number, number])
        : ([...fallbackPadding] as [number, number, number, number])
  }

  return normalized
}

export function menuItemFieldToolId(atomId: string, index: number, field: string) {
  return `v2-atom::${atomId}::menuList::${index}::${field}`
}

export function menuItemGroupId(atomId: string, index: number) {
  return `v2-atom::${atomId}::menuListItem::${index}`
}

export function getMenuItemType(atom: MenuAtom): 'text' | 'image' {
  if (atom.itemType === 'image')
    return 'image'

  if (atom.itemType === 'text')
    return 'text'

  const first = atom.items[0]
  return first?.type === 'image' ? 'image' : 'text'
}

export function toMenuListToolValue(atom: MenuAtom): MultiTool['value'] {
  const itemType = getMenuItemType(atom)

  return atom.items.map((item, index) => ({
    id: menuItemGroupId(atom.id, index),
    tools:
      itemType === 'image'
        ? [
            {
              id: menuItemFieldToolId(atom.id, index, 'name'),
              key: 'name',
              label: 'Name',
              type: 'input',
              value: item.type === 'image' ? item.name : '',
            },
            {
              id: menuItemFieldToolId(atom.id, index, 'link'),
              key: 'link',
              label: 'Link',
              type: 'input',
              value: item.link,
            },
            {
              id: menuItemFieldToolId(atom.id, index, 'url'),
              key: 'url',
              label: 'URL',
              type: 'input',
              value: item.type === 'image' ? item.url : '',
            },
            {
              id: menuItemFieldToolId(atom.id, index, 'width'),
              key: 'width',
              label: 'Width',
              type: 'inputNumber',
              value: item.type === 'image' ? (item.width ?? 0) : 0,
            },
            {
              id: menuItemFieldToolId(atom.id, index, 'height'),
              key: 'height',
              label: 'Height',
              type: 'inputNumber',
              value: item.type === 'image' ? (item.height ?? 0) : 0,
            },
            {
              id: menuItemFieldToolId(atom.id, index, 'alt'),
              key: 'alt',
              label: 'Alt',
              type: 'input',
              value: item.type === 'image' ? item.alt : '',
            },
          ]
        : [
            {
              id: menuItemFieldToolId(atom.id, index, 'text'),
              key: 'name',
              label: 'Name',
              type: 'input',
              value: item.type === 'text' ? item.text : '',
            },
            {
              id: menuItemFieldToolId(atom.id, index, 'link'),
              key: 'link',
              label: 'Link',
              type: 'input',
              value: item.link,
            },
            {
              id: menuItemFieldToolId(atom.id, index, 'color'),
              key: 'color',
              label: 'Color',
              type: 'colorPicker',
              value: item.type === 'text' ? item.color : '#000000',
            },
            {
              id: menuItemFieldToolId(atom.id, index, 'fontSize'),
              key: 'fontSize',
              label: 'Font Size',
              type: 'inputNumber',
              value: item.type === 'text' ? item.fontSize : 16,
            },
          ],
  }))
}

export function settingToolId(level: 'block' | 'row' | 'cell', id: string, field: string) {
  return `v2-settings::${level}::${id}::${field}`
}

export function toOptionalNumber(value: string | number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function toDimensionMode(value?: number): DimensionMode {
  return value === undefined ? 'auto' : 'manual'
}

export function atomToolId(atomId: string, field: string) {
  return `v2-atom::${atomId}::${field}`
}

export function useSettingsTools() {
  const { selectedBlock, selectedRow, selectedCell, selectedAtom } = useSelection()

  const cellWidthMode = ref<DimensionMode>('auto')
  const cellHeightMode = ref<DimensionMode>('auto')

  watch(
    () => selectedCell.value?.id,
    () => {
      cellWidthMode.value = toDimensionMode(selectedCell.value?.settings.width)
      cellHeightMode.value = toDimensionMode(selectedCell.value?.settings.height)
    },
    { immediate: true },
  )

  const blockAppearanceTools = computed<Tool[]>(() => {
    if (!selectedBlock.value)
      return []

    return [
      {
        id: settingToolId('block', selectedBlock.value.id, 'spacing'),
        key: 'padding',
        label: 'Spacing',
        type: 'spacing',
        value: normalizeSpacingValue(selectedBlock.value.settings.spacing, [0, 0, 0, 0], {
          includeMargin: false,
        }),
      },
      {
        id: settingToolId('block', selectedBlock.value.id, 'backgroundColor'),
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'colorPicker',
        value: selectedBlock.value.settings.backgroundColor,
      },
      {
        id: settingToolId('block', selectedBlock.value.id, 'backgroundImage'),
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'bgImage',
        value: normalizeBackgroundImage(selectedBlock.value.settings.backgroundImage),
      },
    ]
  })

  const rowSpacingTools = computed<Tool[]>(() => {
    if (!selectedRow.value)
      return []

    return [
      {
        id: settingToolId('row', selectedRow.value.id, 'spacing'),
        key: 'padding',
        label: 'Spacing',
        type: 'spacing',
        value: normalizeSpacingValue(selectedRow.value.settings.spacing, [0, 0, 0, 0], {
          includeMargin: false,
        }),
      },
    ]
  })

  const rowAppearanceTools = computed<Tool[]>(() => {
    if (!selectedRow.value)
      return []

    return [
      {
        id: settingToolId('row', selectedRow.value.id, 'gap'),
        key: 'gap',
        label: 'Gap',
        type: 'inputNumber',
        value: selectedRow.value.settings.gap,
      },
      {
        id: settingToolId('row', selectedRow.value.id, 'height'),
        key: 'height',
        label: 'Min Height',
        type: 'inputNumber',
        value: selectedRow.value.settings.height ?? 0,
      },
      {
        id: settingToolId('row', selectedRow.value.id, 'backgroundColor'),
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'colorPicker',
        value: selectedRow.value.settings.backgroundColor,
      },
      {
        id: settingToolId('row', selectedRow.value.id, 'backgroundImage'),
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'bgImage',
        value: normalizeBackgroundImage(selectedRow.value.settings.backgroundImage),
      },
    ]
  })

  const cellSpacingTools = computed<Tool[]>(() => {
    if (!selectedCell.value)
      return []

    return [
      {
        id: settingToolId('cell', selectedCell.value.id, 'spacing'),
        key: 'padding',
        label: 'Spacing',
        type: 'spacing',
        value: normalizeSpacingValue(selectedCell.value.settings.spacing, [0, 0, 0, 0], {
          includeMargin: false,
        }),
      },
    ]
  })

  const cellAppearanceTools = computed<Tool[]>(() => {
    if (!selectedCell.value)
      return []

    return [
      {
        id: settingToolId('cell', selectedCell.value.id, 'borderRadius'),
        key: 'borderRadius',
        label: 'Border Radius',
        type: 'inputNumber',
        value: selectedCell.value.settings.borderRadius ?? 0,
      },
      {
        id: settingToolId('cell', selectedCell.value.id, 'backgroundColor'),
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'colorPicker',
        value: selectedCell.value.settings.backgroundColor,
      },
      {
        id: settingToolId('cell', selectedCell.value.id, 'backgroundImage'),
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'bgImage',
        value: normalizeBackgroundImage(selectedCell.value.settings.backgroundImage),
      },
      {
        id: settingToolId('cell', selectedCell.value.id, 'link'),
        key: 'link',
        label: 'Link',
        type: 'input',
        value: selectedCell.value.settings.link || '',
      },
    ]
  })

  const atomSpacingTools = computed<Tool[]>(() => {
    if (!selectedAtom.value)
      return []

    const id = atomToolId(selectedAtom.value.id, 'spacing')

    if (selectedAtom.value.type === 'button') {
      return [
        {
          id,
          key: 'spacing',
          label: 'Spacing',
          type: 'spacing',
          value: normalizeSpacingValue(selectedAtom.value.spacing, selectedAtom.value.padding),
        },
      ]
    }

    return [
      {
        id,
        key: 'spacing',
        label: 'Spacing',
        type: 'spacing',
        value: normalizeSpacingValue(selectedAtom.value.spacing),
      },
    ]
  })

  const atomTools = computed<Tool[]>(() => {
    if (!selectedAtom.value)
      return []

    const atomId = selectedAtom.value.id

    if (selectedAtom.value.type === 'text') {
      return [
        {
          id: atomToolId(atomId, 'color'),
          key: 'mainColor',
          label: 'Main Color',
          type: 'colorPicker',
          value: selectedAtom.value.color || DEFAULT_TEXT_MAIN_COLOR,
        },
        {
          id: atomToolId(atomId, 'content'),
          key: 'content',
          label: 'Content',
          type: 'textEditor',
          value: selectedAtom.value.value,
        },
      ]
    }

    if (selectedAtom.value.type === 'button') {
      return [
        {
          id: atomToolId(atomId, 'borderRadius'),
          key: 'borderRadius',
          label: 'Border Radius',
          type: 'inputNumber',
          value: selectedAtom.value.borderRadius,
        },
        {
          id: atomToolId(atomId, 'backgroundColor'),
          key: 'backgroundColor',
          label: 'Background Color',
          type: 'colorPicker',
          value: selectedAtom.value.backgroundColor,
        },
        {
          id: atomToolId(atomId, 'color'),
          key: 'color',
          label: 'Color',
          type: 'colorPicker',
          value: selectedAtom.value.color,
        },
        {
          id: atomToolId(atomId, 'fontSize'),
          key: 'fontSize',
          label: 'Font Size',
          type: 'inputNumber',
          value: selectedAtom.value.fontSize,
        },
        {
          id: atomToolId(atomId, 'text'),
          key: 'text',
          label: 'Text',
          type: 'input',
          value: selectedAtom.value.text,
        },
        {
          id: atomToolId(atomId, 'link'),
          key: 'link',
          label: 'Link',
          type: 'input',
          value: selectedAtom.value.link,
        },
      ]
    }

    if (selectedAtom.value.type === 'image') {
      return [
        {
          id: atomToolId(atomId, 'borderRadius'),
          key: 'borderRadius',
          label: 'Border Radius',
          type: 'inputNumber',
          value: selectedAtom.value.borderRadius ?? 0,
        },
        {
          id: atomToolId(atomId, 'image'),
          key: 'image',
          label: 'Image',
          type: 'image',
          value: normalizeImageValue({
            src: selectedAtom.value.src,
            alt: selectedAtom.value.alt,
            link: selectedAtom.value.link,
            width: selectedAtom.value.width,
            height: selectedAtom.value.height,
          }),
        },
      ]
    }

    if (selectedAtom.value.type === 'menu') {
      return [
        {
          id: atomToolId(atomId, 'gap'),
          key: 'gap',
          label: 'Gap',
          type: 'inputNumber',
          value: selectedAtom.value.gap ?? 10,
        },
        {
          id: atomToolId(atomId, 'menuItemType'),
          key: 'menuItemType',
          label: 'Item Type',
          type: 'select',
          value: getMenuItemType(selectedAtom.value),
          options: [
            {
              label: 'Text',
              value: 'text',
            },
            {
              label: 'Image',
              value: 'image',
            },
          ],
        },
        {
          id: atomToolId(atomId, 'menuList'),
          key: 'list',
          label: 'List',
          type: 'multi',
          value: toMenuListToolValue(selectedAtom.value),
        },
      ]
    }

    return [
      {
        id: atomToolId(atomId, 'height'),
        key: 'height',
        label: 'Height',
        type: 'inputNumber',
        value: selectedAtom.value.height,
      },
      {
        id: atomToolId(atomId, 'color'),
        key: 'color',
        label: 'Color',
        type: 'colorPicker',
        value: selectedAtom.value.color,
      },
    ]
  })

  const rowHiddenOnMobile = computed<boolean>({
    get: () => selectedRow.value?.settings.hiddenOnMobile ?? false,
    set: (next) => {
      if (!selectedRow.value)
        return
      selectedRow.value.settings.hiddenOnMobile = Boolean(next)
    },
  })

  const rowCollapseOnMobile = computed<boolean>({
    get: () => selectedRow.value?.settings.collapseOnMobile !== false,
    set: (next) => {
      if (!selectedRow.value)
        return
      selectedRow.value.settings.collapseOnMobile = Boolean(next)
    },
  })

  const cellHiddenOnMobile = computed<boolean>({
    get: () => selectedCell.value?.settings.hiddenOnMobile ?? false,
    set: (next) => {
      if (!selectedCell.value)
        return
      selectedCell.value.settings.hiddenOnMobile = Boolean(next)
    },
  })

  const atomHiddenOnMobile = computed<boolean>({
    get: () => selectedAtom.value?.hiddenOnMobile ?? false,
    set: (next) => {
      if (!selectedAtom.value)
        return
      selectedAtom.value.hiddenOnMobile = Boolean(next)
    },
  })

  function onItemWidthModeChange(mode: string) {
    if (!selectedCell.value)
      return

    const nextMode: DimensionMode = mode === 'manual' ? 'manual' : 'auto'
    cellWidthMode.value = nextMode
    selectedCell.value.settings.width
      = nextMode === 'manual' ? (selectedCell.value.settings.width ?? 50) : undefined
  }

  function onItemWidthChange(value: string | number) {
    if (!selectedCell.value)
      return
    selectedCell.value.settings.width = toOptionalNumber(value)
  }

  function onItemHeightModeChange(mode: string) {
    if (!selectedCell.value)
      return

    const nextMode: DimensionMode = mode === 'manual' ? 'manual' : 'auto'
    cellHeightMode.value = nextMode
    selectedCell.value.settings.height
      = nextMode === 'manual' ? (selectedCell.value.settings.height ?? 120) : undefined
  }

  function onItemHeightChange(value: string | number) {
    if (!selectedCell.value)
      return
    selectedCell.value.settings.height = toOptionalNumber(value)
  }

  function onItemVerticalAlignChange(value: string) {
    if (!selectedCell.value)
      return
    selectedCell.value.settings.verticalAlign
      = value === 'middle' || value === 'bottom' ? value : 'top'
  }

  function onItemHorizontalAlignChange(value: string) {
    if (!selectedCell.value)
      return
    selectedCell.value.settings.horizontalAlign
      = value === 'center' || value === 'right' ? value : 'left'
  }

  return {
    cellWidthMode,
    cellHeightMode,
    blockAppearanceTools,
    rowSpacingTools,
    rowAppearanceTools,
    cellSpacingTools,
    cellAppearanceTools,
    atomSpacingTools,
    atomTools,
    rowHiddenOnMobile,
    rowCollapseOnMobile,
    cellHiddenOnMobile,
    atomHiddenOnMobile,
    onItemWidthModeChange,
    onItemWidthChange,
    onItemHeightModeChange,
    onItemHeightChange,
    onItemVerticalAlignChange,
    onItemHorizontalAlignChange,
  }
}
