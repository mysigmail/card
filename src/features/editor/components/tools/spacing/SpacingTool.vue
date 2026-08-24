<script setup lang="ts">
import type { SpacingTool } from '@/features/editor/model'
import { Box, Scan } from 'lucide-vue-next'
import { nextTick, ref, watch } from 'vue'
import { Button } from '@/shared/ui/button'
import NumberFieldPrefixLabel from '../number/NumberFieldPrefixLabel.vue'
import ScrubbableNumberField from '../number/ScrubbableNumberField.vue'
import { createSpacingPatch } from './spacing-patch'

interface Props {
  id: string
  value: SpacingTool['value']
  title: string
}

const props = defineProps<Props>()

const emit = defineEmits<{ (e: 'update:value', value: SpacingTool['value']): void }>()
let syncing = false

const localMarginTop = ref(props.value.margin?.[0] || 0)
const localMarginRight = ref(props.value.margin?.[1] || 0)
const localMarginBottom = ref(props.value.margin?.[2] || 0)
const localMarginLeft = ref(props.value.margin?.[3] || 0)

const localPaddingTop = ref(props.value.padding?.[0] || 0)
const localPaddingRight = ref(props.value.padding?.[1] || 0)
const localPaddingBottom = ref(props.value.padding?.[2] || 0)
const localPaddingLeft = ref(props.value.padding?.[3] || 0)

function hasIndependentValues(value?: [number, number, number, number]) {
  return value ? value.some(item => item !== value[0]) : false
}

const paddingIndependent = ref(hasIndependentValues(props.value.padding))
const marginIndependent = ref(hasIndependentValues(props.value.margin))

watch(
  () => [
    localPaddingTop.value,
    localPaddingRight.value,
    localPaddingBottom.value,
    localPaddingLeft.value,
  ],
  (v) => {
    if (syncing)
      return
    emit(
      'update:value',
      createSpacingPatch(props.value, 'padding', v as NonNullable<SpacingTool['value']['padding']>),
    )
  },
)

watch(
  () => [
    localMarginTop.value,
    localMarginRight.value,
    localMarginBottom.value,
    localMarginLeft.value,
  ],
  (v) => {
    if (syncing)
      return
    if (!props.value.margin)
      return

    emit(
      'update:value',
      createSpacingPatch(props.value, 'margin', v as NonNullable<SpacingTool['value']['margin']>),
    )
  },
)

watch(
  () => props.value,
  async (value) => {
    syncing = true
    localMarginTop.value = value.margin?.[0] || 0
    localMarginRight.value = value.margin?.[1] || 0
    localMarginBottom.value = value.margin?.[2] || 0
    localMarginLeft.value = value.margin?.[3] || 0
    localPaddingTop.value = value.padding?.[0] || 0
    localPaddingRight.value = value.padding?.[1] || 0
    localPaddingBottom.value = value.padding?.[2] || 0
    localPaddingLeft.value = value.padding?.[3] || 0
    if (hasIndependentValues(value.margin))
      marginIndependent.value = true
    if (hasIndependentValues(value.padding))
      paddingIndependent.value = true
    await nextTick()
    syncing = false
  },
  { deep: true },
)

function updatePaddingAll(value: number | undefined) {
  if (value === undefined)
    return
  localPaddingTop.value = value
  localPaddingRight.value = value
  localPaddingBottom.value = value
  localPaddingLeft.value = value
}

function updateMarginAll(value: number | undefined) {
  if (value === undefined)
    return
  localMarginTop.value = value
  localMarginRight.value = value
  localMarginBottom.value = value
  localMarginLeft.value = value
}

function updatePaddingSide(index: number, value: number | undefined) {
  if (value === undefined)
    return
  const refs = [localPaddingTop, localPaddingRight, localPaddingBottom, localPaddingLeft]
  const target = refs[index]
  if (target)
    target.value = value
}

function updateMarginSide(index: number, value: number | undefined) {
  if (value === undefined)
    return
  const refs = [localMarginTop, localMarginRight, localMarginBottom, localMarginLeft]
  const target = refs[index]
  if (target)
    target.value = value
}

const SIDE_LABELS = ['T', 'R', 'B', 'L']
</script>

<template>
  <div data-slot="spacing-tool">
    <div class="space-y-3">
      <div v-if="value.padding">
        <div class="mb-1 flex items-center justify-between">
          <EditorToolLabel> Padding </EditorToolLabel>
          <Button
            variant="ghost"
            size="icon-xs"
            :aria-pressed="paddingIndependent"
            aria-label="Show individual padding sides"
            title="Show individual padding sides"
            @click="paddingIndependent = !paddingIndependent"
          >
            <Scan class="size-3.5" />
          </Button>
        </div>
        <ScrubbableNumberField
          v-if="!paddingIndependent"
          :model-value="hasIndependentValues(value.padding) ? 'mixed' : localPaddingTop"
          :default-value="0"
          label="Padding"
          :min="0"
          :max="9999"
          :step="1"
          :precision="1"
          @update:model-value="updatePaddingAll"
        >
          <template #prefix>
            <Box />
          </template>
        </ScrubbableNumberField>
        <div
          v-else
          class="grid grid-cols-2 gap-2"
        >
          <ScrubbableNumberField
            v-for="(sideValue, index) in [
              localPaddingTop,
              localPaddingRight,
              localPaddingBottom,
              localPaddingLeft,
            ]"
            :key="`padding-${index}`"
            :model-value="sideValue"
            :default-value="0"
            :label="`${SIDE_LABELS[index]} padding`"
            :min="0"
            :max="9999"
            :step="1"
            :precision="1"
            @update:model-value="(next) => updatePaddingSide(index, next)"
          >
            <template #prefix>
              <NumberFieldPrefixLabel :label="SIDE_LABELS[index]" />
            </template>
          </ScrubbableNumberField>
        </div>
      </div>

      <div v-if="value.margin">
        <div class="mb-1 flex items-center justify-between">
          <EditorToolLabel> Margin </EditorToolLabel>
          <Button
            variant="ghost"
            size="icon-xs"
            :aria-pressed="marginIndependent"
            aria-label="Show individual margin sides"
            title="Show individual margin sides"
            @click="marginIndependent = !marginIndependent"
          >
            <Scan class="size-3.5" />
          </Button>
        </div>
        <ScrubbableNumberField
          v-if="!marginIndependent"
          :model-value="hasIndependentValues(value.margin) ? 'mixed' : localMarginTop"
          :default-value="0"
          label="Margin"
          :min="-9999"
          :max="9999"
          :step="1"
          :precision="1"
          @update:model-value="updateMarginAll"
        >
          <template #prefix>
            <Box />
          </template>
        </ScrubbableNumberField>
        <div
          v-else
          class="grid grid-cols-2 gap-2"
        >
          <ScrubbableNumberField
            v-for="(sideValue, index) in [
              localMarginTop,
              localMarginRight,
              localMarginBottom,
              localMarginLeft,
            ]"
            :key="`margin-${index}`"
            :model-value="sideValue"
            :default-value="0"
            :label="`${SIDE_LABELS[index]} margin`"
            :min="-9999"
            :max="9999"
            :step="1"
            :precision="1"
            @update:model-value="(next) => updateMarginSide(index, next)"
          >
            <template #prefix>
              <NumberFieldPrefixLabel :label="SIDE_LABELS[index]" />
            </template>
          </ScrubbableNumberField>
        </div>
      </div>
    </div>
  </div>
</template>
