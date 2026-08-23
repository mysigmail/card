<script setup lang="ts">
import type { BorderSideValue, BorderStyle } from '@/entities/style'
import { BORDER_STYLES, normalizeOpaqueHex } from '@/entities/style'
import { ColorPicker } from '@/shared/ui/color-picker'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const props = defineProps<{
  id: string
  value: BorderSideValue
  allowZero?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:value', value: Partial<BorderSideValue>): void
}>()

function updateWidth(value: string | number) {
  if (value === '')
    return
  const width = Number(value)
  const minimum = props.allowZero ? 0 : 1
  if (Number.isInteger(width) && width >= minimum)
    emit('update:value', { width })
}

function updateColor(value: string) {
  const color = normalizeOpaqueHex(value)
  if (color)
    emit('update:value', { color })
}
</script>

<template>
  <div
    data-slot="border-value-controls"
    class="grid grid-cols-[72px_minmax(0,1fr)_auto] items-end gap-2"
  >
    <div>
      <EditorToolLabel type="secondary">
        Width
      </EditorToolLabel>
      <div class="relative">
        <Input
          :id="`${id}-width`"
          type="number"
          :min="allowZero ? 0 : 1"
          step="1"
          class="pr-7"
          :model-value="value.width"
          aria-label="Border width"
          @update:model-value="updateWidth"
        />
        <span
          class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground"
        >
          px
        </span>
      </div>
    </div>

    <div :class="allowZero && value.width === 0 ? 'pointer-events-none opacity-50' : ''">
      <EditorToolLabel type="secondary">
        Style
      </EditorToolLabel>
      <Select
        :model-value="value.style"
        @update:model-value="(next) => emit('update:value', { style: String(next) as BorderStyle })"
      >
        <SelectTrigger
          :id="`${id}-style`"
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

    <div :class="allowZero && value.width === 0 ? 'pointer-events-none opacity-50' : ''">
      <EditorToolLabel type="secondary">
        Color
      </EditorToolLabel>
      <ColorPicker
        :model-value="value.color"
        :show-reset="false"
        :show-input="false"
        @update:model-value="updateColor"
      />
    </div>
  </div>
</template>
