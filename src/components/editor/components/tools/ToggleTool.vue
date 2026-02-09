<script setup lang="ts">
import type { ToggleTool } from '@/types/editor'
import { ref, watch } from 'vue'
import { useComponentsStore } from '@/store/components'

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

<template>
  <div class="toggle-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <ElSwitch v-model="localValue" />
  </div>
</template>

<style lang="scss" scoped></style>
