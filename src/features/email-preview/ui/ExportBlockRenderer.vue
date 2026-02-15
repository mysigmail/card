<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { BlockNode } from '@/entities/block'
import { MContainer } from '@mysigmail/vue-email-components'
import { computed } from 'vue'
import ExportBlockRendererRowNode from '@/features/email-preview/ui/ExportBlockRendererRowNode.vue'

interface Props {
  block: BlockNode
}

const props = defineProps<Props>()

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
</script>

<template>
  <MContainer>
    <div :style="blockStyle">
      <ExportBlockRendererRowNode
        v-for="row in block.rows"
        :key="row.id"
        :row="row"
      />
    </div>
  </MContainer>
</template>
