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
      class="item"
    >
      <div class="name">
        {{ i.label }}
      </div>
      <div class="preview">
        <img :src="i.preview">
      </div>
    </div>
    <span
      v-if="components.length === 0"
      class="item"
    > Not implemented yet </span>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Sortable from 'sortablejs'
import { useList } from './composables'
import type { Component } from '@/types/editor'
import { useComponentsStore } from '@/store/components'
import { addGhost, removeGhost } from '@/components/email-components/utils'

interface Props {
  components: Component[]
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

<style lang="scss" scoped>
.component-list-items {
  .item {
    margin-bottom: var(--spacing-sm);
  }
  .name {
    margin-bottom: var(--spacing-xs);
  }
  .preview {
    position: relative;
    img {
      width: 100%;
      border-radius: 3px;
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
