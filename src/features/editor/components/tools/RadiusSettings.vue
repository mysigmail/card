<script setup lang="ts">
import type { BorderRadiusValue } from '@/entities/style'
import { Radius, Scan } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { BORDER_RADIUS_CORNERS, createBorderRadiusValue } from '@/entities/style'
import { Button } from '@/shared/ui/button'
import ScrubbableNumberField from './number/ScrubbableNumberField.vue'

const props = defineProps<{
  compact?: boolean
  id: string
  title: string
  value: BorderRadiusValue
}>()
const emit = defineEmits<{ (event: 'update:value', value: BorderRadiusValue): void }>()

function hasIndependentCorners(value: BorderRadiusValue) {
  return BORDER_RADIUS_CORNERS.some(corner => value[corner] !== value.topLeft)
}

const advanced = ref(hasIndependentCorners(props.value))
const corners = computed(() => props.value)
const unifiedValue = computed(() =>
  hasIndependentCorners(props.value) ? 'mixed' : corners.value.topLeft,
)

watch(
  () => props.value,
  (value) => {
    if (hasIndependentCorners(value))
      advanced.value = true
  },
  { deep: true },
)

function parseNonNegative(value: string | number) {
  if (value === '')
    return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function updateScrubbedGlobal(value: number | undefined) {
  if (value !== undefined)
    emit('update:value', createBorderRadiusValue(value))
}

function setAdvanced(value: boolean) {
  advanced.value = value
}

function updateCorner(corner: keyof BorderRadiusValue, value: string | number) {
  const parsed = parseNonNegative(value)
  if (parsed === undefined)
    return
  emit('update:value', { ...corners.value, [corner]: parsed })
}

const CORNER_LABELS: Record<keyof BorderRadiusValue, string> = {
  topLeft: 'Top left',
  topRight: 'Top right',
  bottomRight: 'Bottom right',
  bottomLeft: 'Bottom left',
}

const CORNER_SHORT_LABELS: Record<keyof BorderRadiusValue, string> = {
  topLeft: 'TL',
  topRight: 'TR',
  bottomRight: 'BR',
  bottomLeft: 'BL',
}

const UI_CORNER_ORDER: Array<keyof BorderRadiusValue> = [
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
]
</script>

<template>
  <div
    data-slot="radius-settings"
    class="space-y-1"
    :class="{ 'col-span-2': compact && advanced }"
  >
    <div class="flex items-center justify-between gap-3">
      <EditorToolLabel>
        {{ title }}
      </EditorToolLabel>
      <Button
        variant="ghost"
        size="icon-xs"
        :aria-pressed="advanced"
        aria-label="Use separate border radius corners"
        :title="advanced ? 'Use one corner radius' : 'Use separate corner radii'"
        @click="setAdvanced(!advanced)"
      >
        <Scan class="size-3.5" />
      </Button>
    </div>

    <div
      v-if="!advanced"
      class="relative"
    >
      <ScrubbableNumberField
        :model-value="unifiedValue"
        :default-value="0"
        :label="title"
        :min="0"
        :max="9999"
        :step="1"
        @update:model-value="updateScrubbedGlobal"
      >
        <template #prefix>
          <Radius />
        </template>
      </ScrubbableNumberField>
    </div>

    <div
      v-if="advanced"
      class="grid grid-cols-2 gap-2"
    >
      <div
        v-for="corner in UI_CORNER_ORDER"
        :key="corner"
      >
        <ScrubbableNumberField
          :model-value="corners[corner]"
          :default-value="0"
          :label="`${CORNER_LABELS[corner]} border radius`"
          :min="0"
          :max="9999"
          :step="1"
          :precision="1"
          @update:model-value="(value) => value !== undefined && updateCorner(corner, value)"
        >
          <template #prefix>
            <span class="text-[9px] font-semibold">{{ CORNER_SHORT_LABELS[corner] }}</span>
          </template>
        </ScrubbableNumberField>
      </div>
    </div>
  </div>
</template>
