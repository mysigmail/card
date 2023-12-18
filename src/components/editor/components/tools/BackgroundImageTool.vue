<template>
  <div class="background-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="body">
      <EditorToolLabel>URL </EditorToolLabel>
      <ElInput
        v-model="localValue.url"
        placeholder="Image URLs"
      />

      <EditorToolLabel>Repeat </EditorToolLabel>
      <ElRadioGroup v-model="localValue.repeat">
        <ElRadioButton label="no-repeat">
          No Repeat
        </ElRadioButton>
        <ElRadioButton label="repeat">
          Repeat
        </ElRadioButton>
      </ElRadioGroup>

      <EditorToolLabel> Size </EditorToolLabel>
      <ElRadioGroup v-model="localValue.size">
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

      <EditorToolLabel> Position </EditorToolLabel>
      <ElRadioGroup v-model="localValue.position">
        <ElRadioButton label="top">
          Top
        </ElRadioButton>
        <ElRadioButton label="button">
          Button
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
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { BackgroundImageTool } from '@/types/editor'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  value: BackgroundImageTool['value']
  title: string
}

const props = defineProps<Props>()

const { updateToolById } = useComponentsStore()

const localValue = reactive<BackgroundImageTool['value']>(props.value)

watch(
  localValue,
  () => {
    updateToolById<BackgroundImageTool>(props.id, 'value', localValue)
  },
  {
    deep: true,
  },
)
</script>

<style lang="scss" scoped></style>
