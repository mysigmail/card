<script setup lang="ts">
import type { SpacingTool } from '@/features/editor/model'
import { nextTick, ref, watch } from 'vue'
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
    await nextTick()
    syncing = false
  },
  { deep: true },
)
</script>

<template>
  <div data-slot="spacing-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="relative flex h-[120px] flex-col rounded-sm border border-border">
      <div class="absolute inset-0">
        <div class="absolute left-1.5 top-0.5 select-none text-xs text-muted-foreground">
          Margin
        </div>
        <div
          class="absolute left-1/2 flex h-6 w-[50px] -translate-x-1/2 items-center justify-center p-2"
        >
          <SpacingInput
            v-model="localMarginTop"
            :disabled="!value.margin"
          />
        </div>
        <div
          class="absolute right-0 top-1/2 flex h-6 w-[50px] -translate-y-1/2 items-center justify-center p-2"
        >
          <SpacingInput
            v-model="localMarginRight"
            :disabled="!value.margin"
          />
        </div>
        <div
          class="absolute bottom-0 left-1/2 flex h-6 w-[50px] -translate-x-1/2 items-center justify-center p-2"
        >
          <SpacingInput
            v-model="localMarginBottom"
            :disabled="!value.margin"
          />
        </div>
        <div
          class="absolute left-0 top-1/2 flex h-6 w-[50px] -translate-y-1/2 items-center justify-center p-2"
        >
          <SpacingInput
            v-model="localMarginLeft"
            :disabled="!value.margin"
          />
        </div>
      </div>
      <div
        class="absolute top-[25px] right-[50px] bottom-[25px] left-[50px] border border-border bg-background rounded-sm"
      >
        <div class="absolute left-1.5 top-0.5 select-none text-xs text-muted-foreground">
          Padding
        </div>
        <div
          class="absolute left-1/2 flex h-6 w-[50px] -translate-x-1/2 items-center justify-center p-2"
        >
          <SpacingInput
            v-model="localPaddingTop"
            :disabled="!value.padding"
          />
        </div>
        <div
          class="absolute right-0 top-1/2 flex h-6 w-[50px] -translate-y-1/2 items-center justify-center p-2"
        >
          <SpacingInput
            v-model="localPaddingRight"
            :disabled="!value.padding"
          />
        </div>
        <div
          class="absolute bottom-0 left-1/2 flex h-6 w-[50px] -translate-x-1/2 items-center justify-center p-2"
        >
          <SpacingInput
            v-model="localPaddingBottom"
            :disabled="!value.padding"
          />
        </div>
        <div
          class="absolute left-0 top-1/2 flex h-6 w-[50px] -translate-y-1/2 items-center justify-center p-2"
        >
          <SpacingInput
            v-model="localPaddingLeft"
            :disabled="!value.padding"
          />
        </div>
      </div>
    </div>
  </div>
</template>
