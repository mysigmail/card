<template>
  <EditorPanel>
    <EditorPanelItem
      title="Layout"
      type="opened"
    >
      <PaddingTool
        id="layoutPadding"
        v-model:value="general.padding"
        title="Padding"
        :auto-update="false"
      />
    </EditorPanelItem>
    <EditorPanelItem
      title="Background"
      type="opened"
    >
      <ColorPickerTool
        id="bgColor"
        v-model:value="general.background.color"
        title="Color"
        :auto-update="false"
      />
      <EditorToolLabel> Image </EditorToolLabel>
      <ElInput
        v-model="general.background.image"
        placeholder="Image URL"
      />
      <EditorToolLabel> Background Repeat </EditorToolLabel>
      <ElRadioGroup v-model="general.background.repeat">
        <ElRadioButton label="no-repeat">
          No Repeat
        </ElRadioButton>
        <ElRadioButton label="repeat">
          Repeat
        </ElRadioButton>
      </ElRadioGroup>

      <EditorToolLabel> Background Size </EditorToolLabel>
      <ElRadioGroup v-model="general.background.size">
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

      <EditorToolLabel> Background Position </EditorToolLabel>
      <ElRadioGroup v-model="general.background.position">
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
    </EditorPanelItem>
    <EditorPanelItem
      title="Font"
      type="opened"
    >
      <ElSelect
        v-model="general.font"
        placeholder="Select font"
        style="width: 100%"
      >
        <ElOption
          v-for="item in fontOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
    </EditorPanelItem>
    <EditorPanelItem
      title="Preview Text"
      type="opened"
    >
      <ElInput
        v-model="general.previewText"
        type="textarea"
        :rows="3"
        placeholder="Email preview text (preheader) is a small line of text that appears after the subject line in an email inbox."
      />
    </EditorPanelItem>
  </EditorPanel>
</template>

<script setup lang="ts">
import { ElRadioGroup } from 'element-plus'
import { useComponentsStore } from '@/store/components'

const { general } = useComponentsStore()

const fontOptions = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", sans-serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Lucida Console', value: '"Lucida Console", Monaco, monospace' },
  { label: 'Lucida Grande', value: '"Lucida Grande", sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
]
</script>

<style lang="scss" scoped></style>
