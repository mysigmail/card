<template>
  <div class="padding-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="padding-tool__inputs">
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
          <ElInput
            v-model="localValue[index]"
            type="number"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useComponentsStore } from '@/store/components'
import type { PaddingTool } from '@/types/editor'

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

<style lang="scss" scoped>
.padding-tool {
  &__inputs {
    display: flex;
    gap: var(--spacing-sm);
  }
}
</style>
