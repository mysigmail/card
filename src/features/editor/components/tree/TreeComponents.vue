<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import { nextTick, ref, watch } from 'vue'
import { useCanvas, useSelection } from '@/features/editor/model'

const { installed, isCanvasBlockInstance, insertBlockToCanvas } = useCanvas()

const { sidebarActiveTab, treeScrollTarget, treeScrollRequestId } = useSelection()

const rootRef = ref<HTMLElement>()

function scrollToSelectedNode() {
  if (!rootRef.value || !treeScrollTarget.value)
    return

  const target = rootRef.value.querySelector<HTMLElement>(
    `[data-tree-id="${treeScrollTarget.value}"]`,
  )

  if (!target)
    return

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  })
}

watch(
  [treeScrollRequestId, () => sidebarActiveTab.value],
  async () => {
    if (sidebarActiveTab.value !== 'tree')
      return

    await nextTick()
    await nextTick()
    scrollToSelectedNode()
  },
  { flush: 'post', immediate: true },
)
</script>

<template>
  <div ref="rootRef">
    <div
      class="flex cursor-pointer items-center gap-2 border-b border-border px-4 py-3 text-base hover:bg-muted"
      @click="insertBlockToCanvas('Block')"
    >
      <Plus class="size-4" />
      Empty Block
    </div>
    <template
      v-for="(item, index) in installed"
      :key="item.id"
    >
      <TreeBlockNode
        v-if="isCanvasBlockInstance(item)"
        :id="item.id"
        :index="index"
        :block="item.block"
      />
    </template>
    <div
      v-if="!installed.length"
      class="p-6 text-center text-muted-foreground"
    >
      <p class="mt-1 text-xs">
        Add a new empty block or drag & drop from the catalog.
      </p>
    </div>
  </div>
</template>
