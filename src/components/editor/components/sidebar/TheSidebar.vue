<template>
  <div class="sidebar">
    <div class="body">
      <div class="tabs">
        <div
          class="tabs__item"
          :class="{ 'is-active': activeTab === 'components' }"
          @click="activeTab = 'components'"
        >
          <UniconsServer />
        </div>
        <div
          class="tabs__item"
          :class="{ 'is-active': activeTab === 'tree' }"
          @click="activeTab = 'tree'"
        >
          <UniconsListUiAlt />
        </div>
      </div>
      <div class="content">
        <ComponentList v-if="activeTab === 'components'" />
        <TreeComponents v-if="activeTab === 'tree'" />
      </div>
    </div>
    <div class="footer">
      <SidebarFooter />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref<'components' | 'tree'>('components')
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-flow: column;
  border-right: 1px solid var(--color-border);
  .body {
    display: flex;
    flex-grow: 1;
  }
  .footer {
    z-index: 1010;
    background-color: #fff;
    flex-shrink: 0;
  }
  .content {
    width: 100%;
    background-color: #fff;
    height: calc(100vh - var(--header-height) - var(--sidebar-footer-height));
    overflow-y: auto;
  }
  .tabs {
    background-color: #fff;
    position: relative;
    z-index: 1010;
    margin-top: 4px;
    border-right: 1px solid var(--color-border);
    &__item {
      padding: var(--spacing-xs);
      cursor: pointer;
      &.is-active {
        svg {
          fill: var(--color-grey-900);
        }
      }
      svg {
        fill: var(--color-grey-600);
        width: 24px;
        height: 24px;
      }
    }
  }
}
</style>
