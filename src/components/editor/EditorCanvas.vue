<template>
  <MHtml class="p-html">
    <MPreview :text="general.previewText" />
    <MBody
      :style="style"
      class="p-body"
    >
      <MContainer :style="container">
        <div
          ref="listRef"
          :class="{
            'p-is-empty': installed.length === 0,
          }"
        >
          <template
            v-for="(i, index) in installed"
            :key="i.id"
          >
            <Component
              :is="components[i.name]"
              :id="i.id"
              :data-name="i.label"
              :label="i.label"
              :index="index"
              :tools="i.tools"
            />
          </template>
        </div>
      </MContainer>
    </MBody>
  </MHtml>
</template>

<script setup lang="ts">
import {
  MBody,
  MContainer,
  MHtml,
  MPreview,
} from '@mysigmail/vue-email-components'
import type { CSSProperties } from 'vue'
import { computed, onMounted, ref } from 'vue'
import Sortable from 'sortablejs'
import { addGhost, removeGhost } from '../email-components/utils'
import { useComponentsStore } from '@/store/components'

import Menu1 from '@/components/email-components/menu/Menu1.vue'
import Menu2 from '@/components/email-components/menu/Menu2.vue'
import Menu3 from '@/components/email-components/menu/Menu3.vue'
import Menu4 from '@/components/email-components/menu/Menu4.vue'

const { installed, isDragging, moveComponent, general } = useComponentsStore()

const components: Record<string, any> = {
  Menu1,
  Menu2,
  Menu3,
  Menu4,
}

const listRef = ref<HTMLElement>()

const container: CSSProperties = {
  position: 'relative',
}

const style = computed<CSSProperties>(() => {
  return {
    backgroundImage: general.background.image
      ? `url(${general.background.image})`
      : '',
    backgroundRepeat: general.background.repeat,
    backgroundColor: general.background.color,
    backgroundSize: general.background.size,
    backgroundPosition: general.background.position,
    fontFamily: general.font,
    padding: general.padding.map(i => `${i}px`).join(' '),
  }
})

function initSortable() {
  Sortable.create(listRef.value!, {
    group: 'components',
    animation: 150,
    ghostClass: 'p-ghost',
    swapThreshold: 0.5,
    onStart() {
      isDragging.value = true
    },
    onEnd() {
      removeGhost()
      isDragging.value = false
    },
    onUpdate(e) {
      if (e.oldIndex === undefined || e.newIndex === undefined)
        return
      moveComponent(e.oldIndex, e.newIndex)
    },
    setData(dataTransfer, el) {
      const name = el.getAttribute('data-name')
      addGhost(dataTransfer, name!)
    },
  })
}

onMounted(() => {
  initSortable()
})
</script>

<style lang="scss" scoped></style>
