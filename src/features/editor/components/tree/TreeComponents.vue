<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useComponentsStore } from '@/features/editor/model'

const {
  installed,
  sidebarActiveTab,
  treeScrollTarget,
  treeScrollRequestId,
  isCanvasBlockInstance,
} = useComponentsStore()

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
      class="p-4 text-muted-foreground"
    >
      The component tree is empty
    </div>
  </div>
</template>
