<script setup lang="ts">
import type { SelectTool } from '@/types/editor'
import { ref, watch } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  title: string
  value: SelectTool['value']
  options: SelectTool['options']
}

const props = defineProps<Props>()

const { updateToolById } = useComponentsStore()
const localValue = ref(props.value)

watch(
  () => props.value,
  () => {
    localValue.value = props.value
  },
)

watch(localValue, () => {
  updateToolById<SelectTool>(props.id, 'value', localValue.value)
})
</script>

<template>
  <div class="input-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="body">
      <ElSelect
        v-model="localValue"
        style="width: 100%"
      >
        <ElOption
          v-for="option in options"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
