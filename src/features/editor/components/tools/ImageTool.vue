<script setup lang="ts">
import type { BackgroundImageTool, ImageTool } from '@/features/editor/model'
import { computed, reactive, watch } from 'vue'
import { useComponentsStore } from '@/features/editor/model'
import { Input } from '@/shared/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'

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
  <div data-slot="image-tool">
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
      <Input
        v-model="backgroundValue.url"
        placeholder="Image URL"
      />

      <EditorToolLabel type="secondary">
        Repeat
      </EditorToolLabel>
      <ToggleGroup
        v-model="backgroundValue.repeat"
        type="single"
      >
        <ToggleGroupItem
          size="sm"
          value="no-repeat"
          variant="outline"
        >
          No Repeat
        </ToggleGroupItem>
        <ToggleGroupItem
          size="sm"
          value="repeat"
          variant="outline"
        >
          Repeat
        </ToggleGroupItem>
      </ToggleGroup>

      <EditorToolLabel type="secondary">
        Size
      </EditorToolLabel>
      <ToggleGroup
        v-model="backgroundValue.size"
        type="single"
      >
        <ToggleGroupItem
          size="sm"
          value="unset"
          variant="outline"
        >
          None
        </ToggleGroupItem>
        <ToggleGroupItem
          size="sm"
          value="cover"
          variant="outline"
        >
          Cover
        </ToggleGroupItem>
        <ToggleGroupItem
          size="sm"
          value="contain"
          variant="outline"
        >
          Contain
        </ToggleGroupItem>
      </ToggleGroup>

      <EditorToolLabel type="secondary">
        Position
      </EditorToolLabel>
      <ToggleGroup
        v-model="backgroundValue.position"
        type="single"
      >
        <ToggleGroupItem
          size="sm"
          value="top"
          variant="outline"
        >
          Top
        </ToggleGroupItem>
        <ToggleGroupItem
          size="sm"
          value="bottom"
          variant="outline"
        >
          Bottom
        </ToggleGroupItem>
        <ToggleGroupItem
          size="sm"
          value="center"
          variant="outline"
        >
          Center
        </ToggleGroupItem>
        <ToggleGroupItem
          size="sm"
          value="left"
          variant="outline"
        >
          Left
        </ToggleGroupItem>
        <ToggleGroupItem
          size="sm"
          value="right"
          variant="outline"
        >
          Right
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
    <div
      v-else
      class="body"
    >
      <div>
        <EditorToolLabel type="secondary">
          URL
        </EditorToolLabel>
        <Input v-model="imageValue.src" />
      </div>
      <div class="flex gap-4">
        <div class="w-full">
          <EditorToolLabel type="secondary">
            Width
          </EditorToolLabel>
          <Input
            v-model="imageValue.width"
            type="number"
          />
        </div>
        <div class="w-full">
          <EditorToolLabel type="secondary">
            Height
          </EditorToolLabel>
          <Input
            v-model="imageValue.height"
            type="number"
          />
        </div>
      </div>
      <div>
        <EditorToolLabel type="secondary">
          Alternate Text
        </EditorToolLabel>
        <Input v-model="imageValue.alt" />
      </div>
      <div>
        <EditorToolLabel type="secondary">
          Image Link
        </EditorToolLabel>
        <Input v-model="imageValue.link" />
      </div>
    </div>
  </div>
</template>
