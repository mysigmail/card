<template>
  <MContainer
    class="p-container"
    :class="{
      'is-editable': editableIndex === props.index,
    }"
    :style="style"
    @mouseover="showOverflow = true"
    @mouseleave="showOverflow = false"
  >
    <slot />
    <TheOverflow :show="!isDragging && showOverflow" :index="index" />
  </MContainer>
</template>

<script setup lang="ts">
import { MContainer } from '@mysigmail/vue-email-components'
import type { CSSProperties } from 'vue'
import { ref } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  index: number
}

const props = defineProps<Props>()

const { isDragging, editableIndex } = useComponentsStore()
const showOverflow = ref(false)

const style: CSSProperties = {
  position: 'relative',
}
</script>
