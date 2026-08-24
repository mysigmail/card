import type { BorderRadiusValue, BorderValue } from '@/entities/style'
import type {
  AtomRef,
  BackgroundImageTool,
  BlockRef,
  CellRef,
  ImageTool,
  NodePropertyCommand,
  RowRef,
  SpacingTool,
  Tool,
} from '@/features/editor/model'
import { computed } from 'vue'
import { resolveLegacyTextBoxDefaults } from '@/entities/block'
import { createBorderRadiusValue } from '@/entities/style'
import { useCanvas, useSelection } from '@/features/editor/model'

export type DimensionMode = 'auto' | 'manual'
type InspectorControlOf<T extends Tool> = T & { onUpdate: (value: T['value']) => void }
type ToolInspectorControl = Tool extends infer T
  ? T extends Tool
    ? InspectorControlOf<T>
    : never
  : never

export interface BorderInspectorControl {
  id: string
  key: 'border'
  label: string
  type: 'border'
  value: BorderValue | undefined
  onUpdate: (value: BorderValue | undefined) => void
}

export interface RadiusInspectorControl {
  id: string
  key: 'borderRadius'
  label: string
  type: 'radius'
  value: BorderRadiusValue
  onUpdate: (value: BorderRadiusValue) => void
}

export interface OpacityInspectorControl {
  id: string
  key: 'opacity'
  label: string
  type: 'opacity'
  value: number
  onUpdate: (value: number) => void
}

export type InspectorControl
  = | ToolInspectorControl
    | BorderInspectorControl
    | RadiusInspectorControl
    | OpacityInspectorControl

export const DEFAULT_BACKGROUND_IMAGE: BackgroundImageTool['value'] = {
  url: '',
  repeat: 'no-repeat',
  size: 'cover',
  position: 'center',
}
export const DEFAULT_IMAGE_VALUE: ImageTool['value'] = { src: '', alt: '', link: '' }

export function normalizeBackgroundImage(value?: BackgroundImageTool['value']) {
  return { ...DEFAULT_BACKGROUND_IMAGE, ...(value || {}) }
}

export function normalizeImageValue(value?: Partial<ImageTool['value']>): ImageTool['value'] {
  const width = Number(value?.width)
  const height = Number(value?.height)
  return {
    ...DEFAULT_IMAGE_VALUE,
    ...(value || {}),
    src: typeof value?.src === 'string' ? value.src : '',
    alt: typeof value?.alt === 'string' ? value.alt : '',
    link: typeof value?.link === 'string' ? value.link : '',
    width: Number.isFinite(width) && width > 0 ? width : undefined,
    height: Number.isFinite(height) && height > 0 ? height : undefined,
  }
}

export function normalizeSpacingValue(
  value?: SpacingTool['value'],
  fallbackPadding: [number, number, number, number] = [0, 0, 0, 0],
  options: { includeMargin?: boolean, includePadding?: boolean } = {},
): SpacingTool['value'] {
  const normalized: SpacingTool['value'] = {}
  if (options.includeMargin !== false)
    normalized.margin = value?.margin ? [...value.margin] : [0, 0, 0, 0]
  if (options.includePadding !== false)
    normalized.padding = value?.padding ? [...value.padding] : [...fallbackPadding]
  return normalized
}

