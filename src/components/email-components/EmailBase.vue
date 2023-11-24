<template>
  <MContainer
    class="p-container main-container"
    :class="{
      'is-editable': editableIndex === props.index,
    }"
    :style="style"
  >
    <slot />
  </MContainer>
</template>

<script setup lang="ts">
import { MContainer, MRow } from '@mysigmail/vue-email-components'
import type { CSSProperties } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  index: number
}

const props = defineProps<Props>()

const { editableIndex } = useComponentsStore()

const style: CSSProperties = {
  position: 'relative',
}
</script>
