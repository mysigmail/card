<script setup lang="ts">
import { useCanvas } from '@/features/editor/model'
import { Input } from '@/shared/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'

const { general } = useCanvas()

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
  <EditorPanelItem
    data-slot="general-background-settings"
    title="Appearance"
    state-key="main:appearance"
  >
    <ColorPickerTool
      id="bgColor"
      v-model:value="general.background.color"
      title="Color"
    />
    <GeneralFontSettings />
    <EditorToolLabel> Background Image </EditorToolLabel>
    <Input
      v-model="general.background.image"
      size="sm"
      placeholder="Image URL"
    />
    <template v-if="general.background.image">
      <EditorToolLabel level="parameter">
        Background Repeat
      </EditorToolLabel>
      <ToggleGroup
        v-model="general.background.repeat"
        type="single"
        size="sm"
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

      <EditorToolLabel level="parameter">
        Background Size
      </EditorToolLabel>
      <ToggleGroup
        v-model="general.background.size"
        type="single"
        size="sm"
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

      <EditorToolLabel level="parameter">
        Background Position
      </EditorToolLabel>
      <ToggleGroup
        v-model="general.background.position"
        type="single"
        size="sm"
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
    </template>
  </EditorPanelItem>
</template>
