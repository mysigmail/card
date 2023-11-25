<template>
  <div class="align-tool">
    <EditorToolLabel>{{ title }}</EditorToolLabel>
    <ElRadioGroup v-model="localValue">
      <ElRadioButton label="left">
        <UniconsAlignLeft />
      </ElRadioButton>
      <ElRadioButton label="center">
        <UniconsAlignCenter />
      </ElRadioButton>
      <ElRadioButton label="right">
        <UniconsAlignRight />
      </ElRadioButton>
    </ElRadioGroup>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AlignTool } from '@/types/editor'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  title: string
  value: AlignTool['value']
}

const props = defineProps<Props>()

const localValue = ref(props.value)

const { updateToolById } = useComponentsStore()

watch(localValue, () => {
  updateToolById<AlignTool>(props.id, 'value', localValue.value)
})
</script>

<style lang="scss" scoped></style>

<style lang="scss">
.el-radio-button {
  &.is-active {
    svg {
      fill: #fff;
    }
  }
}
</style>
