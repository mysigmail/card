<template>
  <div
    class="app-collapse-item"
    :class="{ 'is-bordered': rootType === 'bordered' }"
  >
    <div
      class="header"
      @click="onShow"
    >
      <div class="title">
        {{ title }}
      </div>
      <UniconsAngleRight
        class="icon"
        :class="{ 'is-show': isShow }"
      />
    </div>
    <div
      v-if="isShow"
      class="body"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'

interface Props {
  title: string
}

defineProps<Props>()

const rootType = inject<'default' | 'bordered'>('type')

const isShow = ref(false)

const onShow = () => {
  isShow.value = !isShow.value
}
</script>

<style lang="scss" scoped>
.app-collapse-item {
  padding: 0 var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  .is-bordered {
    border: 1px solid var(--color-border);
    margin-bottom: var(--spacing-xs);
    border-radius: 3px;
  }
  .header {
    padding: var(--spacing-sm) 0;
    display: flex;
    cursor: pointer;
    user-select: none;
    .title {
      flex-grow: 1;
      font-weight: bold;
      text-transform: uppercase;
      color: var(--color-contrast-high);
    }
    .icon {
      fill: var(--color-contrast-middle);
      &.is-show {
        transform: rotate(90deg);
      }
    }
  }
  .body {
    padding-bottom: var(--spacing-xs);
  }
}
</style>
