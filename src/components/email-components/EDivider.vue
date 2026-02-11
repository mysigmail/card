<script setup lang="ts">
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  group: string
  color?: string
}

defineProps<Props>()

const { editableId, editableToolName } = useComponentsStore()
</script>

<template>
  <MRow>
    <MColumn
      class="p-hover-tools"
      :class="{
        'p-edit-tool': editableId === id && editableToolName === group,
      }"
    >
      <MHr :style="{ borderColor: color }" />
    </MColumn>
  </MRow>
</template>

<style scoped></style>
