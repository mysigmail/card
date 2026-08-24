<script setup lang="ts">
import type { BackgroundImageTool, ImageTool } from '@/features/editor/model'
import { MoveHorizontal, MoveVertical } from 'lucide-vue-next'
import { computed, nextTick, reactive, watch } from 'vue'
import { Input } from '@/shared/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'
import ScrubbableNumberField from './number/ScrubbableNumberField.vue'

type UnifiedImageValue = ImageTool['value'] | BackgroundImageTool['value']

interface Props {
  id: string
  type: 'image' | 'bgImage' | 'imageContent' | 'imageDimensions'
  value: UnifiedImageValue
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:value', value: UnifiedImageValue): void }>()
const localValue = reactive<UnifiedImageValue>({ ...props.value })
const isBackground = computed(() => props.type === 'bgImage')
const isContent = computed(() => props.type === 'image' || props.type === 'imageContent')
const isDimensions = computed(() => props.type === 'image' || props.type === 'imageDimensions')
let syncing = false

const imageValue = localValue as ImageTool['value']
const backgroundValue = localValue as BackgroundImageTool['value']

watch(
  localValue,
  () => {
    if (syncing)
      return
    emit('update:value', { ...localValue })
  },
  { deep: true },
)

watch(
  () => props.value,
  async (value) => {
    syncing = true
    for (const key of Object.keys(localValue)) delete (localValue as Record<string, unknown>)[key]
    Object.assign(localValue, value)
    await nextTick()
    syncing = false
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
      <EditorToolLabel level="parameter">
        URL
      </EditorToolLabel>
      <Input
        v-model="backgroundValue.url"
        size="sm"
        placeholder="Image URL"
      />

      <template v-if="backgroundValue.url">
        <EditorToolLabel level="parameter">
          Repeat
        </EditorToolLabel>
        <ToggleGroup
          v-model="backgroundValue.repeat"
          type="single"
          size="sm"
        >
          <ToggleGroupItem
            value="no-repeat"
            variant="outline"
          >
            No Repeat
          </ToggleGroupItem>
          <ToggleGroupItem
            value="repeat"
            variant="outline"
          >
            Repeat
          </ToggleGroupItem>
        </ToggleGroup>

        <EditorToolLabel level="parameter">
          Size
        </EditorToolLabel>
        <ToggleGroup
          v-model="backgroundValue.size"
          type="single"
          size="sm"
        >
          <ToggleGroupItem
            value="unset"
            variant="outline"
          >
            None
          </ToggleGroupItem>
          <ToggleGroupItem
            value="cover"
            variant="outline"
          >
            Cover
          </ToggleGroupItem>
          <ToggleGroupItem
            value="contain"
            variant="outline"
          >
            Contain
          </ToggleGroupItem>
        </ToggleGroup>

        <EditorToolLabel level="parameter">
          Position
        </EditorToolLabel>
        <ToggleGroup
          v-model="backgroundValue.position"
          type="single"
          size="sm"
        >
          <ToggleGroupItem
            value="top"
            variant="outline"
          >
            Top
          </ToggleGroupItem>
          <ToggleGroupItem
            value="bottom"
            variant="outline"
          >
            Bottom
          </ToggleGroupItem>
          <ToggleGroupItem
            value="center"
            variant="outline"
          >
            Center
          </ToggleGroupItem>
          <ToggleGroupItem
            value="left"
            variant="outline"
          >
            Left
          </ToggleGroupItem>
          <ToggleGroupItem
            value="right"
            variant="outline"
          >
            Right
          </ToggleGroupItem>
        </ToggleGroup>
      </template>
    </div>
    <div
      v-else
      class="body"
    >
      <div v-if="isContent">
        <EditorToolLabel level="parameter">
          URL
        </EditorToolLabel>
        <Input
          v-model="imageValue.src"
          size="sm"
        />
      </div>
      <div
        v-if="isDimensions"
        class="flex gap-4"
      >
        <div class="w-full">
          <EditorToolLabel level="parameter">
            Width
          </EditorToolLabel>
          <ScrubbableNumberField
            v-model="imageValue.width"
            :default-value="120"
            label="Image width"
            :min="1"
            :max="9999"
            :step="1"
          >
            <template #prefix>
              <MoveHorizontal />
            </template>
          </ScrubbableNumberField>
        </div>
        <div class="w-full">
          <EditorToolLabel level="parameter">
            Height
          </EditorToolLabel>
          <ScrubbableNumberField
            v-model="imageValue.height"
            :default-value="120"
            label="Image height"
            :min="1"
            :max="9999"
            :step="1"
          >
            <template #prefix>
              <MoveVertical />
            </template>
          </ScrubbableNumberField>
        </div>
      </div>
      <div v-if="isContent">
        <EditorToolLabel level="parameter">
          Alternate Text
        </EditorToolLabel>
        <Input
          v-model="imageValue.alt"
          size="sm"
        />
      </div>
      <div v-if="isContent">
        <EditorToolLabel level="parameter">
          Image Link
        </EditorToolLabel>
        <Input
          v-model="imageValue.link"
          size="sm"
        />
      </div>
    </div>
  </div>
</template>
