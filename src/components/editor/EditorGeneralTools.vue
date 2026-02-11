<script setup lang="ts">
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
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

const repeatOptions = [
  { label: 'No Repeat', value: 'no-repeat' },
  { label: 'Repeat', value: 'repeat' },
] as const

const sizeOptions = [
  { label: 'None', value: 'unset' },
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
] as const

const positionOptions = [
  { label: 'Top', value: 'top' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Center', value: 'center' },
  { label: 'Left', value: 'left' },
  { label: 'Right', value: 'right' },
] as const
</script>

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
      <Input
        v-model="general.background.image"
        placeholder="Image URL"
      />
      <EditorToolLabel> Background Repeat </EditorToolLabel>
      <ToggleGroup
        v-model="general.background.repeat"
        type="single"
        variant="outline"
      >
        <ToggleGroupItem
          v-for="option in repeatOptions"
          :key="option.value"
          :value="option.value"
          variant="outline"
        >
          {{ option.label }}
        </ToggleGroupItem>
      </ToggleGroup>

      <EditorToolLabel> Background Size </EditorToolLabel>
      <ToggleGroup
        v-model="general.background.size"
        type="single"
      >
        <ToggleGroupItem
          v-for="option in sizeOptions"
          :key="option.value"
          :value="option.value"
          variant="outline"
        >
          {{ option.label }}
        </ToggleGroupItem>
      </ToggleGroup>

      <EditorToolLabel> Background Position </EditorToolLabel>
      <ToggleGroup
        v-model="general.background.position"
        type="single"
      >
        <ToggleGroupItem
          v-for="option in positionOptions"
          :key="option.value"
          :value="option.value"
          variant="outline"
        >
          {{ option.label }}
        </ToggleGroupItem>
      </ToggleGroup>
    </EditorPanelItem>
    <EditorPanelItem
      title="Font"
      type="opened"
    >
      <Select v-model="general.font">
        <SelectTrigger>
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="item in fontOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </EditorPanelItem>
    <EditorPanelItem
      title="Preview Text"
      type="opened"
    >
      <Textarea
        v-model="general.previewText"
        placeholder="Email preview text (preheader) is a small line of text that appears after the subject line in an email inbox."
      />
    </EditorPanelItem>
  </EditorPanel>
</template>

<style scoped></style>
