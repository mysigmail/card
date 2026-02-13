<script setup lang="ts">
import type { MenuAtom } from '@/entities/block'
import type {
  BackgroundImageTool,
  ImageTool,
  MultiTool,
  SpacingTool,
  Tool,
} from '@/features/editor/model'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useComponentsStore } from '@/features/editor/model'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'

const {
  selectionLevel,
  selectedBlock,
  selectedRow,
  selectedCell,
  selectedAtom,
  insertRowToBlock,
  removeRow,
  insertCellToRow,
  removeAtom,
  selectedBlockId,
  selectedRowId,
  selectedCellId,
} = useComponentsStore()

const DEFAULT_BACKGROUND_IMAGE: BackgroundImageTool['value'] = {
  url: '',
  repeat: 'no-repeat',
  size: 'cover',
  position: 'center',
}

const DEFAULT_TEXT_MAIN_COLOR = '#111827'
const DEFAULT_IMAGE_VALUE: ImageTool['value'] = {
  src: '',
  alt: '',
  link: '',
}

function normalizeBackgroundImage(
  value?: BackgroundImageTool['value'],
): BackgroundImageTool['value'] {
  return {
    ...DEFAULT_BACKGROUND_IMAGE,
    ...(value || {}),
  }
}

function normalizeImageValue(value?: Partial<ImageTool['value']>): ImageTool['value'] {
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

function menuItemFieldToolId(atomId: string, index: number, field: string) {
  return `v2-atom::${atomId}::menuList::${index}::${field}`
}

function menuItemGroupId(atomId: string, index: number) {
  return `v2-atom::${atomId}::menuListItem::${index}`
}

function getMenuItemType(atom: MenuAtom): 'text' | 'image' {
  if (atom.itemType === 'image')
    return 'image'

  if (atom.itemType === 'text')
    return 'text'

  const first = atom.items[0]
  return first?.type === 'image' ? 'image' : 'text'
}

function toMenuListToolValue(atom: MenuAtom): MultiTool['value'] {
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

function settingToolId(level: 'block' | 'row' | 'cell', id: string, field: string) {
  return `v2-settings::${level}::${id}::${field}`
}

function toOptionalNumber(value: string | number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function normalizeSpacingValue(
  value?: SpacingTool['value'],
  fallbackPadding: [number, number, number, number] = [0, 0, 0, 0],
): SpacingTool['value'] {
  const margin
    = Array.isArray(value?.margin) && value.margin.length === 4
      ? (value.margin.map(i => Number(i) || 0) as [number, number, number, number])
      : ([0, 0, 0, 0] as [number, number, number, number])

  const padding
    = Array.isArray(value?.padding) && value.padding.length === 4
      ? (value.padding.map(i => Number(i) || 0) as [number, number, number, number])
      : ([...fallbackPadding] as [number, number, number, number])

  return {
    margin,
    padding,
  }
}

const blockAppearanceTools = computed<Tool[]>(() => {
  if (!selectedBlock.value)
    return []

  return [
    {
      id: settingToolId('block', selectedBlock.value.id, 'spacing'),
      key: 'padding',
      label: 'Spacings',
      type: 'spacing',
      value: normalizeSpacingValue(selectedBlock.value.settings.spacing),
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

const rowAppearanceTools = computed<Tool[]>(() => {
  if (!selectedRow.value)
    return []

  return [
    {
      id: settingToolId('row', selectedRow.value.id, 'spacing'),
      key: 'padding',
      label: 'Spacings',
      type: 'spacing',
      value: normalizeSpacingValue(selectedRow.value.settings.spacing),
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
  ]
})

const cellAppearanceTools = computed<Tool[]>(() => {
  if (!selectedCell.value)
    return []

  return [
    {
      id: settingToolId('cell', selectedCell.value.id, 'spacing'),
      key: 'padding',
      label: 'Spacings',
      type: 'spacing',
      value: normalizeSpacingValue(selectedCell.value.settings.spacing),
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
    {
      id: settingToolId('cell', selectedCell.value.id, 'borderRadius'),
      key: 'borderRadius',
      label: 'Border Radius',
      type: 'inputNumber',
      value: selectedCell.value.settings.borderRadius ?? 0,
    },
  ]
})

const canRemoveSelectedRow = computed(() => {
  if (!selectedBlock.value || !selectedRow.value)
    return false

  const currentRowId = selectedRow.value.id
  const isTopLevelRow = selectedBlock.value.rows.some(row => row.id === currentRowId)

  if (!isTopLevelRow)
    return true

  return selectedBlock.value.rows.length > 1
})

function getItemWidthMode() {
  return selectedCell.value?.settings.width === undefined ? 'auto' : 'manual'
}

function onItemWidthModeChange(mode: string) {
  if (!selectedCell.value)
    return

  selectedCell.value.settings.width
    = mode === 'manual' ? (selectedCell.value.settings.width ?? 50) : undefined
}

function onItemWidthChange(value: string | number) {
  if (!selectedCell.value)
    return

  selectedCell.value.settings.width = toOptionalNumber(value)
}

function getItemHeightMode() {
  return selectedCell.value?.settings.height === undefined ? 'auto' : 'manual'
}

function onItemHeightModeChange(mode: string) {
  if (!selectedCell.value)
    return

  selectedCell.value.settings.height
    = mode === 'manual' ? (selectedCell.value.settings.height ?? 120) : undefined
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

function getItemHorizontalAlign() {
  return selectedCell.value?.settings.horizontalAlign ?? 'left'
}

function onItemHorizontalAlignChange(value: string) {
  if (!selectedCell.value)
    return

  selectedCell.value.settings.horizontalAlign
    = value === 'center' || value === 'right' ? value : 'left'
}

function atomToolId(field: string) {
  if (!selectedAtom.value)
    return `v2-atom::unknown::${field}`

  return `v2-atom::${selectedAtom.value.id}::${field}`
}

const atomTools = computed<Tool[]>(() => {
  if (!selectedAtom.value)
    return []

  if (selectedAtom.value.type === 'text') {
    return [
      {
        id: atomToolId('color'),
        key: 'mainColor',
        label: 'Main Color',
        type: 'colorPicker',
        value: selectedAtom.value.color || DEFAULT_TEXT_MAIN_COLOR,
      },
      {
        id: atomToolId('content'),
        key: 'content',
        label: 'Content',
        type: 'textEditor',
        value: selectedAtom.value.value,
      },
      {
        id: atomToolId('spacing'),
        key: 'spacing',
        label: 'Spacings',
        type: 'spacing',
        value: normalizeSpacingValue(selectedAtom.value.spacing),
      },
    ]
  }

  if (selectedAtom.value.type === 'button') {
    return [
      {
        id: atomToolId('text'),
        key: 'text',
        label: 'Text',
        type: 'input',
        value: selectedAtom.value.text,
      },
      {
        id: atomToolId('link'),
        key: 'link',
        label: 'Link',
        type: 'input',
        value: selectedAtom.value.link,
      },
      {
        id: atomToolId('backgroundColor'),
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'colorPicker',
        value: selectedAtom.value.backgroundColor,
      },
      {
        id: atomToolId('color'),
        key: 'color',
        label: 'Color',
        type: 'colorPicker',
        value: selectedAtom.value.color,
      },
      {
        id: atomToolId('fontSize'),
        key: 'fontSize',
        label: 'Font Size',
        type: 'inputNumber',
        value: selectedAtom.value.fontSize,
      },
      {
        id: atomToolId('borderRadius'),
        key: 'borderRadius',
        label: 'Border Radius',
        type: 'inputNumber',
        value: selectedAtom.value.borderRadius,
      },
      {
        id: atomToolId('spacing'),
        key: 'spacing',
        label: 'Spacings',
        type: 'spacing',
        value: normalizeSpacingValue(selectedAtom.value.spacing, selectedAtom.value.padding),
      },
    ]
  }

  if (selectedAtom.value.type === 'image') {
    return [
      {
        id: atomToolId('image'),
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
      {
        id: atomToolId('borderRadius'),
        key: 'borderRadius',
        label: 'Border Radius',
        type: 'inputNumber',
        value: selectedAtom.value.borderRadius ?? 0,
      },
      {
        id: atomToolId('spacing'),
        key: 'spacing',
        label: 'Spacings',
        type: 'spacing',
        value: normalizeSpacingValue(selectedAtom.value.spacing),
      },
    ]
  }

  if (selectedAtom.value.type === 'menu') {
    return [
      {
        id: atomToolId('menuItemType'),
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
        id: atomToolId('gap'),
        key: 'gap',
        label: 'Gap',
        type: 'inputNumber',
        value: selectedAtom.value.gap ?? 10,
      },
      {
        id: atomToolId('menuList'),
        key: 'list',
        label: 'List',
        type: 'multi',
        value: toMenuListToolValue(selectedAtom.value),
      },
      {
        id: atomToolId('spacing'),
        key: 'spacing',
        label: 'Spacings',
        type: 'spacing',
        value: normalizeSpacingValue(selectedAtom.value.spacing),
      },
    ]
  }

  return [
    {
      id: atomToolId('color'),
      key: 'color',
      label: 'Color',
      type: 'colorPicker',
      value: selectedAtom.value.color,
    },
    {
      id: atomToolId('height'),
      key: 'height',
      label: 'Height',
      type: 'inputNumber',
      value: selectedAtom.value.height,
    },
    {
      id: atomToolId('spacing'),
      key: 'spacing',
      label: 'Spacings',
      type: 'spacing',
      value: normalizeSpacingValue(selectedAtom.value.spacing),
    },
  ]
})
</script>

<template>
  <div class="block-settings-panel">
    <!-- ================= BLOCK LEVEL ================= -->
    <EditorPanel v-if="selectionLevel === 'block' && selectedBlock">
      <EditorPanelItem
        type="opened"
        :title="selectedBlock.label || 'Block'"
      >
        <div class="space-y-3 pb-2">
          <EditorComponentTools :tools="blockAppearanceTools" />

          <!-- Actions -->
          <div class="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              class="flex-1"
              @click="insertRowToBlock(selectedBlockId!)"
            >
              + Grid
            </Button>
          </div>
        </div>
      </EditorPanelItem>
    </EditorPanel>

    <EditorPanel v-if="selectionLevel === 'row' && selectedRow && selectedBlock">
      <EditorPanelItem
        type="opened"
        title="Row"
      >
        <div class="space-y-3 pb-2">
          <EditorComponentTools :tools="rowAppearanceTools" />

          <!-- Actions -->
          <div class="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              class="flex-1"
              @click="insertCellToRow(selectedBlockId!, selectedRowId!)"
            >
              + Cell
            </Button>
            <Button
              v-if="canRemoveSelectedRow"
              variant="destructive"
              size="sm"
              @click="removeRow(selectedBlockId!, selectedRowId!)"
            >
              Remove
            </Button>
          </div>
        </div>
      </EditorPanelItem>
    </EditorPanel>

    <EditorPanel v-if="selectionLevel === 'cell' && selectedCell && selectedBlock">
      <EditorPanelItem
        type="opened"
        title="Cell"
      >
        <div class="space-y-3 pb-2">
          <EditorComponentTools :tools="cellAppearanceTools" />

          <!-- Vertical Align -->
          <div>
            <EditorToolLabel>Vertical Align</EditorToolLabel>
            <ToggleGroup
              :model-value="selectedCell.settings.verticalAlign"
              type="single"
              size="sm"
              variant="outline"
              :spacing="0"
              _class="w-full"
              @update:model-value="(v) => onItemVerticalAlignChange(String(v))"
            >
              <ToggleGroupItem
                value="top"
                class="flex-1"
              >
                <AlignVerticalJustifyStart class="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="middle"
                class="flex-1"
              >
                <AlignVerticalJustifyCenter class="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="bottom"
                class="flex-1"
              >
                <AlignVerticalJustifyEnd class="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <!-- Horizontal Align -->
          <div>
            <EditorToolLabel>Horizontal Align</EditorToolLabel>
            <ToggleGroup
              :model-value="getItemHorizontalAlign()"
              type="single"
              size="sm"
              variant="outline"
              :spacing="0"
              _class="w-full"
              @update:model-value="(v) => onItemHorizontalAlignChange(String(v))"
            >
              <ToggleGroupItem
                value="left"
                class="flex-1"
              >
                <AlignLeft class="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="center"
                class="flex-1"
              >
                <AlignCenter class="size-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="right"
                class="flex-1"
              >
                <AlignRight class="size-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <!-- Width -->
          <div>
            <EditorToolLabel>Width</EditorToolLabel>
            <Select
              :model-value="getItemWidthMode()"
              @update:model-value="(v) => onItemWidthModeChange(String(v))"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  Auto
                </SelectItem>
                <SelectItem value="manual">
                  Manual
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="getItemWidthMode() === 'manual'">
            <EditorToolLabel>Width (%)</EditorToolLabel>
            <Input
              type="number"
              size="sm"
              placeholder="50"
              :model-value="selectedCell.settings.width ?? ''"
              @update:model-value="(v: string | number) => onItemWidthChange(v)"
            />
          </div>

          <!-- Height -->
          <div>
            <EditorToolLabel>Height</EditorToolLabel>
            <Select
              :model-value="getItemHeightMode()"
              @update:model-value="(v) => onItemHeightModeChange(String(v))"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">
                  Auto
                </SelectItem>
                <SelectItem value="manual">
                  Manual
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="getItemHeightMode() === 'manual'">
            <EditorToolLabel>Height (px)</EditorToolLabel>
            <Input
              type="number"
              size="sm"
              placeholder="120"
              :model-value="selectedCell.settings.height ?? ''"
              @update:model-value="(v: string | number) => onItemHeightChange(v)"
            />
          </div>
        </div>
      </EditorPanelItem>
    </EditorPanel>

    <!-- ================= ATOM LEVEL ================= -->
    <EditorPanel v-if="selectionLevel === 'atom' && selectedAtom">
      <EditorPanelItem
        type="opened"
        :title="selectedAtom.type.charAt(0).toUpperCase() + selectedAtom.type.slice(1)"
      >
        <div class="space-y-3 pb-2">
          <EditorComponentTools
            v-if="atomTools.length"
            :tools="atomTools"
          />

          <!-- Remove -->
          <div class="pt-2 border-t border-border">
            <Button
              variant="destructive"
              size="sm"
              class="w-full"
              @click="
                removeAtom(selectedBlockId!, selectedRowId!, selectedCellId!, selectedAtom!.id)
              "
            >
              Remove Atom
            </Button>
          </div>
        </div>
      </EditorPanelItem>
    </EditorPanel>
  </div>
</template>
