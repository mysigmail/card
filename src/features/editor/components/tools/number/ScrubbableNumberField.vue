<script setup lang="ts">
import type { ScrubbableNumberValue } from './scrubbable-number'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { cn } from '@/shared/lib/utils'
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
const rootRef = ref<HTMLElement>()
const draft = ref(formatScrubbableNumber(props.modelValue, props.precision))
let dragStartX = 0
let dragStartValue = props.defaultValue
let dragAnchorX = 0
let dragAnchorValue = props.defaultValue
let dragMultiplier = 1
let lastDragValue: number | undefined
let dragged = false
let suppressClick = false
let dragPointerId: number | undefined
let dragTarget: HTMLElement | undefined
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
  const multiplier = event.shiftKey ? 10 : event.altKey && props.precision > 0 ? 0.1 : 1
  const direction = event.key === 'ArrowUp' ? 1 : -1
  const value = normalizedValue(current + direction * props.step * multiplier)
  draft.value = String(value)
  emit('update:modelValue', value)
}

function startDragging(event: PointerEvent) {
  if (event.button !== 0)
    return
  if (event.pointerType === 'touch') {
    focusInput()
    return
  }

  event.preventDefault()
  dragging.value = true
  dragged = false
  dragStartX = event.clientX
  dragStartValue = typeof props.modelValue === 'number' ? props.modelValue : props.defaultValue
  dragAnchorX = dragStartX
  dragAnchorValue = dragStartValue
  dragMultiplier = event.shiftKey ? 10 : event.altKey && props.precision > 0 ? 0.1 : 1
  lastDragValue = undefined
  previousCursor = document.documentElement.style.cursor
  previousUserSelect = document.documentElement.style.userSelect
  document.documentElement.style.cursor = 'ew-resize'
  document.documentElement.style.userSelect = 'none'
  dragPointerId = event.pointerId
  dragTarget = event.currentTarget as HTMLElement
  dragTarget.setPointerCapture(event.pointerId)
  document.addEventListener('keydown', onDocumentKeydown)
}

function drag(event: PointerEvent) {
  if (!dragging.value)
    return
  event.preventDefault()
  if (Math.abs(event.clientX - dragStartX) < 3)
    return

  dragged = true

  const multiplier = event.shiftKey ? 10 : event.altKey && props.precision > 0 ? 0.1 : 1
  if (multiplier !== dragMultiplier) {
    dragAnchorX = event.clientX
    dragAnchorValue = lastDragValue ?? dragStartValue
    dragMultiplier = multiplier
    return
  }

  const value = scrubNumber({
    deltaX: event.clientX - dragAnchorX,
    max: props.max,
    min: props.min,
    pixelsPerStep: props.pixelsPerStep,
    precision: props.precision,
    startValue: dragAnchorValue,
    step: props.step * dragMultiplier,
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
  suppressClick = dragged
  restoreDocumentInteraction()
  const target = event.currentTarget as HTMLElement
  if (target.hasPointerCapture(event.pointerId))
    target.releasePointerCapture(event.pointerId)
  document.removeEventListener('keydown', onDocumentKeydown)
  dragPointerId = undefined
  dragTarget = undefined
}

function cancelDragging() {
  if (!dragging.value)
    return
  dragging.value = false
  emit('update:modelValue', dragStartValue)
  restoreDocumentInteraction()
  if (dragTarget && dragPointerId !== undefined && dragTarget.hasPointerCapture(dragPointerId))
    dragTarget.releasePointerCapture(dragPointerId)
  document.removeEventListener('keydown', onDocumentKeydown)
  dragPointerId = undefined
  dragTarget = undefined
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    cancelDragging()
  }
}

function focusInput() {
  if (suppressClick) {
    suppressClick = false
    return
  }
  const input = rootRef.value?.querySelector('input')
  input?.focus()
  input?.select()
}

onBeforeUnmount(() => {
  if (dragging.value)
    cancelDragging()
})
</script>

<template>
  <div
    v-bind="$attrs"
    ref="rootRef"
    data-slot="scrubbable-number-field"
    :class="cn('relative', props.class)"
  >
    <span
      aria-hidden="true"
      class="absolute inset-y-0 left-0 z-10 flex w-8 cursor-ew-resize items-center justify-center rounded-r-none text-muted-foreground touch-pan-y"
      :title="`Drag to adjust ${label}`"
      @click="focusInput"
      @pointerdown.stop="startDragging"
      @pointermove="drag"
      @pointerup="stopDragging"
      @pointercancel="stopDragging"
    >
      <span class="flex size-4 items-center justify-center [&_svg:not([class*='size-'])]:size-4">
        <slot name="prefix" />
      </span>
    </span>

    <Input
      size="sm"
      class="pr-1.5 pl-8 text-sm tabular-nums"
      inputmode="decimal"
      role="spinbutton"
      :aria-label="label"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="typeof modelValue === 'number' ? modelValue : undefined"
      :aria-valuetext="displayedValue"
      :model-value="displayedValue"
      @update:model-value="updateDraft"
      @focus="beginEditing"
      @blur="commitDraft"
      @keydown="onInputKeydown"
    />
  </div>
</template>
