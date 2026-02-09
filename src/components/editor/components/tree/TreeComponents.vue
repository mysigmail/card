<script setup lang="ts">
import { useComponentsStore } from '@/store/components'

const { installedToolsByGroup, installed } = useComponentsStore()
</script>

<template>
  <div class="tree-components">
    <TreeComponentsItem
      v-for="(i, index) in installedToolsByGroup"
      :id="i.id"
      :key="i.id"
      :index="index"
      :name="i.name"
      :tools="i.tools"
    />
    <div
      v-if="!installed.length"
      class="empty"
    >
      The component tree is empty
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tree-components {
  .empty {
    padding: var(--spacing-sm);
    color: var(--color-grey-600);
  }
}
</style>
