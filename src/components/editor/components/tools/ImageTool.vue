<script setup lang="ts">
import type { BackgroundImageTool, ImageTool } from '@/types/editor'
import { computed, reactive, watch } from 'vue'
import { useComponentsStore } from '@/store/components'

type UnifiedImageValue = ImageTool['value'] | BackgroundImageTool['value']

interface Props {
  id: string
  type: 'image' | 'bgImage'
  value: UnifiedImageValue
  title: string
}

const props = defineProps<Props>()

const { updateToolById } = useComponentsStore()

const localValue = reactive<UnifiedImageValue>(props.value)
const isBackground = computed(() => props.type === 'bgImage')

const imageValue = localValue as ImageTool['value']
const backgroundValue = localValue as BackgroundImageTool['value']

watch(
  localValue,
  () => {
    if (isBackground.value) {
      updateToolById<BackgroundImageTool>(props.id, 'value', backgroundValue)
      return
    }

    updateToolById<ImageTool>(props.id, 'value', imageValue)
  },
  { deep: true },
)
</script>

<template>
  <div class="image-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div
      v-if="isBackground"
      class="body"
    >
      <EditorToolLabel type="secondary">
        URL
      </EditorToolLabel>
      <ElInput
        v-model="backgroundValue.url"
        placeholder="Image URL"
      />

      <EditorToolLabel type="secondary">
        Repeat
      </EditorToolLabel>
      <ElRadioGroup v-model="backgroundValue.repeat">
        <ElRadioButton label="no-repeat">
          No Repeat
        </ElRadioButton>
        <ElRadioButton label="repeat">
          Repeat
        </ElRadioButton>
      </ElRadioGroup>

      <EditorToolLabel type="secondary">
        Size
      </EditorToolLabel>
      <ElRadioGroup v-model="backgroundValue.size">
        <ElRadioButton label="unset">
          None
        </ElRadioButton>
        <ElRadioButton label="cover">
          Cover
        </ElRadioButton>
        <ElRadioButton label="contain">
          Contain
        </ElRadioButton>
      </ElRadioGroup>

      <EditorToolLabel type="secondary">
        Position
      </EditorToolLabel>
      <ElRadioGroup v-model="backgroundValue.position">
        <ElRadioButton label="top">
          Top
        </ElRadioButton>
        <ElRadioButton label="bottom">
          Bottom
        </ElRadioButton>
        <ElRadioButton label="center">
          Center
        </ElRadioButton>
        <ElRadioButton label="left">
          Left
        </ElRadioButton>
        <ElRadioButton label="right">
          Right
        </ElRadioButton>
      </ElRadioGroup>
    </div>
    <div
      v-else
      class="body"
    >
      <div>
        <EditorToolLabel type="secondary">
          URL
        </EditorToolLabel>
        <ElInput v-model="imageValue.src" />
      </div>
      <div class="dimensions">
        <div style="width: 100%">
          <EditorToolLabel type="secondary">
            Width
          </EditorToolLabel>
          <ElInput
            v-model="imageValue.width"
            type="number"
          />
        </div>
        <div style="width: 100%">
          <EditorToolLabel type="secondary">
            Height
          </EditorToolLabel>
          <ElInput
            v-model="imageValue.height"
            type="number"
          />
        </div>
      </div>
      <div>
        <EditorToolLabel type="secondary">
          Alternate Text
        </EditorToolLabel>
        <ElInput v-model="imageValue.alt" />
      </div>
      <div>
        <EditorToolLabel type="secondary">
          Image Link
        </EditorToolLabel>
        <ElInput v-model="imageValue.link" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dimensions {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
