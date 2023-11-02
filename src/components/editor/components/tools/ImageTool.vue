<template>
  <div class="image-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="body">
      <div>
        <EditorToolLabel type="secondary">
          URL
        </EditorToolLabel>
        <ElInput v-model="localValue.src" />
      </div>
      <div class="dimensions">
        <div style="width: 100%">
          <EditorToolLabel type="secondary">
            Width
          </EditorToolLabel>
          <ElInput
            v-model="localValue.width"
            type="number"
          />
        </div>
        <div style="width: 100%">
          <EditorToolLabel type="secondary">
            Height
          </EditorToolLabel>
          <ElInput
            v-model="localValue.height"
            type="number"
          />
        </div>
      </div>
      <div>
        <EditorToolLabel type="secondary">
          Alternate Text
        </EditorToolLabel>
        <ElInput v-model="localValue.alt" />
      </div>
      <div>
        <EditorToolLabel type="secondary">
          Image Link
        </EditorToolLabel>
        <ElInput v-model="localValue.link" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { ImageTool } from '@/types/editor'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  value: ImageTool['value']
  title: string
}

const props = defineProps<Props>()

const componentsStore = useComponentsStore()

const localValue = reactive<ImageTool['value']>(props.value)

watch(
  localValue,
  () => {
    componentsStore.updateToolById<ImageTool>(
      props.id,
      'value',
      localValue,
    )
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
.dimensions {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
