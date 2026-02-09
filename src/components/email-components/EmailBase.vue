<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { MContainer } from '@mysigmail/vue-email-components'
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
