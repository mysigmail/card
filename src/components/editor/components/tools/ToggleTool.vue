<template>
  <div class="toggle-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <ElSwitch v-model="localValue" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useComponentsStore } from '@/store/components'
import type { ToggleTool } from '@/types/editor'

interface Props {
  id: string
  value: boolean
  title: string
}

const props = defineProps<Props>()

const { updateToolById } = useComponentsStore()

const localValue = ref(props.value)

watch(localValue, () => {
  updateToolById<ToggleTool>(props.id, 'value', localValue.value)
})
</script>

<style lang="scss" scoped></style>
