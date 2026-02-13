<script setup lang="ts">
import { MenuAim } from '@mysigmail/menu-aim'
import { Plus } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useList } from '@/components/editor/components/list/composables'
import { useComponentsStore } from '@/store/components'

const { list, addBlockToCanvas } = useComponentsStore()
const { showList } = useList()

const hovered = ref<number>()

const menuRef = ref<HTMLElement>()

let menu: MenuAim

onMounted(() => {
  menu = new MenuAim(menuRef.value!, {
    rowSelector: '.item',
    activate: (row: HTMLElement) => {
      hovered.value = Number(row.dataset.index)
      showList.value = true
    },
    deactivate: () => {
      showList.value = false
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
    class="h-full select-none bg-background"
    @mouseleave="onMouseLeave"
  >
    <div class="relative z-30 flex h-full flex-col justify-between bg-background">
      <div
        ref="menuRef"
        class="relative z-10"
      >
        <div
          v-for="(i, index) in list"
          :key="index"
          class="item relative cursor-default py-3 px-4 text-base"
          :data-index="index"
          :class="{ 'bg-muted': hovered === index }"
        >
          {{ i.name }}
        </div>
      </div>
      <div
        class="cursor-pointer border-t border-border px-4 py-3 text-base hover:bg-muted flex items-center gap-2"
        @click="addBlockToCanvas('Block')"
      >
        <Plus class="size-4" />
        Empty Block
      </div>
    </div>
    <div
      class="fixed top-[var(--header-height)] bottom-0 z-10 w-[300px] overflow-y-auto border-r border-border bg-muted p-5 shadow-[20px_0_20px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out"
      :class="
        showList
          ? 'left-[var(--editor-component-list-width)] opacity-100'
          : '-left-[100px] opacity-0 pointer-events-none'
      "
    >
      <template
        v-for="(c, idx) in list"
        :key="idx"
      >
        <ComponentListItem
          v-show="hovered === idx"
          :components="c.components"
        />
      </template>
    </div>
  </div>
</template>