export function toOptionalNumber(value: string | number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function toDimensionMode(value?: number): DimensionMode {
  return value === undefined ? 'auto' : 'manual'
}

export function useSettingsTools() {
  const selection = useSelection()
  const { updateNodeProperty, updateNodeProperties } = useCanvas()

  const blockRef = computed<BlockRef | undefined>(() =>
    selection.selectedBlockId.value
      ? { kind: 'block', blockId: selection.selectedBlockId.value }
      : undefined,
  )
  const rowRef = computed<RowRef | undefined>(() =>
    selection.selectedBlockId.value && selection.selectedRowId.value
      ? {
          kind: 'row',
          blockId: selection.selectedBlockId.value,
          rowId: selection.selectedRowId.value,
        }
      : undefined,
  )
  const cellRef = computed<CellRef | undefined>(() =>
    selection.selectedBlockId.value
    && selection.selectedRowId.value
    && selection.selectedCellId.value
      ? {
          kind: 'cell',
          blockId: selection.selectedBlockId.value,
          rowId: selection.selectedRowId.value,
          cellId: selection.selectedCellId.value,
        }
      : undefined,
  )
  const atomRef = computed<AtomRef | undefined>(() => {
    const atom = selection.selectedAtom.value
    if (
      !atom
      || !selection.selectedBlockId.value
      || !selection.selectedRowId.value
      || !selection.selectedCellId.value
    ) {
      return undefined
    }
    return {
      kind: 'atom',
      blockId: selection.selectedBlockId.value,
      rowId: selection.selectedRowId.value,
      cellId: selection.selectedCellId.value,
      atomId: atom.id,
      atomType: atom.type,
    }
  })

  const update = (command: NodePropertyCommand) => updateNodeProperty(command)

  const blockAppearanceTools = computed<InspectorControl[]>(() => {
    const block = selection.selectedBlock.value
    const ref = blockRef.value
    if (!block || !ref)
      return []
    return [
      {
        id: 'block-spacing',
        key: 'padding',
        label: 'Spacing',
        type: 'spacing',
        value: normalizeSpacingValue(block.settings.spacing, [0, 0, 0, 0], {
          includeMargin: false,
        }),
        onUpdate: value => update({ ref, property: 'spacing', value }),
      },
      {
        id: 'block-opacity',
        key: 'opacity',
        label: 'Opacity',
        type: 'opacity',
        value: block.settings.opacity ?? 100,
        onUpdate: value => update({ ref, property: 'opacity', value }),
      },
      {
        id: 'block-background-color',
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'colorPicker',
        value: block.settings.backgroundColor,
        resetValue: 'transparent',
        onUpdate: value => update({ ref, property: 'backgroundColor', value }),
      },
      {
        id: 'block-background-image',
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'bgImage',
        value: normalizeBackgroundImage(block.settings.backgroundImage),
        onUpdate: value => update({ ref, property: 'backgroundImage', value }),
      },
      {
        id: 'block-border-radius',
        key: 'borderRadius',
        label: 'Border Radius',
        type: 'radius',
        value: block.settings.borderRadius ?? createBorderRadiusValue(0),
        onUpdate: value => update({ ref, property: 'borderRadius', value }),
      },
      {
        id: 'block-border',
        key: 'border',
        label: 'Border',
        type: 'border',
        value: block.settings.border,
        onUpdate: value => update({ ref, property: 'border', value }),
      },
    ]
  })

  const rowSpacingTools = computed<InspectorControl[]>(() => {
    const row = selection.selectedRow.value
    const ref = rowRef.value
    return row && ref
      ? [
          {
            id: 'row-spacing',
            key: 'padding',
            label: 'Spacing',
            type: 'spacing',
            value: normalizeSpacingValue(row.settings.spacing, [0, 0, 0, 0], {
              includeMargin: false,
            }),
            onUpdate: value => update({ ref, property: 'spacing', value }),
          },
        ]
      : []
  })

  const rowAppearanceTools = computed<InspectorControl[]>(() => {
    const row = selection.selectedRow.value
    const ref = rowRef.value
    if (!row || !ref)
      return []
    return [
      {
        id: 'row-width-mode',
        key: 'widthMode',
        label: 'Width',
        type: 'select',
        value: row.settings.widthMode,
        options: [
          { label: 'Fill', value: 'fill' },
          { label: 'Hug content', value: 'hug' },
        ],
        onUpdate: value =>
          update({ ref, property: 'widthMode', value: value === 'hug' ? 'hug' : 'fill' }),
      },
      {
        id: 'row-gap',
        key: 'gap',
        label: 'Gap',
        type: 'inputNumber',
        value: row.settings.gap,
        onUpdate: value =>
          update({ ref, property: 'gap', value: Math.max(0, Number(value) || 0) }),
      },
      {
        id: 'row-height',
        key: 'height',
        label: 'Min Height',
        type: 'inputNumber',
        value: row.settings.height ?? 0,
        onUpdate: value => update({ ref, property: 'height', value: toOptionalNumber(value) }),
      },
      {
        id: 'row-opacity',
        key: 'opacity',
        label: 'Opacity',
        type: 'opacity',
        value: row.settings.opacity ?? 100,
        onUpdate: value => update({ ref, property: 'opacity', value }),
      },
      {
        id: 'row-background-color',
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'colorPicker',
        value: row.settings.backgroundColor,
        resetValue: 'transparent',
        onUpdate: value => update({ ref, property: 'backgroundColor', value }),
      },
      {
        id: 'row-background-image',
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'bgImage',
        value: normalizeBackgroundImage(row.settings.backgroundImage),
        onUpdate: value => update({ ref, property: 'backgroundImage', value }),
      },
      {
        id: 'row-border-radius',
        key: 'borderRadius',
        label: 'Border Radius',
        type: 'radius',
        value: row.settings.borderRadius ?? createBorderRadiusValue(0),
        onUpdate: value => update({ ref, property: 'borderRadius', value }),
      },
      {
        id: 'row-border',
        key: 'border',
        label: 'Border',
        type: 'border',
        value: row.settings.border,
        onUpdate: value => update({ ref, property: 'border', value }),
      },
    ]
  })

  const cellSpacingTools = computed<InspectorControl[]>(() => {
    const cell = selection.selectedCell.value
    const ref = cellRef.value
    return cell && ref
      ? [
          {
            id: 'cell-spacing',
            key: 'padding',
            label: 'Spacing',
            type: 'spacing',
            value: normalizeSpacingValue(cell.settings.spacing, [0, 0, 0, 0], {
              includeMargin: false,
            }),
            onUpdate: value => update({ ref, property: 'spacing', value }),
          },
        ]
      : []
  })

  const cellAppearanceTools = computed<InspectorControl[]>(() => {
    const cell = selection.selectedCell.value
    const ref = cellRef.value
    if (!cell || !ref)
      return []
    return [
      {
        id: 'cell-opacity',
        key: 'opacity',
        label: 'Opacity',
        type: 'opacity',
        value: cell.settings.opacity ?? 100,
        onUpdate: value => update({ ref, property: 'opacity', value }),
      },
      {
        id: 'cell-border-radius',
        key: 'borderRadius',
        label: 'Border Radius',
        type: 'radius',
        value: cell.settings.borderRadius ?? createBorderRadiusValue(0),
        onUpdate: value => update({ ref, property: 'borderRadius', value }),
      },
      {
        id: 'cell-border',
        key: 'border',
        label: 'Border',
        type: 'border',
        value: cell.settings.border,
        onUpdate: value => update({ ref, property: 'border', value }),
      },
      {
        id: 'cell-background-color',
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'colorPicker',
        value: cell.settings.backgroundColor,
        resetValue: 'transparent',
        onUpdate: value => update({ ref, property: 'backgroundColor', value }),
      },
      {
        id: 'cell-background-image',
        key: 'backgroundImage',
        label: 'Background Image',
        type: 'bgImage',
        value: normalizeBackgroundImage(cell.settings.backgroundImage),
        onUpdate: value => update({ ref, property: 'backgroundImage', value }),
      },
      {
        id: 'cell-link',
        key: 'link',
        label: 'Link',
        type: 'input',
        value: cell.settings.link || '',
        onUpdate: value => update({ ref, property: 'link', value }),
      },
    ]
  })

  const atomSpacingTools = computed<InspectorControl[]>(() => {
    const atom = selection.selectedAtom.value
    const ref = atomRef.value
    if (!atom || !ref)
      return []
    const fallback: [number, number, number, number]
      = atom.type === 'button' ? atom.padding : [0, 0, 0, 0]
    return [
      {
        id: 'atom-spacing',
        key: 'spacing',
        label: 'Spacing',
        type: 'spacing',
        value: normalizeSpacingValue(atom.spacing, fallback),
        onUpdate: value => update({ ref, property: 'spacing', value }),
      },
    ]
  })

  const atomTools = computed<InspectorControl[]>(() => {
    const atom = selection.selectedAtom.value
    const ref = atomRef.value
    if (!atom || !ref)
      return []
    if (atom.type === 'text' && ref.atomType === 'text') {
      const textRef = ref as AtomRef<'text'>
      const legacyDefaults = resolveLegacyTextBoxDefaults(atom)
      const materializeLegacyTextBox = (
        commands: NodePropertyCommand[],
        widthMode: 'fill' | 'hug',
      ) => {
        if (atom.widthMode === undefined)
          commands.push({ ref: textRef, property: 'widthMode', value: widthMode })
        if (atom.paragraphSpacing === undefined) {
          commands.push({
            ref: textRef,
            property: 'paragraphSpacing',
            value: legacyDefaults.paragraphSpacing,
          })
          if (legacyDefaults.spacing) {
            commands.push({ ref: textRef, property: 'spacing', value: legacyDefaults.spacing })
          }
        }
      }
      return [
        {
          id: 'text-width-mode',
          key: 'widthMode',
          label: 'Width',
          type: 'select',
          value: atom.widthMode ?? 'fill',
          options: [
            { label: 'Fill', value: 'fill' },
            { label: 'Hug content', value: 'hug' },
          ],
          onUpdate: (value) => {
            const widthMode = value === 'hug' ? 'hug' : 'fill'
            const commands: NodePropertyCommand[] = []
            materializeLegacyTextBox(commands, widthMode)
            if (atom.widthMode !== undefined)
              commands.push({ ref: textRef, property: 'widthMode', value: widthMode })
            updateNodeProperties(commands)
          },
        },
        {
          id: 'text-paragraph-spacing',
          key: 'paragraphSpacing',
          label: 'Paragraph Spacing',
          type: 'inputNumber',
          value: atom.paragraphSpacing ?? legacyDefaults.paragraphSpacing,
          onUpdate: (value) => {
            const commands: NodePropertyCommand[] = []
            materializeLegacyTextBox(commands, 'fill')
            const paragraphSpacing = Math.max(0, Number(value) || 0)
            const index = commands.findIndex(command => command.property === 'paragraphSpacing')
            if (index >= 0) {
              commands[index] = {
                ref: textRef,
                property: 'paragraphSpacing',
                value: paragraphSpacing,
              }
            }
            else {
              commands.push({ ref: textRef, property: 'paragraphSpacing', value: paragraphSpacing })
            }
            updateNodeProperties(commands)
          },
        },
        {
          id: 'text-opacity',
          key: 'opacity',
          label: 'Opacity',
          type: 'opacity',
          value: atom.opacity ?? 100,
          onUpdate: value => update({ ref: textRef, property: 'opacity', value }),
        },
        {
          id: 'text-border-radius',
          key: 'borderRadius',
          label: 'Border Radius',
          type: 'radius',
          value: atom.borderRadius ?? createBorderRadiusValue(0),
          onUpdate: (value) => {
            const commands: NodePropertyCommand[] = []
            materializeLegacyTextBox(commands, 'hug')
            commands.push({ ref: textRef, property: 'borderRadius', value })
            updateNodeProperties(commands)
          },
        },
        {
          id: 'text-border',
          key: 'border',
          label: 'Border',
          type: 'border',
          value: atom.border,
          onUpdate: (value) => {
            const commands: NodePropertyCommand[] = [{ ref: textRef, property: 'border', value }]
            if (value)
              materializeLegacyTextBox(commands, 'hug')
            updateNodeProperties(commands)
          },
        },
      ]
    }
    if (atom.type === 'button' && ref.atomType === 'button') {
      const buttonRef = ref as AtomRef<'button'>
      return [
        {
          id: 'button-font-size',
          key: 'fontSize',
          label: 'Font Size',
          type: 'inputNumber',
          value: atom.fontSize,
          onUpdate: value =>
            update({ ref: buttonRef, property: 'fontSize', value: Number(value) || 14 }),
        },
        {
          id: 'button-opacity',
          key: 'opacity',
          label: 'Opacity',
          type: 'opacity',
          value: atom.opacity ?? 100,
          onUpdate: value => update({ ref: buttonRef, property: 'opacity', value }),
        },
        {
          id: 'button-border-radius',
          key: 'borderRadius',
          label: 'Border Radius',
          type: 'radius',
          value: atom.borderRadius,
          onUpdate: value => update({ ref: buttonRef, property: 'borderRadius', value }),
        },
        {
          id: 'button-border',
          key: 'border',
          label: 'Border',
          type: 'border',
          value: atom.border,
          onUpdate: value => update({ ref: buttonRef, property: 'border', value }),
        },
        {
          id: 'button-background-color',
          key: 'backgroundColor',
          label: 'Background Color',
          type: 'colorPicker',
          value: atom.backgroundColor,
          onUpdate: value => update({ ref: buttonRef, property: 'backgroundColor', value }),
        },
        {
          id: 'button-color',
          key: 'color',
          label: 'Color',
          type: 'colorPicker',
          value: atom.color,
          onUpdate: value => update({ ref: buttonRef, property: 'color', value }),
        },
        {
          id: 'button-text',
          key: 'text',
          label: 'Text',
          type: 'input',
          value: atom.text,
          onUpdate: value => update({ ref: buttonRef, property: 'text', value }),
        },
        {
          id: 'button-link',
          key: 'link',
          label: 'Link',
          type: 'input',
          value: atom.link,
          onUpdate: value => update({ ref: buttonRef, property: 'link', value }),
        },
      ]
    }
    if (atom.type === 'image' && ref.atomType === 'image') {
      const imageRef = ref as AtomRef<'image'>
      return [
        {
          id: 'image-content',
          key: 'image',
          label: 'Image',
          type: 'image',
          value: normalizeImageValue(atom),
          onUpdate: (value) => {
            const image = normalizeImageValue(value)
            updateNodeProperties([
              { ref: imageRef, property: 'src', value: image.src },
              { ref: imageRef, property: 'alt', value: image.alt || '' },
              { ref: imageRef, property: 'link', value: image.link || '' },
              { ref: imageRef, property: 'width', value: image.width },
              { ref: imageRef, property: 'height', value: image.height },
            ])
          },
        },
        {
          id: 'image-opacity',
          key: 'opacity',
          label: 'Opacity',
          type: 'opacity',
          value: atom.opacity ?? 100,
          onUpdate: value => update({ ref: imageRef, property: 'opacity', value }),
        },
        {
          id: 'image-border-radius',
          key: 'borderRadius',
          label: 'Border Radius',
          type: 'radius',
          value: atom.borderRadius ?? createBorderRadiusValue(0),
          onUpdate: value => update({ ref: imageRef, property: 'borderRadius', value }),
        },
        {
          id: 'image-border',
          key: 'border',
          label: 'Border',
          type: 'border',
          value: atom.border,
          onUpdate: value => update({ ref: imageRef, property: 'border', value }),
        },
      ]
    }
    if (atom.type === 'divider' && ref.atomType === 'divider') {
      const dividerRef = ref as AtomRef<'divider'>
      return [
        {
          id: 'divider-height',
          key: 'height',
          label: 'Height',
          type: 'inputNumber',
          value: atom.height,
          onUpdate: value =>
            update({ ref: dividerRef, property: 'height', value: Number(value) || 1 }),
        },
        {
          id: 'divider-opacity',
          key: 'opacity',
          label: 'Opacity',
          type: 'opacity',
          value: atom.opacity ?? 100,
          onUpdate: value => update({ ref: dividerRef, property: 'opacity', value }),
        },
        {
          id: 'divider-color',
          key: 'color',
          label: 'Color',
          type: 'colorPicker',
          value: atom.color,
          onUpdate: value => update({ ref: dividerRef, property: 'color', value }),
        },
      ]
    }
    return []
  })

  const cellWidthMode = computed(() =>
    toDimensionMode(selection.selectedCell.value?.settings.width),
  )
  const cellHeightMode = computed(() =>
    toDimensionMode(selection.selectedCell.value?.settings.height),
  )
  const rowHiddenOnMobile = computed(
    () => selection.selectedRow.value?.settings.hiddenOnMobile ?? false,
  )
  const rowCollapseOnMobile = computed(
    () => selection.selectedRow.value?.settings.collapseOnMobile !== false,
  )
  const cellHiddenOnMobile = computed(
    () => selection.selectedCell.value?.settings.hiddenOnMobile ?? false,
  )
  const atomHiddenOnMobile = computed(() => selection.selectedAtom.value?.hiddenOnMobile ?? false)
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
    onRowHiddenOnMobileChange: (value: boolean) =>
      rowRef.value && update({ ref: rowRef.value, property: 'hiddenOnMobile', value }),
    onRowCollapseOnMobileChange: (value: boolean) =>
      rowRef.value && update({ ref: rowRef.value, property: 'collapseOnMobile', value }),
    onCellHiddenOnMobileChange: (value: boolean) =>
      cellRef.value && update({ ref: cellRef.value, property: 'hiddenOnMobile', value }),
    onAtomHiddenOnMobileChange: (value: boolean) =>
      atomRef.value && update({ ref: atomRef.value, property: 'hiddenOnMobile', value }),
    onItemWidthModeChange: (mode: string) =>
      cellRef.value
      && update({
        ref: cellRef.value,
        property: 'width',
        value: mode === 'manual' ? (selection.selectedCell.value?.settings.width ?? 50) : undefined,
      }),
    onItemWidthChange: (value: string | number) =>
      cellRef.value
      && update({ ref: cellRef.value, property: 'width', value: toOptionalNumber(value) }),
    onItemHeightModeChange: (mode: string) =>
      cellRef.value
      && update({
        ref: cellRef.value,
        property: 'height',
        value:
          mode === 'manual' ? (selection.selectedCell.value?.settings.height ?? 120) : undefined,
      }),
    onItemHeightChange: (value: string | number) =>
      cellRef.value
      && update({ ref: cellRef.value, property: 'height', value: toOptionalNumber(value) }),
    onItemVerticalAlignChange: (value: string) =>
      cellRef.value
      && update({
        ref: cellRef.value,
        property: 'verticalAlign',
        value: value === 'middle' || value === 'bottom' ? value : 'top',
      }),
    onItemHorizontalAlignChange: (value: string) =>
      cellRef.value
      && update({
        ref: cellRef.value,
        property: 'horizontalAlign',
        value: value === 'center' || value === 'right' ? value : 'left',
      }),
  }
}
