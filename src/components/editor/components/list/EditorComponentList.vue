<template>
  <div
    class="component-list"
    @mouseleave="onMouseLeave"
  >
    <div class="body">
      <div
        ref="menuRef"
        class="items"
      >
        <div
          v-for="(i, index) in list"
          :key="index"
          class="item"
          :data-index="index"
          :class="{ 'is-active': hovered === index }"
        >
          {{ i.name }}
        </div>
      </div>
      <div class="footer">
        <div class="footer__item">
          v{{ version }}&nbsp;•&nbsp;
          <a
            href="https://github.com/mysigmail/card"
            target="_blank"
            rel="noopener noreferrer"
          >GitHub</a>
        </div>
        <div class="footer__item">
          ©{{ year }}&nbsp;•&nbsp;Anton Reshetov
        </div>
      </div>
    </div>
    <div
      class="panel"
      :class="{ 'is-open': showList }"
    >
      <template
        v-for="(c, idx) in list"
        :key="idx"
      >
        <EditorComponentListItem
          v-show="hovered === idx"
          :components="c.components"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { MenuAim } from '@mysigmail/menu-aim'
import { version } from '../../../../../package.json'
import { useList } from './composables'

import { useComponentsStore } from '@/store/components'

const { list } = useComponentsStore()
const { showList } = useList()

const hovered = ref<number>()
const year = new Date().getFullYear()

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

<style lang="scss">
.component-list {
  background-color: #fff;
  .body {
    position: relative;
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    height: 100%;
    background-color: #fff;
    z-index: 1030;
  }
  .items {
    position: relative;
    z-index: 1010;
  }
  .item {
    $r: &;
    padding: var(--spacing-sm);
    position: relative;
    cursor: default;
    font-size: var(--text-md2);
    &.is-active {
      background-color: #f5f5f5;
    }
  }
  .panel {
    background-color: #f5f5f5;
    padding: 20px;
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 1000;
    border-right: 1px solid var(--color-border);
    box-shadow: 20px 0px 20px rgba(0, 0, 0, 0.1);
    width: 300px;
    top: var(--header-height);
    left: -100px;
    transition: all 0.3s ease;
    opacity: 0;
    overflow-y: auto;
    &.is-open {
      opacity: 1;
      left: var(--editor-component-list-width);
    }
  }
  .footer {
    padding: var(--spacing-sm);
    color: var(--color-contrast-medium);
    font-size: var(--text-sm);
    &__item {
      line-height: 18px;
    }
    a {
      color: var(--color-contrast-medium);
    }
  }
}
</style>
