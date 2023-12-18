<template>
  <div class="spacing-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="body">
      <div class="margin">
        <div class="label">
          Margin
        </div>
        <div class="top">
          <SpacingInput
            v-model="localMarginTop"
            :disabled="!value.margin"
          />
        </div>
        <div class="right">
          <SpacingInput
            v-model="localMarginRight"
            :disabled="!value.margin"
          />
        </div>
        <div class="bottom">
          <SpacingInput
            v-model="localMarginBottom"
            :disabled="!value.margin"
          />
        </div>
        <div class="left">
          <SpacingInput
            v-model="localMarginLeft"
            :disabled="!value.margin"
          />
        </div>
      </div>
      <div class="padding">
        <div class="label">
          Padding
        </div>
        <div class="top">
          <SpacingInput
            v-model="localPaddingTop"
            :disabled="!value.padding"
          />
        </div>
        <div class="right">
          <SpacingInput
            v-model="localPaddingRight"
            :disabled="!value.padding"
          />
        </div>
        <div class="bottom">
          <SpacingInput
            v-model="localPaddingBottom"
            :disabled="!value.padding"
          />
        </div>
        <div class="left">
          <SpacingInput
            v-model="localPaddingLeft"
            :disabled="!value.padding"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SpacingTool } from '@/types/editor'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  value: SpacingTool['value']
  title: string
}

const props = defineProps<Props>()

const { updateToolById } = useComponentsStore()

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

<style lang="scss" scoped>
.spacing-tool {
  --inner-padding-x: 50px;
  --inner-padding-y: 25px;

  .body {
    display: flex;
    flex-flow: column;

    height: 120px;
    position: relative;
    border: 1px solid var(--color-border);
    border-radius: 5px;

    .margin,
    .padding {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    .padding {
      top: var(--inner-padding-y);
      left: var(--inner-padding-x);
      right: var(--inner-padding-x);
      bottom: var(--inner-padding-y);
      border: 1px solid var(--color-border);
      border-radius: 5px;
      background-color: #fff;
    }

    .label {
      position: absolute;
      left: 2px;
      top: 2px;
      font-size: 12px;
      color: var(--color-grey-600);
      user-select: none;
    }

    .top,
    .right,
    .bottom,
    .left {
      width: 50px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-xs);
    }

    .top {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }

    .right {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
    }

    .left {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
    }

    .bottom {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 0;
    }
  }
}
</style>
