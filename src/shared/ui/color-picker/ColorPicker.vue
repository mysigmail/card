<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ColorPickerSize } from '.'
import type { ColorDisplayFormat, HsvColorChannels } from '@/entities/style'
import { useVModel } from '@vueuse/core'
import { ChevronDown, Pipette } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import {
  emailColorChannelsToHsv,
  formatColorChannel,
  hslToHsvColorChannels,
  hsvToEmailColorChannels,
  hsvToHslColorChannels,
  normalizeColorPickerInput,
  normalizeEmailColorChannels,
  parseEmailColor,
  toPickerHexAlpha,
} from '@/entities/style'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { colorPickerSizes } from '.'
import { createColorPickerCommitSession, snapshotColorPalettes } from './color-picker-session'
import 'vanilla-colorful/hsva-color-picker.js'

interface PickerHsvaColor {
  h: number
  s: number
  v: number
  a: number
}

interface ChannelValues {
  hex: string
  red: string
  green: string
  blue: string
  hue: string
  saturation: string
  lightness: string
  alpha: string
}

interface Props {
  class?: HTMLAttributes['class']
  modelValue?: string
  defaultValue?: string
  presets?: string[]
  recentColors?: string[]
  documentColors?: string[]
  size?: ColorPickerSize
  showInput?: boolean
  showReset?: boolean
  resetValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: '',
  presets: () => ['#F56C6C', '#E6A23C', '#67C23A', '#396BDD', '#000000', '#FFFFFF'],
  recentColors: () => [],
  documentColors: () => [],
  size: 'default',
  showInput: true,
  showReset: true,
  resetValue: '',
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
  (e: 'commit', payload: string): void
}>()

const COLOR_FORMAT_STORAGE_KEY = 'card.color-picker.format.v1'

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const sizeClasses = computed(() => colorPickerSizes[props.size])
const displayFormat = ref<ColorDisplayFormat>(readStoredDisplayFormat())
const visualColor = ref<HsvColorChannels>(createVisualColor(modelValue.value))
const pickerColor = computed<PickerHsvaColor>(() => ({
  h: visualColor.value.hue,
  s: visualColor.value.saturation,
  v: visualColor.value.value,
  a: visualColor.value.alpha,
}))
const channelValues = ref<ChannelValues>(createChannelValues(visualColor.value))
const pendingCanonicalColor = ref<string>()
const open = ref(false)
const recentSnapshot = ref<string[]>([])
const documentSnapshot = ref<string[]>([])
const pickerSession = createColorPickerCommitSession(value => emits('commit', value))
const canUseEyeDropper = computed(() => {
  return typeof window !== 'undefined' && window.isSecureContext && 'EyeDropper' in window
})

watch(modelValue, (value) => {
  if (pendingCanonicalColor.value === value) {
    pendingCanonicalColor.value = undefined
    return
  }
  visualColor.value = createVisualColor(value)
  channelValues.value = createChannelValues(visualColor.value)
  pendingCanonicalColor.value = undefined
})

watch(displayFormat, (value) => {
  channelValues.value = createChannelValues(visualColor.value)
  try {
    localStorage.setItem(COLOR_FORMAT_STORAGE_KEY, value)
  }
  catch {
    // The format is a best-effort local UI preference.
  }
})

function readStoredDisplayFormat(): ColorDisplayFormat {
  try {
    const value = localStorage.getItem(COLOR_FORMAT_STORAGE_KEY)
    if (value === 'hex' || value === 'rgb' || value === 'hsl')
      return value
  }
  catch {
    // Use the stable default when storage is unavailable.
  }
  return 'hex'
}

function createVisualColor(value?: string): HsvColorChannels {
  const color = parseEmailColor(value) ?? { red: 0, green: 0, blue: 0, alpha: 1 }
  return emailColorChannelsToHsv(color)
}

function createChannelValues(color: HsvColorChannels): ChannelValues {
  const rgb = hsvToEmailColorChannels(color)
  const hsl = hsvToHslColorChannels(color)
  const canonical = normalizeEmailColorChannels(rgb)
  return {
    hex: toPickerHexAlpha(canonical).slice(0, 7),
    red: String(rgb.red),
    green: String(rgb.green),
    blue: String(rgb.blue),
    hue: formatColorChannel(hsl.hue),
    saturation: formatColorChannel(hsl.saturation),
    lightness: formatColorChannel(hsl.lightness),
    alpha: formatColorChannel(color.alpha * 100),
  }
}

