<script setup lang="ts">
import { useCanvas } from '@/features/editor/model'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const { general } = useCanvas()

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

<template>
  <EditorPanelItem
    data-slot="general-font-settings"
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
</template>
