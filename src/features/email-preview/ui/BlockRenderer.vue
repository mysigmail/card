<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { BlockNode } from '@/entities/block'
import { MContainer } from '@mysigmail/vue-email-components'
import { computed } from 'vue'
import {
  hasPositiveBorderRadius,
  resolveBorderRadiusStyle,
  resolveOpacityStyle,
} from '@/entities/style'
import { useCanvas, useSelection } from '@/features/editor'
import { useInlineTextEditing } from '@/features/editor/components/tools/text/composables/use-inline-text-editing'
import { resolveBorderStyle } from '@/features/email-preview/lib/resolve-border-style'
import BlockRendererRowNode from '@/features/email-preview/ui/BlockRendererRowNode.vue'

interface Props {
  id: string
  index: number
  block: BlockNode
}

const props = defineProps<Props>()

const { editableIndex } = useCanvas()
const { selectBlock } = useSelection()
const { editingAtomId } = useInlineTextEditing()

function blockContainsAtom(atomId?: string) {
  if (!atomId)
    return false
  const visit = (rows: BlockNode['rows']): boolean =>
    rows.some(row =>
      row.cells.some(cell =>
        cell.children.some(child =>
          child.type === 'row' ? visit([child]) : child.id === atomId,
        ),
      ),
    )
  return visit(props.block.rows)
}

const blockVisualStyle = computed<CSSProperties>(() => ({
  opacity: resolveOpacityStyle(
    blockContainsAtom(editingAtomId.value) ? 100 : props.block.settings.opacity,
  ),
}))

const blockChildOpacityCompensation = computed(() =>
  blockContainsAtom(editingAtomId.value) ? resolveOpacityStyle(props.block.settings.opacity) : 1,
)

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
  <div
    class="p-container main-container"
    :class="{
      'is-editable': editableIndex === props.index,
    }"
    :style="{ position: 'relative' }"
    :data-node-id="`block:${block.id}`"
    @click.capture="onPreviewClick"
    @click.stop="selectBlockNode"
  >
    <div
      class="p-block-visual"
      :style="blockVisualStyle"
    >
      <MContainer
        :style="{
          borderRadius: resolveBorderRadiusStyle(block.settings.borderRadius),
          overflow: hasPositiveBorderRadius(block.settings.borderRadius) ? 'hidden' : undefined,
          ...resolveBorderStyle(block.settings.border),
        }"
      >
        <div
          :style="blockStyle"
          class="p-block-renderer"
        >
          <BlockRendererRowNode
            v-for="row in block.rows"
            :key="row.id"
            :block-id="block.id"
            :row="row"
            :inherited-opacity-compensation="blockChildOpacityCompensation"
          />
        </div>
      </MContainer>
    </div>
  </div>
</template>
