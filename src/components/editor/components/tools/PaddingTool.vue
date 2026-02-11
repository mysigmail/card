<script setup lang="ts">
import type { PaddingTool } from '@/types/editor'
import { ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  value: PaddingTool['value']
  title: string
  autoUpdate?: boolean
}

interface Emits {
  (e: 'update:value', value: PaddingTool['value']): void
}

const props = withDefaults(defineProps<Props>(), {
  autoUpdate: true,
})

const emit = defineEmits<Emits>()

const { updateToolById } = useComponentsStore()

const localValue = ref<PaddingTool['value']>([...props.value])

watch(
  localValue,
  () => {
    if (props.autoUpdate) {
      const value = localValue.value.map(i => Number(i)) as PaddingTool['value']
      updateToolById<PaddingTool>(props.id, 'value', value)
    }
    else {
      emit('update:value', localValue.value)
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="padding-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="flex gap-4">
      <div
        v-for="(i, index) in localValue"
        :key="index"
        class="item"
      >
        <div class="title">
          <EditorToolLabel type="secondary">
            <span v-if="index === 0">Top</span>
            <span v-if="index === 1">Right</span>
            <span v-if="index === 2">Bottom</span>
            <span v-if="index === 3">Left</span>
          </EditorToolLabel>
        </div>
        <div class="body">
          <Input
            v-model="localValue[index]"
            type="number"
          />
        </div>
      </div>
    </div>
  </div>
</template>
