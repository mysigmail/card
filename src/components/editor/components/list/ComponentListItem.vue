<script setup lang="ts">
import type { BlockPreset } from '@/types/editor'
import Sortable from 'sortablejs'
import { onMounted, ref } from 'vue'
import { useList } from '@/components/editor/components/list/composables'
import { addGhost, removeGhost } from '@/components/email-components/utils'
import { useComponentsStore } from '@/store/components'

interface Props {
  components: BlockPreset[]
}

const props = defineProps<Props>()

const { addComponent } = useComponentsStore()

const { showList } = useList()

const listRef = ref<HTMLElement>()

function initSortable() {
  Sortable.create(listRef.value!, {
    group: {
      name: 'components',
      pull: 'clone',
      put: false,
    },
    sort: false,
    onStart: () => {
      showList.value = false
    },
    onEnd: (e) => {
      const componentIndex = Number(e.oldIndex)
      const toIndex = Number(e.newIndex)

      addComponent(props.components[componentIndex], toIndex)

      e.item.remove()
      removeGhost()
    },
    setData: (dataTransfer, el) => {
      const name = el.getAttribute('data-name')
      addGhost(dataTransfer, name!)
    },
  })
}

onMounted(() => {
  initSortable()
})
</script>

<template>
  <div
    ref="listRef"
    class="component-list-items"
  >
    <div
      v-for="i in components"
      :key="i.id"
      :data-id="i.id"
      :data-name="i.label"
      class="item mb-4 cursor-grab active:cursor-grabbing"
    >
      <div class="mb-2">
        {{ i.label }}
      </div>
      <div class="relative">
        <img
          :src="i.preview"
          class="w-full rounded-[3px] shadow-[0_2px_2px_rgba(0,0,0,0.1)]"
        >
      </div>
    </div>
    <span
      v-if="components.length === 0"
      class="item mb-4 cursor-grab active:cursor-grabbing"
    >
      Not implemented yet
    </span>
  </div>
</template>
