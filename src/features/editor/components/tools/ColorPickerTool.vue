<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  formatColorChannel,
  normalizeEmailColorChannels,
  normalizeHexColorPickerInput,
  parseEmailColor,
  toPickerHexInput,
} from '@/entities/style'
import { useColorPalettes } from '@/features/editor/model'
import { ColorPicker } from '@/shared/ui/color-picker'
import { Input } from '@/shared/ui/input'

interface Props {
  id: string
  value: string
  title: string
  pressets?: string[]
  resetValue?: string
}

interface Emits {
  (e: 'update:value', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  pressets: () => ['#F56C6C', '#E6A23C', '#67C23A', '#396BDD', '#000000', '#FFFFFF'],
})

const emit = defineEmits<Emits>()
const { documentColors, recentColors, rememberColor } = useColorPalettes()
const hexInput = ref('')
const hexInputInvalid = ref(false)
const alphaInput = ref('100')
const alphaInputInvalid = ref(false)

watch(
  () => props.value,
  (value) => {
    hexInput.value = toPickerHexInput(value)
    hexInputInvalid.value = false
    alphaInput.value
      = value === 'transparent' ? '0' : formatColorChannel((parseEmailColor(value)?.alpha ?? 1) * 100)
    alphaInputInvalid.value = false
  },
  { immediate: true },
)

function applyHexInput() {
  const normalized = normalizeHexColorPickerInput(hexInput.value)
  const color = normalized ? parseEmailColor(normalized) : undefined
  if (!color) {
    hexInputInvalid.value = true
    return
  }
  const alpha = parseAlphaInput()
  if (alpha === undefined)
    return
  const next = normalizeEmailColorChannels({ ...color, alpha })
  hexInput.value = toPickerHexInput(next)
  hexInputInvalid.value = false
  emit('update:value', next)
  rememberColor(next)
}

function parseAlphaInput() {
  const value = Number(alphaInput.value)
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    alphaInputInvalid.value = true
    return undefined
  }
  alphaInputInvalid.value = false
  return value / 100
}

function applyAlphaInput() {
  const normalized = normalizeHexColorPickerInput(hexInput.value)
  const color = normalized ? parseEmailColor(normalized) : undefined
  if (!color) {
    hexInputInvalid.value = true
    return
  }
  const alpha = parseAlphaInput()
  if (alpha === undefined)
    return
  const next = normalizeEmailColorChannels({ ...color, alpha })
  emit('update:value', next)
  rememberColor(next)
}
</script>

<template>
  <div data-slot="color-picker-tool">
    <EditorToolLabel>{{ title }}</EditorToolLabel>
    <div class="flex items-center gap-2">
      <ColorPicker
        size="sm"
        :model-value="props.value"
        :presets="props.pressets"
        :show-reset="props.resetValue !== undefined"
        :reset-value="props.resetValue"
        :recent-colors="recentColors"
        :document-colors="documentColors"
        @commit="rememberColor"
        @update:model-value="(value) => emit('update:value', value)"
      />
      <Input
        v-model="hexInput"
        size="sm"
        class="min-w-0 flex-1 font-mono uppercase"
        aria-label="Quick hex color"
        autocomplete="off"
        spellcheck="false"
        placeholder="#RRGGBB"
        :aria-invalid="hexInputInvalid"
        @input="hexInputInvalid = false"
        @change="applyHexInput"
        @keydown.enter.prevent="applyHexInput"
      />
      <div class="relative w-[72px] shrink-0">
        <Input
          v-model="alphaInput"
          size="sm"
          type="number"
          class="pr-6"
          aria-label="Quick color opacity"
          inputmode="numeric"
          min="0"
          max="100"
          step="1"
          :aria-invalid="alphaInputInvalid"
          @input="alphaInputInvalid = false"
          @change="applyAlphaInput"
          @keydown.enter.prevent="applyAlphaInput"
        />
        <span
          class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground"
        >%</span>
      </div>
    </div>
  </div>
</template>
