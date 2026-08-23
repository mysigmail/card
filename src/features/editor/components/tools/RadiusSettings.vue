<script setup lang="ts">
import type { BorderRadiusValue } from '@/entities/style'
import { computed, ref, watch } from 'vue'
import { BORDER_RADIUS_CORNERS, createBorderRadiusValue } from '@/entities/style'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'

const props = defineProps<{ id: string, title: string, value: BorderRadiusValue }>()
const emit = defineEmits<{ (event: 'update:value', value: BorderRadiusValue): void }>()

function hasIndependentCorners(value: BorderRadiusValue) {
  return BORDER_RADIUS_CORNERS.some(corner => value[corner] !== value.topLeft)
}

const advanced = ref(hasIndependentCorners(props.value))
const corners = computed(() => props.value)

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

function updateGlobal(value: string | number) {
  const parsed = parseNonNegative(value)
  if (parsed !== undefined)
    emit('update:value', createBorderRadiusValue(parsed))
}

function setAdvanced(value: boolean) {
  advanced.value = value
  if (!value)
    emit('update:value', createBorderRadiusValue(corners.value.topLeft))
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
</script>

<template>
  <div
    data-slot="radius-settings"
    class="space-y-3"
  >
    <div class="flex items-center justify-between gap-3">
      <EditorToolLabel>{{ title }}</EditorToolLabel>
      <div class="ml-auto flex items-center gap-2">
        <span class="text-xs text-muted-foreground">Advanced</span>
        <Switch
          :model-value="advanced"
          aria-label="Advanced border radius corners"
          @update:model-value="setAdvanced"
        />
      </div>
    </div>

    <div
      v-if="!advanced"
      class="relative"
    >
      <Input
        :id="id"
        type="number"
        min="0"
        :model-value="corners.topLeft"
        class="pr-7"
        aria-label="Border radius"
        @update:model-value="updateGlobal"
      />
      <span
        class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground"
      >
        px
      </span>
    </div>

    <div
      v-if="advanced"
      class="grid grid-cols-2 gap-2"
    >
      <div
        v-for="corner in BORDER_RADIUS_CORNERS"
        :key="corner"
      >
        <EditorToolLabel type="secondary">
          {{ CORNER_LABELS[corner] }}
        </EditorToolLabel>
        <div class="relative">
          <Input
            :id="`${id}-${corner}`"
            type="number"
            min="0"
            :model-value="corners[corner]"
            class="pr-7"
            :aria-label="`${CORNER_LABELS[corner]} border radius`"
            @update:model-value="(value) => updateCorner(corner, value)"
          />
          <span
            class="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground"
          >
            px
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