function applyVisualColor(color: HsvColorChannels) {
  const normalized = normalizeEmailColorChannels(hsvToEmailColorChannels(color))
  pendingCanonicalColor.value = normalized
  visualColor.value = color
  channelValues.value = createChannelValues(color)
  modelValue.value = normalized
  pickerSession.update(normalized)
}

function update(value: string) {
  const normalized = normalizeColorPickerInput(value)
  if (!normalized) {
    channelValues.value = createChannelValues(visualColor.value)
    return
  }
  const channels = parseEmailColor(normalized)
  if (!channels)
    return
  applyVisualColor(emailColorChannelsToHsv(channels))
}

function applyChannelValues(channel: keyof ChannelValues) {
  const alphaPercent = Number(channelValues.value.alpha)
  if (!Number.isInteger(alphaPercent) || alphaPercent < 0 || alphaPercent > 100) {
    channelValues.value = createChannelValues(visualColor.value)
    return
  }
  const alpha = alphaPercent / 100
  if (channel === 'alpha') {
    applyVisualColor({ ...visualColor.value, alpha })
    return
  }
  let candidate: string
  if (displayFormat.value === 'hex') {
    const hex = channelValues.value.hex.trim()
    const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`
    const color = parseEmailColor(normalizedHex)
    if (!color) {
      channelValues.value = createChannelValues(visualColor.value)
      return
    }
    candidate = `rgba(${color.red},${color.green},${color.blue},${alpha})`
  }
  else if (displayFormat.value === 'rgb') {
    const channels = [
      Number(channelValues.value.red),
      Number(channelValues.value.green),
      Number(channelValues.value.blue),
    ]
    if (channels.some(channel => !Number.isInteger(channel) || channel < 0 || channel > 255)) {
      channelValues.value = createChannelValues(visualColor.value)
      return
    }
    candidate = `rgba(${channels[0]},${channels[1]},${channels[2]},${alpha})`
  }
  else {
    const hue = Number(channelValues.value.hue)
    const saturation = Number(channelValues.value.saturation)
    const lightness = Number(channelValues.value.lightness)
    if (
      !Number.isInteger(hue)
      || hue < 0
      || hue > 359
      || !Number.isInteger(saturation)
      || saturation < 0
      || saturation > 100
      || !Number.isInteger(lightness)
      || lightness < 0
      || lightness > 100
    ) {
      channelValues.value = createChannelValues(visualColor.value)
      return
    }
    const current = hsvToHslColorChannels(visualColor.value)
    applyVisualColor(
      hslToHsvColorChannels({
        hue: channel === 'hue' ? hue : current.hue,
        saturation: channel === 'saturation' ? saturation : current.saturation,
        lightness: channel === 'lightness' ? lightness : current.lightness,
        alpha,
      }),
    )
    return
  }
  update(candidate)
}

function stepChannel(
  channel: keyof ChannelValues,
  delta: -1 | 1,
  minimum: number,
  maximum: number,
) {
  const current = Number(channelValues.value[channel])
  const next = Math.min(
    maximum,
    Math.max(minimum, (Number.isInteger(current) ? current : minimum) + delta),
  )
  channelValues.value[channel] = String(next)
  applyChannelValues(channel)
}

function onChange(event: Event & { target: { color: PickerHsvaColor } }) {
  const { h, s, v, a } = event.target.color
  applyVisualColor({ hue: h, saturation: s, value: v, alpha: a })
}

function commitPickerColor() {
  pickerSession.flush()
}

function reset() {
  pickerSession.discard()
  modelValue.value = props.resetValue
  visualColor.value = createVisualColor(props.resetValue)
  channelValues.value = createChannelValues(visualColor.value)
}

async function openEyeDropper() {
  if (!canUseEyeDropper.value)
    return
  try {
    const EyeDropper = (
      window as unknown as {
        EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> }
      }
    ).EyeDropper
    const result = await new EyeDropper().open()
    update(result.sRGBHex)
  }
  catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      return
    console.warn('EyeDropper failed', error)
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    const snapshot = snapshotColorPalettes(props.recentColors, props.documentColors)
    recentSnapshot.value = snapshot.recent
    documentSnapshot.value = snapshot.document
    return
  }
  commitPickerColor()
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        type="button"
        variant="outline"
        data-slot="color-picker-trigger"
        aria-label="Choose color"
        :class="cn(sizeClasses.trigger, props.class)"
      >
        <div
          :class="
            cn(
              'relative shrink-0 rounded-sm border border-input bg-white p-0.5',
              sizeClasses.swatch,
            )
          "
        >
          <div class="p-color-checker size-full rounded-[2px]">
            <div
              class="size-full rounded-[2px] border border-black/5"
              :style="{ backgroundColor: modelValue || 'transparent' }"
            />
          </div>
          <span
            v-if="!modelValue"
            class="absolute inset-0 flex items-center justify-center text-md leading-none text-muted-foreground select-none"
          >
            ×
          </span>
        </div>
        <ChevronDown
          :class="cn('shrink-0 text-muted-foreground', sizeClasses.chevron)"
          aria-hidden="true"
        />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      :collision-padding="8"
      class="max-h-[var(--reka-popover-content-available-height)] w-[292px] overflow-hidden p-0"
    >
      <ScrollArea
        type="auto"
        class="max-h-[var(--reka-popover-content-available-height)]"
        viewport-class="max-h-[var(--reka-popover-content-available-height)]"
      >
        <div class="space-y-2 p-4 pr-5">
          <hsva-color-picker
            data-color-picker
            class="w-full"
            :color="pickerColor"
            @color-changed="onChange"
          />
          <div
            v-if="showInput || canUseEyeDropper"
            class="flex items-center gap-2"
          >
            <Button
              v-if="canUseEyeDropper"
              type="button"
              variant="outline"
              size="icon-sm"
              class="shrink-0"
              aria-label="Pick color from screen"
              title="Pick color from screen"
              @click="openEyeDropper"
            >
              <Pipette class="size-4" />
            </Button>
            <Select
              v-if="showInput"
              v-model="displayFormat"
            >
              <SelectTrigger
                size="sm"
                class="w-[76px] shrink-0 px-2"
                aria-label="Color format"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent class="min-w-[76px]">
                <SelectItem value="hex">
                  HEX
                </SelectItem>
                <SelectItem value="rgb">
                  RGB
                </SelectItem>
                <SelectItem value="hsl">
                  HSL
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div
            v-if="showInput"
            class="grid gap-1.5"
            :class="displayFormat === 'hex' ? 'grid-cols-[minmax(0,1fr)_72px]' : 'grid-cols-4'"
          >
            <label
              v-if="displayFormat === 'hex'"
              class="min-w-0 space-y-1"
            >
              <span class="block text-[10px] font-medium text-muted-foreground">HEX</span>
              <Input
                v-model="channelValues.hex"
                size="sm"
                class="px-2 text-xs"
                aria-label="Hex color"
                autocomplete="off"
                spellcheck="false"
                @change="applyChannelValues('hex')"
                @keydown.enter.prevent="applyChannelValues('hex')"
              />
            </label>
            <template v-else-if="displayFormat === 'rgb'">
              <label
                v-for="channel in ['red', 'green', 'blue'] as const"
                :key="channel"
                class="min-w-0 space-y-1"
              >
                <span class="block text-[10px] font-medium uppercase text-muted-foreground">{{
                  channel[0]
                }}</span>
                <Input
                  v-model="channelValues[channel]"
                  type="number"
                  size="sm"
                  class="px-2 text-xs"
                  inputmode="numeric"
                  min="0"
                  max="255"
                  step="1"
                  :aria-label="`${channel} channel`"
                  @change="applyChannelValues(channel)"
                  @keydown.enter.prevent="applyChannelValues(channel)"
                  @keydown.up.prevent="stepChannel(channel, 1, 0, 255)"
                  @keydown.down.prevent="stepChannel(channel, -1, 0, 255)"
                />
              </label>
            </template>
            <template v-else>
              <label
                v-for="channel in ['hue', 'saturation', 'lightness'] as const"
                :key="channel"
                class="min-w-0 space-y-1"
              >
                <span class="block text-[10px] font-medium uppercase text-muted-foreground">{{
                  channel[0]
                }}</span>
                <Input
                  v-model="channelValues[channel]"
                  type="number"
                  size="sm"
                  class="px-2 text-xs"
                  inputmode="numeric"
                  min="0"
                  :max="channel === 'hue' ? 359 : 100"
                  step="1"
                  :aria-label="`${channel} channel`"
                  @change="applyChannelValues(channel)"
                  @keydown.enter.prevent="applyChannelValues(channel)"
                  @keydown.up.prevent="stepChannel(channel, 1, 0, channel === 'hue' ? 359 : 100)"
                  @keydown.down.prevent="stepChannel(channel, -1, 0, channel === 'hue' ? 359 : 100)"
                />
              </label>
            </template>
            <label class="min-w-0 space-y-1">
              <span class="block text-[10px] font-medium text-muted-foreground">Alpha</span>
              <div class="relative">
                <Input
                  v-model="channelValues.alpha"
                  type="number"
                  size="sm"
                  class="px-2 pr-5 text-xs"
                  inputmode="numeric"
                  min="0"
                  max="100"
                  step="1"
                  aria-label="Alpha percentage"
                  @change="applyChannelValues('alpha')"
                  @keydown.enter.prevent="applyChannelValues('alpha')"
                  @keydown.up.prevent="stepChannel('alpha', 1, 0, 100)"
                  @keydown.down.prevent="stepChannel('alpha', -1, 0, 100)"
                />
                <span
                  class="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-[10px] text-muted-foreground"
                >%</span>
              </div>
            </label>
          </div>
          <div
            v-if="showReset || presets.length"
            class="flex flex-wrap gap-2"
          >
            <Button
              v-if="showReset"
              type="button"
              variant="outline"
              size="icon-xs"
              aria-label="Reset color"
              class="text-xs text-muted-foreground"
              @click="reset"
            >
              ×
            </Button>
            <Button
              v-for="preset in presets"
              :key="preset"
              type="button"
              variant="outline"
              size="icon-xs"
              :aria-label="`Use preset color ${preset}`"
              class="overflow-hidden p-0"
              :style="{ backgroundColor: preset }"
              @click="update(preset)"
            />
          </div>
          <div
            v-if="recentSnapshot.length"
            class="space-y-1"
          >
            <div class="text-xs text-muted-foreground">
              Recent
            </div>
            <div class="flex max-w-56 flex-wrap gap-1.5">
              <Button
                v-for="color in recentSnapshot"
                :key="color"
                type="button"
                variant="outline"
                size="icon-xs"
                class="p-color-checker overflow-hidden p-0"
                :aria-label="`Use recent color ${color}`"
                @click="update(color)"
              >
                <span
                  class="block size-full"
                  :style="{ backgroundColor: color }"
                />
              </Button>
            </div>
          </div>
          <div
            v-if="documentSnapshot.length"
            class="space-y-1"
          >
            <div class="text-xs text-muted-foreground">
              Document
            </div>
            <div class="flex max-w-56 flex-wrap gap-1.5">
              <Button
                v-for="color in documentSnapshot"
                :key="color"
                type="button"
                variant="outline"
                size="icon-xs"
                class="p-color-checker overflow-hidden p-0"
                :aria-label="`Use document color ${color}`"
                @click="update(color)"
              >
                <span
                  class="block size-full"
                  :style="{ backgroundColor: color }"
                />
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
[data-color-picker] {
  height: auto;
}

[data-color-picker]::part(saturation) {
  flex: 0 0 auto;
  box-sizing: border-box;
  aspect-ratio: 1 / 1;
  border-radius: 6px 6px 0 0;
}

[data-color-picker]::part(hue) {
  border-radius: 0;
}

[data-color-picker]::part(alpha) {
  border-radius: 0 0 6px 6px;
}

[data-color-picker]::part(saturation-pointer),
[data-color-picker]::part(hue-pointer),
[data-color-picker]::part(alpha-pointer) {
  z-index: 4;
  width: 24px;
  height: 24px;
  border: 3px solid white;
  box-shadow: 0 2px 5px rgb(0 0 0 / 35%);
}

.p-color-checker {
  background-color: white;
  background-image:
    linear-gradient(45deg, #d1d5db 25%, transparent 25%),
    linear-gradient(-45deg, #d1d5db 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #d1d5db 75%),
    linear-gradient(-45deg, transparent 75%, #d1d5db 75%);
  background-position:
    0 0,
    0 4px,
    4px -4px,
    -4px 0;
  background-size: 8px 8px;
}
</style>
