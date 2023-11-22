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
  </div>
</template>

<script setup lang="ts">
import { useComponentsStore } from '@/store/components'

const { installedToolsByGroup } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
