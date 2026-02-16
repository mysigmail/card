<script setup lang="ts">
import type { BlockPreset } from '@/features/editor/model'
import Sortable from 'sortablejs'
import { onMounted, ref } from 'vue'
import { useCanvas } from '@/features/editor/model'
import { addGhost, removeGhost } from '@/features/email-preview'
import { useBlockLibrary } from './use-block-library'

interface Props {
  components: BlockPreset[]
}

const props = defineProps<Props>()

const { addComponent } = useCanvas()
const { showLibrary } = useBlockLibrary()

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
      showLibrary.value = false
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
    data-slot="block-library-item"
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
