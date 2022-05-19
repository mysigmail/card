<template>
  <div class="color-picker-tool">
    <EditorToolLabel>{{ title }}</EditorToolLabel>
    <div class="body">
      <ElColorPicker
        v-model="localValue"
        color-format="hex"
      />
      <ElInput v-model="localValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useComponentsStore } from '@/store/components'
import { ref, watch } from 'vue'

interface Props {
  id: string
  value: string
  title: string
}

const props = defineProps<Props>()

const componentsStore = useComponentsStore()

const localValue = ref(props.value)

watch(localValue, () => {
  componentsStore.updateToolById<string>(props.id, 'value', localValue.value)
})
</script>

<style lang="scss" scoped>
.body {
  display: flex;
  gap: var(--spacing-sm);
}
</style>
