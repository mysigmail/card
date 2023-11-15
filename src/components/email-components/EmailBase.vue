<template>
  <MContainer
    class="p-container main-container"
    :class="{
      'is-editable': editableIndex === props.index,
    }"
    :style="style"
    @mouseover="onMouseOver"
    @mouseleave="showOverflow = false"
  >
    <MRow class="main-row">
      <slot />
    </MRow>
    <TheOverflow
      :show="isShowOverflow"
      :index="index"
    />
  </MContainer>
</template>

<script setup lang="ts">
import { MContainer, MRow } from '@mysigmail/vue-email-components'
import type { CSSProperties } from 'vue'
import { computed, ref } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  index: number
}

const props = defineProps<Props>()

const { isDragging, editableIndex } = useComponentsStore()
const showOverflow = ref(false)

const isShowOverflow = computed(() => {
  if (editableIndex.value === props.index)
    return false
  return !isDragging.value && showOverflow.value
})

function onMouseOver() {
  if (editableIndex.value === props.index)
    return
  showOverflow.value = true
}

const style: CSSProperties = {
  position: 'relative',
}
</script>
