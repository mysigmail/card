<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { BlockNode } from '@/entities/block'
import { MContainer } from '@mysigmail/vue-email-components'
import { computed } from 'vue'
import { useCanvas, useSelection } from '@/features/editor'
import BlockRendererRowNode from '@/features/email-preview/ui/BlockRendererRowNode.vue'

interface Props {
  id: string
  index: number
  block: BlockNode
}

const props = defineProps<Props>()

const { editableIndex } = useCanvas()
const { selectBlock } = useSelection()

const blockStyle = computed<CSSProperties>(() => {
  const s = props.block.settings
  const style: CSSProperties = {}

  if (s.backgroundColor)
    style.backgroundColor = s.backgroundColor

  if (s.spacing?.padding) {
    const [t, r, b, l] = s.spacing.padding
    style.padding = `${t}px ${r}px ${b}px ${l}px`
  }

  if (s.backgroundImage?.url) {
    style.backgroundImage = `url(${s.backgroundImage.url})`
    style.backgroundRepeat = s.backgroundImage.repeat
    style.backgroundSize = s.backgroundImage.size
    style.backgroundPosition = s.backgroundImage.position
  }

  return style
})

function onPreviewClick(event: MouseEvent) {
  const target = event.target

  if (!(target instanceof Element))
    return

  if (target.closest('a'))
    event.preventDefault()
}

function selectBlockNode() {
  selectBlock(props.block.id)
}
</script>

<template>
  <MContainer
    class="p-container main-container"
    :class="{
      'is-editable': editableIndex === props.index,
    }"
    :style="{ position: 'relative' }"
    @click.capture="onPreviewClick"
  >
    <div
      :style="blockStyle"
      class="p-block-renderer"
      :data-node-id="`block:${block.id}`"
      @click.stop="selectBlockNode"
    >
      <BlockRendererRowNode
        v-for="row in block.rows"
        :key="row.id"
        :block-id="block.id"
        :row="row"
      />
    </div>
  </MContainer>
</template>
