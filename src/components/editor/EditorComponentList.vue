<template>
  <div
    class="component-list"
    @mouseleave="onMouseLeave"
  >
    <div class="component-list__group">
      <div
        v-for="(i, index) in componentsStore.list"
        :key="index"
        class="component-list__item"
        :class="{ 'component-list__item--active': hovered === index }"
        @mouseover="onMouseOver(index)"
      >
        {{ i.name }}
      </div>
    </div>
    <div
      ref="panel"
      class="component-list__panel"
      :class="{ 'component-list__panel--open': isShowComponents }"
      @mousemove="onMouseOverPanel"
    >
      <div
        v-for="(i, index) in selectedComponents"
        :key="index"
        class="component-list__item-sub"
      >
        <div class="component-list__item-sub__name">
          {{ i.label }}
        </div>
        <div class="component-list__preview">
          <img :src="i.preview">
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useComponentsStore } from '@/store/components'
import { computed, ref } from 'vue'

const componentsStore = useComponentsStore()

const hovered = ref<number>(0)
const isShowComponents = ref(true)

const selectedComponents = computed(() => {
  if (hovered.value === undefined) return []
  return componentsStore.list[hovered.value].components
})

const onMouseOver = (index: number) => {
  hovered.value = index
  isShowComponents.value = true
}

const onMouseOverPanel = () => {}

const onMouseLeave = () => {
  isShowComponents.value = false
}
</script>

<style lang="scss" scoped>
.component-list {
  height: 100%;
  width: 100%;
  &__group {
    position: relative;
    height: 100%;
    background-color: #fff;
    z-index: 1010;
  }
  &__item {
    $r: &;
    padding: var(--spacing-sm);
    position: relative;
    cursor: default;
    font-size: var(--text-md2);
    &-name {
      font-size: 14px;
    }
    &--active {
      background-color: #f5f5f5;
    }
    &-sub {
      margin-bottom: 15px;
      position: relative;
      &__name {
        font-size: 14px;
        margin-bottom: 10px;
      }
    }
  }
  &__panel {
    background-color: #f5f5f5;
    padding: 20px;
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 10;
    border-right: 1px solid var(--color-border);
    box-shadow: 20px 0px 20px rgba(0, 0, 0, 0.1);
    width: 300px;
    top: var(--header-height);
    left: -130px;
    transition: all 0.3s ease;
    opacity: 0;
    overflow: hidden;
    &--open {
      opacity: 1;
      left: var(--editor-component-list-width);
    }
  }
  &__preview {
    position: relative;
    img {
      width: 100%;
      border-radius: 3px;
      box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
