<script setup lang="ts">
import { MenuAim } from '@mysigmail/menu-aim'
import { onMounted, ref } from 'vue'
import { useCanvas } from '@/features/editor/model'
import BlockLibraryItem from './BlockLibraryItem.vue'
import { useBlockLibrary } from './use-block-library'

const { library } = useCanvas()
const { showLibrary } = useBlockLibrary()

const hovered = ref<number>()
const menuRef = ref<HTMLElement>()

let menu: MenuAim

onMounted(() => {
  menu = new MenuAim(menuRef.value!, {
    rowSelector: '.item',
    activate: (row: HTMLElement) => {
      hovered.value = Number(row.dataset.index)
      showLibrary.value = true
    },
    deactivate: () => {
      showLibrary.value = false
      hovered.value = undefined
    },
  })
})

function onMouseLeave() {
  menu.deactivateRow()
}
</script>

<template>
  <div
    data-slot="block-library"
    class="h-full select-none bg-background"
    @mouseleave="onMouseLeave"
  >
    <div class="relative z-30 flex h-full flex-col bg-background">
      <div
        ref="menuRef"
        class="relative z-10"
      >
        <div
          v-for="(i, index) in library"
          :key="index"
          class="item relative cursor-default py-3 px-4 text-base"
          :data-index="index"
          :class="{ 'bg-muted': hovered === index }"
        >
          {{ i.name }}
        </div>
      </div>
    </div>
    <div
      class="fixed top-[var(--header-height)] bottom-0 z-10 w-[300px] overflow-y-auto border-r border-border bg-muted p-5 shadow-[20px_0_20px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out"
      :class="
        showLibrary
          ? 'left-[var(--editor-component-list-width)] opacity-100'
          : '-left-[100px] opacity-0 pointer-events-none'
      "
    >
      <template
        v-for="(c, idx) in library"
        :key="idx"
      >
        <BlockLibraryItem
          v-show="hovered === idx"
          :components="c.components"
        />
      </template>
    </div>
  </div>
</template>
