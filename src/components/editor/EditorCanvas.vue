<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { MBody, MContainer, MHtml, MPreview } from '@mysigmail/vue-email-components'
import Sortable from 'sortablejs'
import { computed, onMounted, ref } from 'vue'
import SchemaEmailComponent from '@/components/email-components/SchemaEmailComponent.vue'
import { addGhost, removeGhost } from '@/components/email-components/utils'
import { useComponentsStore } from '@/store/components'

const { installed, isDragging, moveComponent, general } = useComponentsStore()

const listRef = ref<HTMLElement>()

const container: CSSProperties = {
  position: 'relative',
}

const style = computed<CSSProperties>(() => {
  return {
    backgroundImage: general.background.image ? `url(${general.background.image})` : '',
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
            <SchemaEmailComponent
              :id="i.id"
              :data-name="i.label"
              :index="index"
              :schema="i.schema"
              :tools="i.tools"
            />
          </template>
        </div>
      </MContainer>
    </MBody>
  </MHtml>
</template>

<style lang="scss" scoped></style>
