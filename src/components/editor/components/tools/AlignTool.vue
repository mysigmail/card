<script setup lang="ts">
import type { AlignTool } from '@/types/editor'
import { ref, watch } from 'vue'
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

<style lang="scss" scoped>
.is-active {
  svg {
    fill: #fff;
  }
}
::v-deep .el-radio-button {
  &__inner {
    height: 32px;
    svg {
      position: relative;
      top: -1px;
    }
  }
}
</style>
