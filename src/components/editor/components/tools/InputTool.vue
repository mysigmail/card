<template>
  <div class="input-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="body">
      <ElInput
        v-model="localValue"
        :placeholder="placeholder"
        :type="type"
        @input="onInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useComponentsStore } from '@/store/components'
import type { InputTool } from '@/types/editor'

interface Props {
  id: string
  value: InputTool['value']
  type: 'string' | 'number'
  title: string
  placeholder?: string
  updateParentLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'string',
})

const componentsStore = useComponentsStore()

const localValue = ref(props.value)

watch(
  () => props.value,
  () => {
    localValue.value = props.value
  },
  { deep: true },
)

function onInput() {
  componentsStore.updateToolById<InputTool>(
    props.id,
    'value',
    localValue.value,
  )
}
</script>

<style lang="scss" scoped></style>
