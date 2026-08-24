<script setup lang="ts">
import type { BorderSideValue, BorderStyle } from '@/entities/style'
import { PanelTop } from 'lucide-vue-next'
import { BORDER_STYLES, normalizeEmailColor } from '@/entities/style'
import { useColorPalettes } from '@/features/editor/model'
import { ColorPicker } from '@/shared/ui/color-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import ScrubbableNumberField from './number/ScrubbableNumberField.vue'

const props = defineProps<{
  id: string
  value: BorderSideValue
  allowZero?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:value', value: Partial<BorderSideValue>): void
}>()
const { documentColors, recentColors, rememberColor } = useColorPalettes()

function updateWidth(value: string | number) {
  if (value === '')
    return
  const width = Number(value)
  const minimum = props.allowZero ? 0 : 1
  if (Number.isInteger(width) && width >= minimum)
    emit('update:value', { width })
}

function updateColor(value: string) {
  const color = normalizeEmailColor(value)
  if (color)
    emit('update:value', { color })
}
</script>

<template>
  <div
    data-slot="border-value-controls"
    class="grid grid-cols-3 items-end gap-2"
  >
    <div :class="allowZero && value.width === 0 ? 'pointer-events-none opacity-50' : ''">
      <EditorToolLabel level="parameter">
        Color
      </EditorToolLabel>
      <ColorPicker
        class="w-full justify-between"
        size="sm"
        :model-value="value.color"
        :show-reset="false"
        :show-input="false"
        :recent-colors="recentColors"
        :document-colors="documentColors"
        @commit="rememberColor"
        @update:model-value="updateColor"
      />
    </div>

    <div :class="allowZero && value.width === 0 ? 'pointer-events-none opacity-50' : ''">
      <EditorToolLabel level="parameter">
        Style
      </EditorToolLabel>
      <Select
        :model-value="value.style"
        @update:model-value="(next) => emit('update:value', { style: String(next) as BorderStyle })"
      >
        <SelectTrigger
          :id="`${id}-style`"
          size="sm"
          class="w-full"
          aria-label="Border style"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="style in BORDER_STYLES"
            :key="style"
            :value="style"
          >
            {{ style }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      <EditorToolLabel level="parameter">
        Width
      </EditorToolLabel>
      <ScrubbableNumberField
        :model-value="value.width"
        :default-value="1"
        label="Border width"
        :min="allowZero ? 0 : 1"
        :max="9999"
        :step="1"
        @update:model-value="(width) => width !== undefined && updateWidth(width)"
      >
        <template #prefix>
          <PanelTop />
        </template>
      </ScrubbableNumberField>
    </div>
  </div>
</template>
