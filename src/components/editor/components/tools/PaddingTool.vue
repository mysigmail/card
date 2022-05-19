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
import { useComponentsStore } from '@/store/components'
import type { PaddingToolValue } from '@/types/editor'
import { ref, watch } from 'vue'

interface Props {
  id: string
  value: PaddingToolValue
  title: string
}

const props = defineProps<Props>()

const componentsStore = useComponentsStore()

const localValue = ref<PaddingToolValue>([...props.value])

watch(
  localValue,
  () => {
    const value = localValue.value.map(i => Number(i)) as PaddingToolValue
    componentsStore.updateToolById<PaddingToolValue>(props.id, 'value', value)
  },
  { deep: true }
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
