<script setup lang="ts">
import type { SpacingTool } from '@/features/editor/model'
import { ref, watch } from 'vue'
import { useCanvas } from '@/features/editor/model'

interface Props {
  id: string
  value: SpacingTool['value']
  title: string
}

const props = defineProps<Props>()

const { updateToolById } = useCanvas()

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
    const margin = props.value.margin
      ? ([
          localMarginTop.value,
          localMarginRight.value,
          localMarginBottom.value,
          localMarginLeft.value,
        ] as SpacingTool['value']['margin'])
      : props.value.margin

    updateToolById<SpacingTool>(props.id, 'value', {
      padding: v as SpacingTool['value']['padding'],
      margin,
    })
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
    const padding = props.value.padding
      ? ([
          localPaddingTop.value,
          localPaddingRight.value,
          localPaddingBottom.value,
          localPaddingLeft.value,
        ] as SpacingTool['value']['padding'])
      : props.value.padding

    updateToolById<SpacingTool>(props.id, 'value', {
      padding,
      margin: v as SpacingTool['value']['margin'],
    })
  },
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
