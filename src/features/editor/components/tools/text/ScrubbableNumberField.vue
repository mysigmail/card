<script setup lang="ts">
import type { ScrubbableNumberValue } from './scrubbable-number'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  clampNumber,
  formatScrubbableNumber,
  parseScrubbableNumber,
  roundNumber,
  scrubNumber,
} from './scrubbable-number'

interface Props {
  class?: string
  defaultValue: number
  label: string
  max: number
  min: number
  modelValue?: ScrubbableNumberValue
  pixelsPerStep?: number
  precision?: number
  step?: number
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  pixelsPerStep: 4,
  precision: 0,
  step: 1,
})
const emit = defineEmits<{
  'update:modelValue': [value: number | undefined]
}>()

const editing = ref(false)
const dragging = ref(false)
const draft = ref(formatScrubbableNumber(props.modelValue, props.precision))
let dragStartX = 0
let dragStartValue = props.defaultValue
let lastDragValue: number | undefined
let previousCursor = ''
let previousUserSelect = ''

const displayedValue = computed(() => {
  return editing.value ? draft.value : formatScrubbableNumber(props.modelValue, props.precision)
})

watch(
  () => [props.modelValue, props.precision] as const,
  () => {
    if (!editing.value)
      draft.value = formatScrubbableNumber(props.modelValue, props.precision)
  },
)

function normalizedValue(value: number) {
  return roundNumber(clampNumber(value, props.min, props.max), props.precision)
}

function beginEditing(event: FocusEvent) {
  editing.value = true
  draft.value = formatScrubbableNumber(props.modelValue, props.precision)
  requestAnimationFrame(() => (event.currentTarget as HTMLInputElement).select())
}

function commitDraft(event: FocusEvent) {
  const value = parseScrubbableNumber((event.currentTarget as HTMLInputElement).value)
  editing.value = false

  if (value === null) {
    draft.value = formatScrubbableNumber(props.modelValue, props.precision)
    return
  }

  emit('update:modelValue', value === undefined ? undefined : normalizedValue(value))
}

function updateDraft(value: string | number) {
  draft.value = String(value)
}

function onInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    ;(event.currentTarget as HTMLInputElement).blur()
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    draft.value = formatScrubbableNumber(props.modelValue, props.precision)
    ;(event.currentTarget as HTMLInputElement).blur()
    return
  }

  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown')
    return

  event.preventDefault()
  const parsed = parseScrubbableNumber(draft.value)
  const current = typeof parsed === 'number' ? parsed : props.defaultValue
  const multiplier = event.shiftKey ? 10 : 1
  const direction = event.key === 'ArrowUp' ? 1 : -1
  const value = normalizedValue(current + direction * props.step * multiplier)
  draft.value = String(value)
  emit('update:modelValue', value)
}

function startDragging(event: PointerEvent) {
  if (event.button !== 0)
    return

  dragging.value = true
  dragStartX = event.clientX
  dragStartValue = typeof props.modelValue === 'number' ? props.modelValue : props.defaultValue
  lastDragValue = undefined
  previousCursor = document.documentElement.style.cursor
  previousUserSelect = document.documentElement.style.userSelect
  document.documentElement.style.cursor = 'ew-resize'
  document.documentElement.style.userSelect = 'none'
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function drag(event: PointerEvent) {
  if (!dragging.value)
    return

  const value = scrubNumber({
    deltaX: event.clientX - dragStartX,
    max: props.max,
    min: props.min,
    pixelsPerStep: props.pixelsPerStep,
    precision: props.precision,
    startValue: dragStartValue,
    step: props.step,
  })
  if (value === lastDragValue)
    return

  lastDragValue = value
  emit('update:modelValue', value)
}

function restoreDocumentInteraction() {
  document.documentElement.style.cursor = previousCursor
  document.documentElement.style.userSelect = previousUserSelect
}

function stopDragging(event: PointerEvent) {
  if (!dragging.value)
    return

  dragging.value = false
  restoreDocumentInteraction()
  const target = event.currentTarget as HTMLElement
  if (target.hasPointerCapture(event.pointerId))
    target.releasePointerCapture(event.pointerId)
}

onBeforeUnmount(() => {
  if (dragging.value)
    restoreDocumentInteraction()
})
</script>

<template>
  <div
    v-bind="$attrs"
    data-slot="scrubbable-number-field"
    :class="cn('relative h-8', props.class)"
  >
    <Button
      variant="ghost"
      size="icon-sm"
      class="absolute inset-y-0 left-0 z-10 cursor-ew-resize touch-none rounded-r-none text-muted-foreground hover:bg-transparent hover:text-muted-foreground dark:hover:bg-transparent"
      :aria-label="`Adjust ${label}; drag horizontally`"
      @pointerdown.prevent.stop="startDragging"
      @pointermove.prevent="drag"
      @pointerup.prevent="stopDragging"
      @pointercancel="stopDragging"
    >
      <span class="flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <slot name="prefix" />
      </span>
    </Button>

    <Input
      size="sm"
      class="h-8 pr-1.5 pl-8 text-xs tabular-nums"
      inputmode="decimal"
      :aria-label="label"
      :model-value="displayedValue"
      @update:model-value="updateDraft"
      @focus="beginEditing"
      @blur="commitDraft"
      @keydown="onInputKeydown"
    />
  </div>
</template>
