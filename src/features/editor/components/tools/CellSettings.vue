<script setup lang="ts">
import type { DimensionMode } from './use-settings-tools'
import type { CellNode } from '@/entities/block'
import type { Tool } from '@/features/editor/model'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
} from 'lucide-vue-next'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'

interface Props {
  cell: CellNode
  spacingTools: Tool[]
  appearanceTools: Tool[]
  widthMode: DimensionMode
  heightMode: DimensionMode
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:widthMode', value: string): void
  (e: 'update:heightMode', value: string): void
  (e: 'update:width', value: string | number): void
  (e: 'update:height', value: string | number): void
  (e: 'update:verticalAlign', value: string): void
  (e: 'update:horizontalAlign', value: string): void
}>()

const cellHiddenOnMobile = defineModel<boolean>('hiddenOnMobile', { required: true })
</script>

<template>
  <EditorPanel data-slot="cell-settings">
    <EditorPanelItem
      type="opened"
      title="Cell"
    >
      <div class="space-y-3 pb-2">
        <EditorComponentTools :tools="spacingTools" />
        <div class="space-y-3">
          <EditorToolLabel>View</EditorToolLabel>
          <div>
            <EditorToolLabel type="secondary">
              Hide on Mobile
            </EditorToolLabel>
            <Switch v-model="cellHiddenOnMobile" />
          </div>
        </div>

        <div class="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] gap-4">
          <div>
            <EditorToolLabel>Width</EditorToolLabel>
            <Select
              :model-value="widthMode"
              @update:model-value="(v) => emit('update:widthMode', String(v))"
            >
              <SelectTrigger class="w-full">
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
          <div>
            <EditorToolLabel>Width (%)</EditorToolLabel>
            <Input
              type="number"
              :disabled="widthMode !== 'manual'"
              :placeholder="widthMode === 'manual' ? '50' : 'Auto'"
              :model-value="cell.settings.width ?? ''"
              @update:model-value="(v: string | number) => emit('update:width', v)"
            />
          </div>
        </div>

        <div class="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] gap-4">
          <div>
            <EditorToolLabel>Height</EditorToolLabel>
            <Select
              :model-value="heightMode"
              @update:model-value="(v) => emit('update:heightMode', String(v))"
            >
              <SelectTrigger class="w-full">
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
          <div>
            <EditorToolLabel>Height (px)</EditorToolLabel>
            <Input
              type="number"
              :disabled="heightMode !== 'manual'"
              :placeholder="heightMode === 'manual' ? '120' : 'Auto'"
              :model-value="cell.settings.height ?? ''"
              @update:model-value="(v: string | number) => emit('update:height', v)"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <EditorToolLabel>Vertical Align</EditorToolLabel>
            <ToggleGroup
              :model-value="cell.settings.verticalAlign"
              type="single"
              size="sm"
              variant="outline"
              :spacing="0"
              class="w-full"
              @update:model-value="(v) => emit('update:verticalAlign', String(v))"
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
          <div>
            <EditorToolLabel>Horizontal Align</EditorToolLabel>
            <ToggleGroup
              :model-value="cell.settings.horizontalAlign ?? 'left'"
              type="single"
              size="sm"
              variant="outline"
              :spacing="0"
              class="w-full"
              @update:model-value="(v) => emit('update:horizontalAlign', String(v))"
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
        </div>

        <EditorComponentTools :tools="appearanceTools" />
      </div>
    </EditorPanelItem>
  </EditorPanel>
</template>
